import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';
import { Order } from '../order/entities/order.entity';
import { InboxMessage } from '../inbox/inbox.entity';
import { Product } from '../order/entities/product.entity';

dotenv.config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [OutboxMessage, Order, InboxMessage, Product],
  migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],

  synchronize: false,
  logging: true,
};
