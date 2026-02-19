/* eslint-disable */
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQConnection implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConnection.name);

  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private connecting = false;

  async getChannel(url: string): Promise<amqp.Channel | null> {
    if (this.channel) return this.channel;
    if (this.connecting) return null;

    this.connecting = true;

    try {
      this.logger.log('Connecting to RabbitMQ...');
      this.connection = await amqp.connect(url);

      this.connection.on('close', () => this.reset());
      this.connection.on('error', () => this.reset());

      this.channel = await this.connection.createChannel();
      this.logger.log('RabbitMQ connected');

      return this.channel;
    } catch (err) {
      this.logger.warn('RabbitMQ unavailable, retrying...');
      this.reset();
      return null;
    } finally {
      this.connecting = false;
    }
  }

  private reset() {
    this.channel = null;
    this.connection = null;
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
