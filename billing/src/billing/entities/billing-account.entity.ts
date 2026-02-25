import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('billing_accounts')
export class BillingAccount {
  @PrimaryColumn('uuid')
  billingAccountId: string;

  @Column()
  cardNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  balance: number;
}
