"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboxPublisher = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const outbox_table_entity_1 = require("./outbox-table.entity");
let OutboxPublisher = class OutboxPublisher {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getPendingMsg() {
        const outboxRepo = this.dataSource.getRepository(outbox_table_entity_1.OutboxMessage);
        const pendingMsg = await outboxRepo.find({ where: { status: 'PENDING' } });
        return pendingMsg;
    }
    async markPublished(id) {
        const outboxRepo = this.dataSource.getRepository(outbox_table_entity_1.OutboxMessage);
        await outboxRepo.update(id, { status: 'PUBLISHED' });
    }
};
exports.OutboxPublisher = OutboxPublisher;
exports.OutboxPublisher = OutboxPublisher = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], OutboxPublisher);
//# sourceMappingURL=outbox.publisher.js.map