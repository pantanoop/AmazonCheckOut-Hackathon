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

  constructor(
    private readonly rabbit: RabbitMQConnection,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  async start() {
    const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

    const queue = await channel.assertQueue('shipping.order.queue', {
      durable: true,
    });

    await channel.bindQueue(queue.queue, 'ordering.events', 'order.placed');
    await channel.bindQueue(queue.queue, 'ordering.events', 'order.billed');

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
