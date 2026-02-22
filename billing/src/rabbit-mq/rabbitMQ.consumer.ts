/* eslint-disable */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { InboxMessage } from '../inbox/inbox.entity';
import { Order } from '../billing/entities/order.entity';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  constructor(
    private readonly rabbit: RabbitMQConnection,
    @InjectRepository(InboxMessage)
    private readonly inboxRepo: Repository<InboxMessage>,
    private readonly orderRepo: Repository<Order>,
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

  private async handleMessage(event: any) {
    const { eventId, eventType, payload } = event;

    const exists = await this.inboxRepo.findOne({
      where: { messageId: eventId },
    });

    if (exists) {
      this.logger.warn(`Duplicate event ignored: ${eventId}`);
      return;
    }

    const inbox = this.inboxRepo.create({
      messageId: eventId,
      eventType,
      handler: 'OrderPlacedHandler',
      status: 'CONSUMED',
    });

    await this.inboxRepo.save(inbox);

    const order = this.orderRepo.create({
      orderId: payload.orderId,
      billingAccountId: payload.billingAccountId,
    });

    await this.orderRepo.save(order);

    this.logger.log(`OrderPlaced event stored: ${eventId}`);
  }
}
