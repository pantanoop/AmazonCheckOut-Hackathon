import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '../rabbit-mq/rabbitMQ.module';
import { typeOrmConfig } from '../config/typeorm.config';
import { OutboxModule } from '../outbox/outbox.module';
@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), RabbitMQModule, OutboxModule],
})
export class CommandRootModule {}
