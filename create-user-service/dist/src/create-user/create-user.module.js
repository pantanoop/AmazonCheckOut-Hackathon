"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const create_user_service_1 = require("./create-user.service");
const create_user_controller_1 = require("./create-user.controller");
const create_user_entity_1 = require("./entities/create-user.entity");
const outbox_table_entity_1 = require("./entities/outbox-table.entity");
let CreateUserModule = class CreateUserModule {
};
exports.CreateUserModule = CreateUserModule;
exports.CreateUserModule = CreateUserModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([create_user_entity_1.User, outbox_table_entity_1.OutboxMessage])],
        controllers: [create_user_controller_1.CreateUserController],
        providers: [create_user_service_1.CreateUserService],
    })
], CreateUserModule);
//# sourceMappingURL=create-user.module.js.map