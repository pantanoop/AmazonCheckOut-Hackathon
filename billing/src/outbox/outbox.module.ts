import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxProcessor } from './outbox.processor';
import { OutboxMessage } from './entities/outbox-table.entity';
import { RabbitMQModule } from '../rabbit-mq/rabbitMQ.module';
import { PublishCommand } from './commands/publish.command';

@Module({
  imports: [RabbitMQModule, TypeOrmModule.forFeature([OutboxMessage])],
  providers: [OutboxProcessor, PublishCommand],
})
export class OutboxModule {}
