/* eslint-disable */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';
import { DataSource } from 'typeorm';
import { InboxMessage } from '../inbox/inbox.entity';
import { Order } from '../order/entities/order.entity';
import { eventNames } from 'process';

@Injectable()
export class RabbitMQConsumer {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQConnection,
    private readonly dataSource: DataSource,
  ) {}

  async start() {
    const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

    await channel.assertExchange('ordering.events', 'topic', {
      durable: true,
    });

    const queue = await channel.assertQueue('sales.billing.queue', {
      durable: true,
    });

    await channel.bindQueue(queue.queue, 'ordering.events', 'payment.failed');
    await channel.bindQueue(queue.queue, 'ordering.events', 'order.billed');
    await channel.bindQueue(queue.queue, 'ordering.events', 'order.shipped');
    await channel.bindQueue(queue.queue, 'ordering.events', 'order.cancelled');

    channel.consume(
      queue.queue,
      async (msg) => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString());
          await this.handleEvent(event);
          channel.ack(msg);
        } catch (error) {
          this.logger.error('Billing event processing failed', error);
          channel.nack(msg, false, true);
        }
      },
      { noAck: false },
    );

    this.logger.log('Sales billing consumer started');
  }

  private async handleEvent(event: {
    eventId: string;
    eventType: string;
    orderId: string;
    message?: string;
  }) {
    console.log('event in sales consumer', event);
    await this.dataSource.transaction(async (manager) => {
      const inboxRepo = manager.getRepository(InboxMessage);

      const alreadyProcessed = await inboxRepo.findOne({
        where: { messageId: event.eventId, eventType: event.eventType },
      });

      if (alreadyProcessed) {
        this.logger.warn(`Duplicate event ignored: ${event.eventId}`);
        return;
      }
      await inboxRepo.save(
        inboxRepo.create({
          messageId: event.eventId,
          eventType: event.eventType,
          handler: 'SalesBillingConsumer',
          status: 'CONSUMED',
        }),
      );

      if (event.eventType === 'payment.failed') {
        await this.handlePaymentFailed(event);
      } else if (event.eventType === 'order.billed') {
        await this.handleOrderBilled(event);
      } else if (event.eventType === 'order.shipped') {
        await this.handleOrderShipped(event);
      } else if (event.eventType === 'order.cancelled') {
        await this.handleOrderCancelled(event);
      } else {
        this.logger.warn(`Unknown billing event: ${event.eventType}`);
      }
    });
  }

  private async handlePaymentFailed(event: any) {
    this.logger.warn(
      `Payment failed → order ${event.payload.orderId} marked PAYMENT_FAILED`,
    );
    const salesOrderRepo = this.dataSource.getRepository(Order);

    await salesOrderRepo.update(
      { orderId: event.payload.orderId },
      { status: 'PAYMENT_FAILED' },
    );
  }

  private async handleOrderCancelled(event: any) {
    this.logger.warn(
      `Payment failed → order ${event.payload.orderId} marked PAYMENT_FAILED`,
    );
    const salesOrderRepo = this.dataSource.getRepository(Order);

    await salesOrderRepo.update(
      { orderId: event.payload.orderId },
      { status: 'ORDER_CANCELLED' },
    );
  }

  private async handleOrderBilled(event: any) {
    this.logger.log(
      `Order billed → order ${event.payload.orderId} marked CONFIRMED`,
    );
    const salesOrderRepo = this.dataSource.getRepository(Order);

    await salesOrderRepo.update(
      { orderId: event.payload.orderId },
      { status: 'BILLED' },
    );
  }
  private async handleOrderShipped(event: any) {
    this.logger.warn(
      `ORDER SHIPPED → order ${event.payload.orderId} marked SHIIPED`,
    );
    const salesOrderRepo = this.dataSource.getRepository(Order);

    await salesOrderRepo.update(
      { orderId: event.payload.orderId },
      { status: 'READY_TO_SHIP' },
    );
  }
}
