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
exports.RabbitMQConsumer = void 0;
const common_1 = require("@nestjs/common");
const rabbitMQ_connection_1 = require("./rabbitMQ.connection");
let RabbitMQConsumer = class RabbitMQConsumer {
    rabbit;
    constructor(rabbit) {
        this.rabbit = rabbit;
    }
    async consume() {
        const channel = await this.rabbit.getChannel(process.env.RABBITMQ_URL);
        await channel.assertExchange('users.fanout', 'fanout', {
            durable: true,
        });
        const consumerQueue = await channel.assertQueue('notification_queue', {
            durable: true,
        });
        await channel.bindQueue(consumerQueue.queue, 'users.fanout', '');
        channel.consume(consumerQueue.queue, async (msg) => {
            if (!msg)
                return;
            try {
                const data = JSON.parse(msg.content.toString());
                console.log('Data in consumer(notification-service):', data);
                channel.ack(msg);
            }
            catch (err) {
                console.error(err);
                channel.nack(msg, false, true);
            }
        });
    }
};
exports.RabbitMQConsumer = RabbitMQConsumer;
exports.RabbitMQConsumer = RabbitMQConsumer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitMQ_connection_1.RabbitMQConnection])
], RabbitMQConsumer);
//# sourceMappingURL=rabbitMQ.consumer.js.map