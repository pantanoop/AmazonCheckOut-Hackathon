"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User1769682512959 = void 0;
const typeorm_1 = require("typeorm");
class User1769682512959 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'Users',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'email',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'name',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'createdAt',
                    type: 'Date',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('Users');
    }
}
exports.User1769682512959 = User1769682512959;
//# sourceMappingURL=1771240753080-User.js.map