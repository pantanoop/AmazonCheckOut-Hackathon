import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './src/config/typeorm.config';

const AppDataSource = new DataSource(typeOrmConfig);

export default AppDataSource;
