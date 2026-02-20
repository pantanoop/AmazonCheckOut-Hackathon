/* eslint-disable */

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQConnection implements OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private reconnecting = false;

  async getChannel(url: string): Promise<amqp.Channel> {
    if (this.channel) return this.channel;

    this.connection = await amqp.connect(url);

    this.connection.on('close', () => this.reconnect(url));
    this.connection.on('error', () => this.reconnect(url));

    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  private async reconnect(url: string) {
    if (this.reconnecting) return;
    this.reconnecting = true;

    setTimeout(async () => {
      this.channel = null;
      this.connection = null;
      this.reconnecting = false;
      await this.getChannel(url);
    }, 2000);
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
