import { RabbitMQConnection } from './rabbitMQ.connection';
export declare class RabbitMQConsumer {
    private readonly rabbit;
    constructor(rabbit: RabbitMQConnection);
    consume(): Promise<void>;
}
