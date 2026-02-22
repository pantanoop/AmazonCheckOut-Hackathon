/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { RabbitMQConnection } from './rabbitmq.connection';

@Injectable()
export class RabbitMQPublisher {
  constructor(private readonly rabbit: RabbitMQConnection) {}

  async publish(event: { eventId: string; eventType: string; payload: any }) {
    const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL!);

    channel.publish(
      'ordering.events',
      event.eventType,
      Buffer.from(
        JSON.stringify({
          eventId: event.eventId,
          eventType: event.eventType,
          occurredAt: new Date().toISOString(),
          payload: event.payload,
        }),
      ),
      { persistent: true },
    );

    console.log('Event published:', event.eventId);
  }
}
