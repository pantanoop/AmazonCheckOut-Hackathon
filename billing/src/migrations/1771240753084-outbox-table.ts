import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class OutboxTable1771240753081 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'outbox_messages',
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
            name: 'messagePayload',
            type: 'jsonb',
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
            default: "'PENDING'",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('outbox_messages');
  }
}
