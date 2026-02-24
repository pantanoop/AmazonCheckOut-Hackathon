/* eslint-disable */
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQConnection implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConnection.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private reconnecting = false;

  async getChannel(url: string): Promise<amqp.Channel> {
    if (this.channel) return this.channel;

    this.connection = await amqp.connect(url);

    this.connection.on('close', () => {
      this.logger.warn('RabbitMQ connection closed. Reconnecting...');
      this.reconnect(url);
    });

    this.connection.on('error', (err) => {
      this.logger.error('RabbitMQ error', err);
      this.reconnect(url);
    });

    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange('ordering.events', 'topic', {
      durable: true,
    });

    this.logger.log('RabbitMQ connected');
    return this.channel;
  }

  private async reconnect(url: string) {
    if (this.reconnecting) return;
    this.reconnecting = true;

    setTimeout(async () => {
      try {
        this.channel = null;
        this.connection = null;
        this.reconnecting = false;
        await this.getChannel(url);
      } catch (err) {
        this.logger.error('Reconnect failed, retrying...');
        this.reconnect(url);
      }
    }, 3000);
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
