"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxTable1771240753081 = void 0;
const typeorm_1 = require("typeorm");
class OutboxTable1771240753081 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'outbox_messages',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                {
                    name: 'messagePayload',
                    type: 'jsonb',
                    isNullable: false,
                },
                {
                    name: 'status',
                    type: 'varchar',
                    isNullable: false,
                    default: "'PENDING'",
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('outbox_messages');
    }
}
exports.OutboxTable1771240753081 = OutboxTable1771240753081;
//# sourceMappingURL=1771240753081-outbox-table.js.map