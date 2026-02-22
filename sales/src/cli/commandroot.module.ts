import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxModule } from '../outbox/outbox.module';
import { typeOrmConfig } from '../config/typeorm.config';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), OutboxModule],
})
export class CommandRootModule {}
