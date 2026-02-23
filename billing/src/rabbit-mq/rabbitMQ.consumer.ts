/* eslint-disable */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { DataSource } from 'typeorm';
import { InboxMessage } from '../inbox/inbox.entity';
import { Order } from '../billing/entities/order.entity';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';
import { BillingAccount } from '../billing/entities/billing-account.entity';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQConnection,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  async start() {
    const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

    const queue = await channel.assertQueue('billing.order.queue', {
      durable: true,
    });

    await channel.bindQueue(queue.queue, 'ordering.events', 'order.placed');

    channel.consume(
      queue.queue,
      async (msg) => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString());

          await this.handleMessage(event);

          channel.ack(msg);
        } catch (err) {
          this.logger.error('Message processing failed', err);
          channel.nack(msg, false, true);
        }
      },
      { noAck: false },
    );

    this.logger.log('Billing consumer started');
  }

  private async handleMessage(event: {
    eventId: string;
    eventType: string;
    payload: {
      orderId: string;
      orderTotal: number;
      billingAccountId: string;
    };
  }) {
    const { eventId, eventType, payload } = event;
    const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

    await this.dataSource.transaction(async (manager) => {
      const inboxRepo = manager.getRepository(InboxMessage);
      const outboxRepo = manager.getRepository(OutboxMessage);
      const orderRepo = manager.getRepository(Order);
      const accountRepo = manager.getRepository(BillingAccount);

      const alreadyProcessed = await inboxRepo.findOne({
        where: { messageId: eventId },
      });

      if (alreadyProcessed) {
        this.logger.warn(`Duplicate event ignored: ${eventId}`);
        return;
      }
      const inbox = inboxRepo.create({
        messageId: eventId,
        eventType,
        handler: 'handleMessageConsumer',
        status: 'CONSUMED',
      });

      await inboxRepo.save(inbox);

      const billingAccount = await accountRepo.findOne({
        where: { billingAccountId: payload.billingAccountId },
      });

      if (!billingAccount || payload.orderTotal > billingAccount.balance) {
        await outboxRepo.save(
          outboxRepo.create({
            id: eventId,
            eventType: 'payment.failed',
            status: 'PENDING',
            messagePayload: {
              messageId: eventId,
              orderId: payload.orderId,
              message: 'payment failed',
            },
          }),
        );
        return;
      } else {
        const order = orderRepo.create({
          orderId: payload.orderId,
          billingAccountId: payload.billingAccountId,
        });

        await orderRepo.save(order);

        await outboxRepo.save(
          outboxRepo.create({
            id: eventId,
            eventType: 'order.billed',
            status: 'PENDING',
            messagePayload: {
              messageId: eventId,
              orderId: payload.orderId,
              message: 'order billed',
            },
          }),
        );
      }
    });
  }
}
