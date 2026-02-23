import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxModule } from '../outbox/outbox.module';
import { typeOrmConfig } from '../config/typeorm.config';
import { RabbitMQModule } from '../rabbitMQ/rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), RabbitMQModule, OutboxModule],
})
export class CommandRootModule {}
