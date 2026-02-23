import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQConnection } from './rabbitmq.connection';
import { RabbitMQPublisher } from './rabbitmq.publisher';
import { RabbitMQConsumer } from './rabbitmq.consumer';
import { ConsumeCommand } from './commands/consume.command';
import { InboxMessage } from '../inbox/inbox.entity';
// import { OutboxMessage } from '../outbox/entities/outbox-table.entity';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InboxMessage, Order])],
  providers: [
    RabbitMQConnection,
    RabbitMQPublisher,
    RabbitMQConsumer,
    ConsumeCommand,
  ],
  exports: [RabbitMQPublisher, RabbitMQConnection],
})
export class RabbitMQModule {}
