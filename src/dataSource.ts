import { DataSource } from 'typeorm';
import { postgresConfigService } from './config/postgres.ormconfig';
import { MeasureEntity } from './entities/measure.entity';

/**
 * Configuração da comunicação do TypeORM com o banco de dados
 */
export const AppDataSource = new DataSource({
  type: postgresConfigService.type,
  host: postgresConfigService.host,
  port: postgresConfigService.port,
  username: postgresConfigService.username,
  password: postgresConfigService.password as string,
  database: postgresConfigService.database,
  entities: [MeasureEntity],
  synchronize: postgresConfigService.synchronize,
});
