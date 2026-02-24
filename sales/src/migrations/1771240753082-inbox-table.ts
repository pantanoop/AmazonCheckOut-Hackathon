import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InboxTable1771240753081 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inbox_messages',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'messageId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'handler',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'eventType',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inbox_messages');
  }
}
