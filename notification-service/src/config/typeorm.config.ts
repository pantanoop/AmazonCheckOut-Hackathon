import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { InboxMessage } from '../inbox/entities/inbox.entity';

dotenv.config();

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [InboxMessage],
  migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],

  synchronize: false,
  logging: true,
};
