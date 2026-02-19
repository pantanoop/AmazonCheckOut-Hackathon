/* eslint-disable */

import { Injectable } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';

@Injectable()
export class RabbitMQPublisher {
  constructor(private readonly rabbit: RabbitMQConnection) {}

  async publish(event: any) {
    const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

    await channel.assertExchange('users.fanout', 'fanout', {
      durable: true,
    });

    const queue = await channel.assertQueue('notification_queue', {
      durable: true,
    })

    await channel.bindQueue(queue.queue, 'users.fanout', '');

    channel.publish('users.fanout', '', Buffer.from(JSON.stringify(event)), {
      persistent: true,
    });

    console.log('Event published:', event.eventId);
  }
}
