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
    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(OutboxMessage);

      const messages = await repo
        .createQueryBuilder('o')
        .where('o.status = :status', { status: 'PENDING' })
        .limit(10)
        .setLock('pessimistic_write')
        .getMany();

      this.logger.log(`Found ${messages.length} pending messages`);

      for (const message of messages) {
        try {
          this.logger.log(`Publishing message ${message.id}`);

          await this.publisher.publish({
            eventId: message.messageId,
            eventType: message.eventType,
            payload: message.messagePayload,
          });

          message.status = 'PUBLISHED';
          await repo.save(message);

          this.logger.log(`Message ${message.id} published`);
        } catch (err) {
          this.logger.error(`Failed to publish ${message.id}`, err);
        }
      }
    });
  }
}
