"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../../app.module");
const _1 = require("");
const publisher_service_1 = require("../messaging/publisher.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const outbox = app.get(_1.OutboxService);
    const publisher = app.get(publisher_service_1.PublisherService);
    const messages = await outbox.getPendingMsg();
    for (const msg of messages) {
        await publisher.publish(msg);
        await outbox.markDispatched(msg.id.toString());
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=dispatch.js.map