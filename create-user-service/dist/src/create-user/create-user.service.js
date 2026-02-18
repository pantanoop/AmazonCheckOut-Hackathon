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
exports.CreateUserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const create_user_entity_1 = require("./entities/create-user.entity");
const outbox_table_entity_1 = require("./entities/outbox-table.entity");
let CreateUserService = class CreateUserService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async create(createUserDto) {
        return this.dataSource.transaction(async (manager) => {
            const user = manager.create(create_user_entity_1.User, createUserDto);
            const savedUser = await manager.save(user);
            const outbox = manager.create(outbox_table_entity_1.OutboxMessage, {
                eventType: 'USER_CREATED',
                payload: {
                    userId: savedUser.id,
                    name: savedUser.name,
                    email: savedUser.email,
                },
                status: 'PENDING',
            });
            await manager.save(outbox);
            return savedUser;
        });
    }
};
exports.CreateUserService = CreateUserService;
exports.CreateUserService = CreateUserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], CreateUserService);
//# sourceMappingURL=create-user.service.js.map