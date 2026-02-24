import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn('uuid')
  productId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
