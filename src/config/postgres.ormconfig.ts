import { OrmConfig } from '../@types/interfaces/ormConfig.interface';
import * as dotenv from 'dotenv';

/**
 * Classe de Configuração do banco postgres dockerizado
 */
class PostgresConfigService implements OrmConfig {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: string[];
  synchronize: boolean;

  constructor() {
    dotenv.config();
    this.type = 'postgres';
    this.host = process.env.DB_HOST as string;
    this.port = parseInt(process.env.DB_PORT as string, 10);
    this.username = process.env.DB_USERNAME as string;
    this.password = process.env.DB_PASSWORD as string;
    this.database = process.env.DB_NAME as string;
    this.entities = ['src/entities/*.entity.{ts,js}'];
    this.synchronize = true;
  }
}

export const postgresConfigService = new PostgresConfigService();
