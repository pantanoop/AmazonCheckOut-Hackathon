import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { InboxMessage } from '../inbox/entities/inbox.entity';

@Injectable()
export class RabbitMQConsumer {
  private readonly logger = new Logger(RabbitMQConsumer.name);
  private consuming = false;

  constructor(
    private readonly rabbit: RabbitMQConnection,
    @InjectRepository(InboxMessage)
    private readonly inboxRepo: Repository<InboxMessage>,
  ) {}

  public async startConsumerLoop() {
    if (this.consuming) return;

    this.logger.log('Starting RabbitMQ consumer...');
    this.consuming = true;

    while (this.consuming) {
      try {
        const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

        await channel.assertExchange('users.fanout', 'fanout', {
          durable: true,
        });
        const queue = await channel.assertQueue('notification_queue', {
          durable: true,
        });
        await channel.bindQueue(queue.queue, 'users.fanout', '');

        await channel.consume(
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

        this.logger.log('RabbitMQ consumer started successfully');
        break;
      } catch (err) {
        this.logger.error('Failed to start consumer, retrying in 3s...', err);
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
  }

  private async handleMessage(event: any) {
    console.log('Received event:', event);

    try {
      const exists = await this.inboxRepo.findOne({
        where: { eventId: event.eventId },
      });
      if (exists) {
        this.logger.warn(`Duplicate event ignored: ${event.eventId}`);
        return;
      }

      const inbox = this.inboxRepo.create({
        eventId: event.eventId,
        eventType: event.type,
        payload: event.payload,
      });

      await this.inboxRepo.save(inbox);
      this.logger.log(`Event ${event.eventId} stored in inbox`);
    } catch (err) {
      this.logger.error('DB operation failed', err);
      throw err; 
    }
  }
}
