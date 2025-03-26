import { join } from 'node:path';

import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { ENVIRONMENT_ENUM } from '@/constants';

dotenv.config();

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) | 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, '../../database/entities/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../../database/migrations/**/*{.ts,.js}')],
  seeds: [join(__dirname, '../../dbs/seeders/**/*{.ts,.js}')],
  factories: [join(__dirname, '../../dbs/factories/**/*{.ts,.js}')],
  // ssl: process.env.DB_SSL ? { cert: process.env.DB_SSL } : undefined,
  ssl: false,
  logging: process.env.NODE_ENV !== ENVIRONMENT_ENUM.PRODUCTION,
};

export default new DataSource(options);
