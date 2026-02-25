import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateShippingProductTable1771240753082 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'productId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'quantity_on_hand',
            type: 'integer',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
  }
}
