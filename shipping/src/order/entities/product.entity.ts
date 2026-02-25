import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn('uuid')
  productId: string;

  @Column()
  quantity_on_hand: number;
}
