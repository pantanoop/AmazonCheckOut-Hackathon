import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { RabbitMQConsumer } from './rabbitMQ.consumer';
import { RabbitMQPublisher } from './rabbitmq.publisher';
import { InboxMessage } from '../inbox/inbox.entity';
import { ConsumeCommand } from './commands/consume.command';

@Module({
  imports: [TypeOrmModule.forFeature([InboxMessage])],
  providers: [
    RabbitMQConnection,
    RabbitMQConsumer,
    RabbitMQPublisher,
    ConsumeCommand,
  ],
  exports: [RabbitMQPublisher],
})
export class RabbitMQModule {}
