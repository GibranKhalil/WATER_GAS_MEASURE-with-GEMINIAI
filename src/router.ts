import { Router } from 'express';
import { measureRouter } from './routes/measure.router';

/**
 * Classe responsável por configurar as rotas da aplicação
 */
class AppRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.configureRoutes();
  }

  private configureRoutes(): void {
    this.router.use('/', measureRouter.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}

const appRouter = new AppRouter();

export { appRouter };
