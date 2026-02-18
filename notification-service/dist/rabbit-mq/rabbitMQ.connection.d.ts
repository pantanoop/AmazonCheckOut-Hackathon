import * as amqp from 'amqplib';
export declare class RabbitMQConnection {
    private connection;
    private channel;
    private reconnecting;
    getChannel(url: string): Promise<amqp.Channel>;
    private reconnect;
}
