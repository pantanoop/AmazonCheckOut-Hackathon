import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { config } from 'dotenv';
import { OutboxMessage } from './outbox/outbox-table.entity';
import { RabbitMQModule } from './rabbit-mq/rabbitMQ.module';
import { OutboxPublisher } from './outbox/outbox.publisher';

config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [OutboxMessage],
      synchronize: false,
    }),
    RabbitMQModule,
  ],
  controllers: [AppController],
  providers: [AppService, OutboxPublisher],
})
export class AppModule {}
