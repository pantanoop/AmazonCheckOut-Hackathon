import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { OutboxPublisher } from '../outbox/outbox.publisher';
import { RabbitMQPublisher } from '../rabbit-mq/rabbitMQ.publisher';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const outbox = app.get(OutboxPublisher);
  const publisher = app.get(RabbitMQPublisher);

  const messages = await outbox.getPendingMsg();

  for (const msg of messages) {
    await publisher.publish(msg);
    await outbox.markPublished(msg.id.toString());
  }

  await app.close();
}
bootstrap();
