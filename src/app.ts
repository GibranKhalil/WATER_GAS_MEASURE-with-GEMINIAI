import express from 'express';
import { appRouter } from './router';
import 'reflect-metadata';
import { AppDataSource } from './dataSource';

/**
 * Classe que inicializa a aplicação
 */
export class App {
  public server: express.Application;
  private datasource = AppDataSource;

  constructor() {
    this.server = express();
    this.middleware();
    this.router();
    this.initializeDatabase();
  }

  private middleware() {
    this.server.use(express.json());
  }

  /**
   * Configuração das rotas da aplicação
   */
  private router() {
    this.server.use(appRouter.getRouter());
  }

  /**
   * Inicialização do banco de dados
   */
  private async initializeDatabase() {
    try {
      await this.datasource.initialize();
      console.log('Banco de dados inicializado');
    } catch (err) {
      console.error('Erro durante a inicialização do Banco de dados:', err);
    }
  }
}
