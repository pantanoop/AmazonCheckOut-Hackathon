import { Injectable } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitMQ.connection';

@Injectable()
export class RabbitMQPublisher {
  constructor(private readonly rabbit: RabbitMQConnection) {}

  async publish(message: any) {
    const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

    await channel.assertExchange('users.fanout', 'fanout', {
      durable: true,
    });

    channel.publish('users.fanout', '', Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log('Published:', message.id);
  }
}
