/* eslint-disable */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { DataSource } from 'typeorm';
import { InboxMessage } from '../inbox/inbox.entity';
import { Order } from '../order/entities/order.entity';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  private readonly MAX_IMMEDIATE_RETRIES = Number(
    process.env.SHIPPING_MAX_IMMEDIATE_RETRIES ?? 5,
  );

  private readonly MAX_DELAYED_RETRIES = Number(
    process.env.SHIPPING_MAX_DELAYED_RETRIES ?? 2,
  );

  private readonly RETRY_TTL_MS = Number(
    process.env.SHIPPING_RETRY_TTL_MS ?? 30000,
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

    await channel.assertQueue('shipping.order.queue', {
      durable: true,
    });

    await channel.assertQueue('shipping.order.queue.retry', {
      durable: true,
      messageTtl: this.RETRY_TTL_MS,
      deadLetterExchange: '',
      deadLetterRoutingKey: 'shipping.order.queue',
    });

    await channel.assertQueue('shipping.order.queue.dlq', {
      durable: true,
    });

    await channel.bindQueue(
      'shipping.order.queue',
      'ordering.events',
      'order.placed',
    );

    await channel.bindQueue(
      'shipping.order.queue',
      'ordering.events',
      'order.billed',
    );

    channel.consume(
      'shipping.order.queue',
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
              `Event ${event.eventId} exceeded delayed retries DLQ`,
            );

            channel.sendToQueue(
              'shipping.order.queue.dlq',
              Buffer.from(JSON.stringify(event)),
              { persistent: true },
            );
          } else {
            this.logger.warn(
              `Retrying ${event.eventId} (retry ${retryCount + 1})`,
            );

            channel.sendToQueue(
              'shipping.order.queue.retry',
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

    this.logger.log('Shipping consumer started');
  }

  private async processWithImmediateRetries(event: any) {
    for (let attempt = 1; attempt <= this.MAX_IMMEDIATE_RETRIES; attempt++) {
      try {
        await this.handleMessage(event);
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

  private async handleMessage(event: {
    eventId: string;
    eventType: string;
    payload: {
      orderId: string;
    };
  }) {
    const { eventId, eventType, payload } = event;

    await this.dataSource.transaction(async (manager) => {
      const inboxRepo = manager.getRepository(InboxMessage);
      const outboxRepo = manager.getRepository(OutboxMessage);
      const orderRepo = manager.getRepository(Order);

      const alreadyProcessed = await inboxRepo.findOne({
        where: { messageId: eventId, eventType },
      });

      if (alreadyProcessed) {
        this.logger.warn(`Duplicate ${eventType} ignored for ${eventId}`);
        return;
      }

      const orderPlacedInbox = await inboxRepo.findOne({
        where: { messageId: eventId, eventType: 'order.placed' },
      });

      await inboxRepo.save(
        inboxRepo.create({
          messageId: eventId,
          eventType,
          handler: 'ShippingConsumer',
          status: 'CONSUMED',
        }),
      );

      if (eventType === 'order.billed' && orderPlacedInbox) {
        const order = await orderRepo.findOne({
          where: { orderId: payload.orderId },
        });

        if (!order) {
          await outboxRepo.save(
            outboxRepo.create({
              messageId: eventId,
              eventType: 'order.cancelled',
              status: 'PENDING',
              messagePayload: {
                orderId: payload.orderId,
                message: 'order cancelled',
              },
            }),
          );

          await outboxRepo.save(
            outboxRepo.create({
              messageId: eventId,
              eventType: 'order.refund',
              status: 'PENDING',
              messagePayload: {
                orderId: payload.orderId,
                message: 'order refunded',
              },
            }),
          );
          return;
        }

        await outboxRepo.save(
          outboxRepo.create({
            messageId: eventId,
            eventType: 'order.shipped',
            status: 'PENDING',
            messagePayload: {
              orderId: payload.orderId,
              message: 'order shipped',
            },
          }),
        );
      }
    });
  }
}
