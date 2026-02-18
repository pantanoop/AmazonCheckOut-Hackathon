import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserService } from './create-user.service';
import { CreateUserController } from './create-user.controller';
import { User } from './entities/create-user.entity';
import { OutboxMessage } from './entities/outbox-table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, OutboxMessage])],
  controllers: [CreateUserController],
  providers: [CreateUserService],
})
export class CreateUserModule {}
