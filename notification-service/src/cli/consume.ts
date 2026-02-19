import { CommandFactory } from 'nest-commander';
import { RabbitMQModule } from '../rabbit-mq/rabbitMQ.module';
import { config } from 'dotenv';

async function bootstrap() {
  config();
  await CommandFactory.run(RabbitMQModule, ['error', 'log']);
}

bootstrap();
