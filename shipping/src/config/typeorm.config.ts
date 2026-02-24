import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { InboxMessage } from '../inbox/inbox.entity';
import { OutboxMessage } from '../outbox/entities/outbox-table.entity';
import { Order } from '../order/entities/order.entity';

dotenv.config();

export const typeOrmConfig: DataSourceOptions & SeederOptions = {
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [Order, InboxMessage, OutboxMessage],

  migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  seeds: [join(__dirname, '..', 'src', 'seeders', '*.seeder.{ts,js}')],

  synchronize: false,
};
