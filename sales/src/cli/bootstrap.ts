import { CommandFactory } from 'nest-commander';
import { CommandRootModule } from './commandroot.module';

async function bootstrap() {
  await CommandFactory.run(CommandRootModule, ['error', 'log']);
}

void bootstrap();
