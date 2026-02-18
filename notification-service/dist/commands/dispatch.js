"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const outbox_publisher_1 = require("../outbox/outbox.publisher");
const rabbitMQ_publisher_1 = require("../rabbit-mq/rabbitMQ.publisher");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const outbox = app.get(outbox_publisher_1.OutboxPublisher);
    const publisher = app.get(rabbitMQ_publisher_1.RabbitMQPublisher);
    const messages = await outbox.getPendingMsg();
    for (const msg of messages) {
        await publisher.publish(msg);
        await outbox.markPublished(msg.id.toString());
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=dispatch.js.map