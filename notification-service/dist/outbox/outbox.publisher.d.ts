import { DataSource } from 'typeorm';
import { OutboxMessage } from './outbox-table.entity';
export declare class OutboxPublisher {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    getPendingMsg(): Promise<OutboxMessage[]>;
    markPublished(id: string): Promise<void>;
}
