import { CommandFactory } from 'nest-commander';
import { CommandRootModule } from './commandroot.module';

async function bootstrap() {
  await CommandFactory.runWithoutClosing(CommandRootModule, ['error', 'log']);
}

bootstrap();
