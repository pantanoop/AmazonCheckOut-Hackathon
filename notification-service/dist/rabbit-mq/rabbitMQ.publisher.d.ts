import { RabbitMQConnection } from './rabbitMQ.connection';
export declare class RabbitMQPublisher {
    private readonly rabbit;
    constructor(rabbit: RabbitMQConnection);
    publish(message: any): Promise<void>;
}
