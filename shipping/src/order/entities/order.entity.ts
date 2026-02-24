import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryColumn()
  orderId: string;

  @Column()
  shippingAddress: string;

  @Column()
  shippingLabelGenerated: boolean;
}
