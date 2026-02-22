import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBillingAccountsTable1771240753082 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'billing_accounts',
        columns: [
          {
            name: 'billingAccountId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'cardNumber',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('billing_accounts');
  }
}
