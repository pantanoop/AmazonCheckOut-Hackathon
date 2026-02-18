"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const consumer_service_1 = require("../messaging/consumer.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const consumer = app.get(consumer_service_1.ConsumerService);
    await consumer.consume();
    await app.close();
}
bootstrap();
//# sourceMappingURL=consumer.js.map