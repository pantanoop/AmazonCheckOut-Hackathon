/* eslint-disable */
import { Command, CommandRunner } from 'nest-commander';
import { OutboxProcessor } from '../outbox.processor';

@Command({
  name: 'dispatch',
  description: 'Run publisher for pending outbox messages',
})
export class PublishCommand extends CommandRunner {
  constructor(private publisher: OutboxProcessor) {
    super();
  }

  async run(): Promise<void> {
    console.log('Dispatch command started');
    await this.publisher.processPendingMessages();
    console.log('Dispatch command finished');
  }
}
