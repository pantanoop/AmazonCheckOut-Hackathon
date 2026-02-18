"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const dotenv_1 = require("dotenv");
const outbox_table_entity_1 = require("./outbox/outbox-table.entity");
const rabbitMQ_module_1 = require("./rabbit-mq/rabbitMQ.module");
const outbox_publisher_1 = require("./outbox/outbox.publisher");
(0, dotenv_1.config)();
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                entities: [outbox_table_entity_1.OutboxMessage],
                synchronize: false,
            }),
            rabbitMQ_module_1.RabbitMQModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, outbox_publisher_1.OutboxPublisher],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map