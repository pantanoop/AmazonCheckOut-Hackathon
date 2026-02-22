import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryColumn('uuid')
  orderId: string;

  @Column('uuid')
  customerId: string;

  @Column({ type: 'jsonb' })
  products: {
    productId: string;
    quantity: number;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  orderTotal: number;

  @Column({
    type: 'enum',
    enum: [
      'PENDING',
      'PLACED',
      'PAYMENT_FAILED',
      'BILLED',
      'READY_TO_SHIP',
      'CANCELED',
    ],
    default: 'PENDING',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
