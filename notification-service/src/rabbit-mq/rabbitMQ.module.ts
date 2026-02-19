import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { RabbitMQConsumer } from './rabbitMQ.consumer';
import { InboxMessage } from '../inbox/entities/inbox.entity';
import { ConsumeCommand } from './commands/consume.command';
import { typeOrmConfig } from '../config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([InboxMessage]),
  ],
  providers: [RabbitMQConnection, RabbitMQConsumer, ConsumeCommand],
})
export class RabbitMQModule {}
