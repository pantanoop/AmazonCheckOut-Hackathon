import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOrdersTable1771240753083 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'orderId',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'shippingAddress',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
  }
}
