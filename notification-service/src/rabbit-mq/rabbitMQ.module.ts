import { Module } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitMQ.connection';
import { RabbitMQConsumer } from './rabbitMQ.consumer';
import { RabbitMQPublisher } from './rabbitMQ.publisher';

@Module({
  imports: [],
  providers: [RabbitMQConnection, RabbitMQConsumer, RabbitMQPublisher],
  exports: [RabbitMQPublisher, RabbitMQConsumer],
})
export class RabbitMQModule {}
