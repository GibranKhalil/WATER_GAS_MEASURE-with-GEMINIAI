import { DataSource } from 'typeorm';
import { postgresConfigService } from './config/postgres.ormconfig';

export const AppDataSource = new DataSource({
  type: postgresConfigService.type,
  host: postgresConfigService.host,
  port: postgresConfigService.port,
  username: postgresConfigService.username,
  password: postgresConfigService.password as string,
  database: postgresConfigService.database,
  entities: postgresConfigService.entities,
  synchronize: postgresConfigService.synchronize,
});
