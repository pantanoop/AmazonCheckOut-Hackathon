import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { RabbitMQConsumer } from './rabbitMQ.consumer';
import { InboxMessage } from '../inbox/entities/inbox.entity';
import { ConsumeCommand } from './commands/consume.command';

@Module({
  imports: [TypeOrmModule.forFeature([InboxMessage])],
  providers: [RabbitMQConnection, RabbitMQConsumer, ConsumeCommand],
  exports: [],
})
export class RabbitMQModule {}
