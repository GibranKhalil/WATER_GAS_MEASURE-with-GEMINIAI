import { Router } from "express";
import { measureController } from "../controllers/measure.controller";

class MeasureRouter{
    public router: Router;
    private readonly controller = measureController

    constructor() {
        this.router = Router();
        this.configureRoutes();
    }

    private configureRoutes(): void {
        this.router.post('/upload', this.controller.post.bind(this.controller) )
        this.router.get('/temp-image/:filename', this.controller.getTempImage.bind(this.controller))
    }

    public getRouter(): Router {
        return this.router;
    }
}

const measureRouter = new MeasureRouter()

export {measureRouter}