import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { CreateUserModule } from './create-user/create-user.module';
import { OutboxModule } from './outbox/outbox.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    CreateUserModule,
    OutboxModule,
  ],
})
export class AppModule {}
