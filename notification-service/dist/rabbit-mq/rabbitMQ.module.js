"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQModule = void 0;
const common_1 = require("@nestjs/common");
const rabbitMQ_connection_1 = require("./rabbitMQ.connection");
const rabbitMQ_consumer_1 = require("./rabbitMQ.consumer");
const rabbitMQ_publisher_1 = require("./rabbitMQ.publisher");
let RabbitMQModule = class RabbitMQModule {
};
exports.RabbitMQModule = RabbitMQModule;
exports.RabbitMQModule = RabbitMQModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        providers: [rabbitMQ_connection_1.RabbitMQConnection, rabbitMQ_consumer_1.RabbitMQConsumer, rabbitMQ_publisher_1.RabbitMQPublisher],
        exports: [rabbitMQ_publisher_1.RabbitMQPublisher, rabbitMQ_consumer_1.RabbitMQConsumer],
    })
], RabbitMQModule);
//# sourceMappingURL=rabbitMQ.module.js.map