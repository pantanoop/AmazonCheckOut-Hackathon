import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/create-user.entity';
import { OutboxMessage } from './entities/outbox-table.entity';

@Injectable()
export class CreateUserService {
  constructor(private readonly dataSource: DataSource) {}

  async create(createUserDto: { name: string; email: string }) {
    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, createUserDto);
      const savedUser = await manager.save(user);

      const outbox = manager.create(OutboxMessage, {
        messagePayload: {
          userId: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
        },
        status: 'PENDING',
      });

      await manager.save(outbox);

      return savedUser;
    });
  }
}
