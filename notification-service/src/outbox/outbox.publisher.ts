import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OutboxMessage } from './outbox-table.entity';

@Injectable()
export class OutboxPublisher {
  constructor(private readonly dataSource: DataSource) {}

  async getPendingMsg() {
    const outboxRepo = this.dataSource.getRepository(OutboxMessage);
    const pendingMsg = await outboxRepo.find({ where: { status: 'PENDING' } });
    return pendingMsg;
  }

  async markPublished(id: string) {
    const outboxRepo = this.dataSource.getRepository(OutboxMessage);
    await outboxRepo.update(id, { status: 'PUBLISHED' });
  }
}
