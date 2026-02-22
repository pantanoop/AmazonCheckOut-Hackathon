import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './src/config/typeorm.config';

export const AppDataSource = new DataSource(typeOrmConfig);
