import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('sales_products')
export class SalesProduct {
  @PrimaryColumn('uuid')
  productId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
