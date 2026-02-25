import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryColumn()
  orderId: string;

  @Column('uuid')
  billingAccountId: string;

  @Column()
  billingAddress: string;
}
