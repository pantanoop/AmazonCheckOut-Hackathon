import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OutboxMessage } from './entities/outbox-table.entity';
import { RabbitMQPublisher } from '../rabbitMQ/rabbitmq.publisher';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly publisher: RabbitMQPublisher,
  ) {}

  async processPendingMessages() {
    const repo = this.dataSource.getRepository(OutboxMessage);
    const messages = await repo.find({
      where: { status: 'PENDING' },
      take: 10,
    });

    this.logger.log(`Found ${messages.length} pending messages`);

    for (const message of messages) {
      try {
        this.logger.log(`Publishing message ${message.id}`);
        await this.publisher.publish({
          eventId: message.id,
          type: message.eventType,
          payload: message.messagePayload,
        });

        message.status = 'PUBLISHED';
        await repo.save(message);

        this.logger.log(`Message ${message.id} published`);
      } catch (err) {
        this.logger.error(`Failed to publish ${message.id}`, err.stack);
      }
    }
  }
}
