"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const rabbitMQ_consumer_1 = require("../rabbit-mq/rabbitMQ.consumer");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const consumer = app.get(rabbitMQ_consumer_1.RabbitMQConsumer);
    await consumer.consume();
    await app.close();
}
bootstrap();
//# sourceMappingURL=consumer.js.map