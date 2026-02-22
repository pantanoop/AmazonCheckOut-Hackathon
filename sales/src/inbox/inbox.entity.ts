import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('inbox_messages')
export class InboxMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  messageId: string;

  @Column()
  eventType: string;

  @Column()
  status: string;
}
