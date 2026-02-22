import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export const typeOrmConfig: DataSourceOptions & SeederOptions = {
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],

  migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],

  seeds: [join(__dirname, '..', 'seeders', '*{.ts,.js}')],

  synchronize: false,
};
