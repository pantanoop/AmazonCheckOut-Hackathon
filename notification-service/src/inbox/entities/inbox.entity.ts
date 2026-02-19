import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('inbox_messages')
export class InboxMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  eventId: string;

  @Column()
  eventType: string;

  @Column('jsonb')
  payload: any;
}
