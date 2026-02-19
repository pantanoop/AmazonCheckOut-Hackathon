/* eslint-disable */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { InboxMessage } from '../inbox/entities/inbox.entity';

@Injectable()
export class RabbitMQConsumer {
  private readonly logger = new Logger(RabbitMQConsumer.name);
  private consuming = false;

  constructor(
    private readonly rabbit: RabbitMQConnection,
    private readonly dataSource: DataSource,
  ) {}

  public async startConsumerLoop() {
    while (!this.consuming) {
      const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

      if (!channel) {
        await this.sleep(3000);
        continue;
      }

      await channel.assertExchange('users.fanout', 'fanout', { durable: true });
      const queue = await channel.assertQueue('notification_queue', {
        durable: true,
      });

      await channel.bindQueue(queue.queue, 'users.fanout', '');

      channel.consume(
        queue.queue,
        async (msg) => {
          if (!msg) return;

          try {
            const event = JSON.parse(msg.content.toString());
            await this.handleMessage(event);
            channel.ack(msg);
          } catch (err) {
            this.logger.error('Processing failed', err);
            channel.nack(msg, false, true);
          }
        },
        { noAck: false },
      );

      this.consuming = true;
      this.logger.log('RabbitMQ consumer started');
    }
  }

  private async handleMessage(event: any) {
    console.log(event, 'event');
    await this.dataSource.transaction(async (manager) => {
      const inboxRepo = manager.getRepository(InboxMessage);

      const exists = await inboxRepo.findOne({
        where: { eventId: event.eventId },
      });

      if (exists) {
        this.logger.warn(`Duplicate event ignored: ${event.eventId}`);
        return;
      }

      const inbox = inboxRepo.create({
        eventId: event.eventId,
        eventType: event.type,
        payload: event.payload,
      });

      await inboxRepo.save(inbox);
      this.logger.log('Event stored in inbox');
      console.log('event', event);
    });
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }
}
