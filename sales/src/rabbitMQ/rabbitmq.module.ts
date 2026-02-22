// rabbitmq.module.ts
import { Module } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';
import { RabbitMQPublisher } from './rabbitmq.publisher';

@Module({
  providers: [RabbitMQConnection, RabbitMQPublisher],
  exports: [RabbitMQPublisher, RabbitMQConnection],
})
export class RabbitMQModule {}
