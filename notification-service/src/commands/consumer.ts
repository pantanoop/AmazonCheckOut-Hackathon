import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RabbitMQConsumer } from '../rabbit-mq/rabbitMQ.consumer';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const consumer = app.get(RabbitMQConsumer);

  await consumer.consume();
  await app.close();
}
bootstrap();
