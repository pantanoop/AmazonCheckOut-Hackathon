/*eslint-disable*/
import { Command, CommandRunner } from 'nest-commander';
import { RabbitMQConsumer } from '../rabbitMQ.consumer';

@Command({
  name: 'consume',
  description: 'Consume messages from RabbitMQ',
})
export class ConsumeCommand extends CommandRunner {
  constructor(private readonly consumer: RabbitMQConsumer) {
    super();
  }

  async run(): Promise<void> {
    console.log('Starting RabbitMQ consumer...');
    await this.consumer.start();
  }
}
