import { Router } from 'express';
import { MeasureController } from '../controllers/measure.controller';

class MeasureRouter {
  public router: Router;
  private readonly controller: MeasureController = new MeasureController();

  constructor() {
    this.router = Router();
    this.configureRoutes();
  }

  private configureRoutes(): void {
    this.router.post(
      '/upload',
      this.controller.postMeasure.bind(this.controller),
    );
    this.router.get(
      '/temp-image/:filename',
      this.controller.getTempImage.bind(this.controller),
    );
    this.router.patch(
      '/confirm',
      this.controller.patchConfirmMeasure.bind(this.controller),
    );
    this.router.get(
      '/:customer_code/list',
      this.controller.getCustomerMeasuresList.bind(this.controller),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

const measureRouter = new MeasureRouter();

export { measureRouter };
