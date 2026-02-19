import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from './rabbit-mq/rabbitMQ.module';
import { typeOrmConfig } from './config/typeorm.config';
@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), RabbitMQModule],
})
export class AppModule {}
