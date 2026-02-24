import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('outbox_messages')
export class OutboxMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  messageId: string;

  @Column()
  eventType: string;

  @Column({ type: 'jsonb' })
  messagePayload: Record<string, any>;

  @Column({ default: 'PENDING' })
  status: string;
}
