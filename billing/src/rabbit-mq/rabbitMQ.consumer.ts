/* eslint-disable */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { DataSource } from 'typeorm';
import { InboxMessage } from '../inbox/inbox.entity';
import { Order } from '../order/entities/order.entity';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';
import { BillingAccount } from '../billing/entities/billing-account.entity';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  private readonly MAX_IMMEDIATE_RETRIES = Number(
    process.env.BILLING_MAX_IMMEDIATE_RETRIES ?? 5,
  );

  private readonly MAX_DELAYED_RETRIES = Number(
    process.env.BILLING_MAX_DELAYED_RETRIES ?? 2,
  );

  private readonly RETRY_TTL_MS = Number(
    process.env.BILLING_RETRY_TTL_MS ?? 30000,
  );

  constructor(
    private readonly rabbit: RabbitMQConnection,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  async start() {
    const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

    await channel.assertQueue('billing.order.queue', { durable: true });

    await channel.assertQueue('billing.order.queue.retry', {
      durable: true,
      messageTtl: this.RETRY_TTL_MS,
      deadLetterExchange: '',
      deadLetterRoutingKey: 'billing.order.queue',
    });

    await channel.assertQueue('billing.order.queue.dlq', { durable: true });

    await channel.bindQueue(
      'billing.order.queue',
      'ordering.events',
      'order.placed',
    );

    await channel.bindQueue(
      'billing.order.queue',
      'ordering.events',
      'order.refund',
    );

    channel.consume(
      'billing.order.queue',
      async (msg) => {
        if (!msg) return;

        const event = JSON.parse(msg.content.toString());
        const retryCount = msg.properties.headers?.['x-retry-count'] ?? 0;

        try {
          await this.processWithImmediateRetries(event);
          channel.ack(msg);
        } catch (err) {
          this.logger.error(`Processing failed for ${event.eventId}`, err);

          channel.ack(msg);

          if (retryCount >= this.MAX_DELAYED_RETRIES) {
            this.logger.error(
              `Event ${event.eventId} exceeded delayed retries → DLQ`,
            );

            channel.sendToQueue(
              'billing.order.queue.dlq',
              Buffer.from(JSON.stringify(event)),
              { persistent: true },
            );
          } else {
            this.logger.warn(
              `Retrying ${event.eventId} (retry ${retryCount + 1})`,
            );

            channel.sendToQueue(
              'billing.order.queue.retry',
              Buffer.from(JSON.stringify(event)),
              {
                persistent: true,
                headers: { 'x-retry-count': retryCount + 1 },
              },
            );
          }
        }
      },
      { noAck: false },
    );

    this.logger.log('Billing consumer started');
  }

  private async processWithImmediateRetries(event: any) {
    for (let attempt = 1; attempt <= this.MAX_IMMEDIATE_RETRIES; attempt++) {
      try {
        if (event.eventType === 'order.placed') {
          await this.handleOrderPlaced(event);
        }

        if (event.eventType === 'order.refund') {
          await this.handleOrderRefund(event);
        }

        return;
      } catch (err) {
        this.logger.warn(
          `Immediate retry ${attempt}/${this.MAX_IMMEDIATE_RETRIES} failed for ${event.eventId}`,
        );

        if (attempt === this.MAX_IMMEDIATE_RETRIES) {
          throw err;
        }
      }
    }
  }

  private async handleOrderPlaced(event: any) {
    const { eventId, eventType, payload } = event;
    this.logger.log(
      'Received event from RabbitMQ: ' + JSON.stringify(event, null, 2),
    );

    await this.dataSource.transaction(async (manager) => {
      const inboxRepo = manager.getRepository(InboxMessage);
      const outboxRepo = manager.getRepository(OutboxMessage);
      const orderRepo = manager.getRepository(Order);
      const accountRepo = manager.getRepository(BillingAccount);

      const alreadyProcessed = await inboxRepo.findOne({
        where: { messageId: eventId, eventType },
      });

      if (alreadyProcessed) {
        this.logger.warn(`Duplicate event ignored: ${eventId}`);
        return;
      }

      const order = await orderRepo.findOne({
        where: { orderId: payload.orderId },
      });

      if (!order) {
        throw new Error(`Order not found: ${payload.orderId}`);
      }

      order.billingAmount = Number(payload.orderTotal);
      await orderRepo.save(order);

      const billingAccount = await accountRepo.findOne({
        where: { billingAccountId: order.billingAccountId },
      });
      this.logger.warn(
        `balance in account : ${billingAccount?.balance},${payload.orderTotal}`,
      );
      if (
        !billingAccount ||
        Number(payload.orderTotal) > Number(billingAccount.balance)
      ) {
        this.logger.warn(
          `balance in account in iff: ${billingAccount?.balance},${payload.orderTotal}`,
        );
        await outboxRepo.save(
          outboxRepo.create({
            messageId: eventId,
            eventType: 'payment.failed',
            status: 'PENDING',
            messagePayload: {
              orderId: payload.orderId,
              reason: 'INSUFFICIENT_BALANCE',
            },
          }),
        );

        await inboxRepo.save(
          inboxRepo.create({
            messageId: eventId,
            eventType,
            handler: 'OrderPlaced',
            status: 'CONSUMED',
          }),
        );

        return;
      }

      billingAccount.balance =
        Number(billingAccount.balance) - Number(payload.orderTotal);
      await accountRepo.save(billingAccount);

      await outboxRepo.save(
        outboxRepo.create({
          messageId: eventId,
          eventType: 'order.billed',
          status: 'PENDING',
          messagePayload: {
            orderId: payload.orderId,
            amount: payload.orderTotal,
          },
        }),
      );

      await inboxRepo.save(
        inboxRepo.create({
          messageId: eventId,
          eventType,
          handler: 'OrderPlaced',
          status: 'CONSUMED',
        }),
      );
    });
  }

  private async handleOrderRefund(event: any) {
    const { eventId, eventType, payload } = event;

    await this.dataSource.transaction(async (manager) => {
      const inboxRepo = manager.getRepository(InboxMessage);
      const orderRepo = manager.getRepository(Order);
      const accountRepo = manager.getRepository(BillingAccount);

      const alreadyProcessed = await inboxRepo.findOne({
        where: { messageId: eventId, eventType },
      });

      if (alreadyProcessed) {
        this.logger.warn(`Duplicate event ignored: ${eventId}`);
        return;
      }

      const order = await orderRepo.findOne({
        where: { orderId: payload.orderId },
      });

      if (!order) {
        throw new Error(`Order not found: ${payload.orderId}`);
      }

      const refundAmount = Number(order.billingAmount);
      order.billingAmount = 0;
      await orderRepo.save(order);

      const billingAccount = await accountRepo.findOne({
        where: { billingAccountId: order.billingAccountId },
      });

      if (!billingAccount) {
        throw new Error('Billing account not found');
      }

      billingAccount.balance =
        Number(billingAccount.balance) + Number(refundAmount);
      await accountRepo.save(billingAccount);

      await inboxRepo.save(
        inboxRepo.create({
          messageId: eventId,
          eventType,
          handler: 'OrderRefunded',
          status: 'CONSUMED',
        }),
      );
    });
  }
}
