import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('outbox_messages')
export class OutboxMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  messagePayload: Record<string, any>;

  @Column({ default: 'PENDING' })
  status: string;
}
