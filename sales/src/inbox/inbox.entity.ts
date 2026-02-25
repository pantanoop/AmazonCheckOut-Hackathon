import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('inbox_messages')
export class InboxMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  messageId: string;

  @Column()
  eventType: string;

  @Column()
  handler: string;

  @Column()
  status: string;
}
