import { Injectable } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitMQ.connection';

@Injectable()
export class RabbitMQConsumer {
  constructor(private readonly rabbit: RabbitMQConnection) {}

  async consume() {
    const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

    await channel.assertExchange('users.fanout', 'fanout', {
      durable: true,
    });

    const consumerQueue = await channel.assertQueue('notification_queue', {
      durable: true,
    });

    await channel.bindQueue(consumerQueue.queue, 'users.fanout', '');

    channel.consume(consumerQueue.queue, async (msg) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString());
        console.log('Data in consumer(notification-service):', data);
        channel.ack(msg);
      } catch (err) {
        console.error(err);
        channel.nack(msg, false, true);
      }
    });
  }
}
