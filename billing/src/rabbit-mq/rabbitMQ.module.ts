import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { RabbitMQConsumer } from './rabbitMQ.consumer';
import { RabbitMQPublisher } from './rabbitmq.publisher';
import { InboxMessage } from '../inbox/inbox.entity';
import { ConsumeCommand } from './commands/consume.command';
import { Order } from '../order/entities/order.entity';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';
import { BillingAccount } from '../billing/entities/billing-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InboxMessage,
      OutboxMessage,
      Order,
      BillingAccount,
    ]),
  ],
  providers: [
    RabbitMQConnection,
    RabbitMQConsumer,
    RabbitMQPublisher,
    ConsumeCommand,
  ],
  exports: [RabbitMQPublisher],
})
export class RabbitMQModule {}
