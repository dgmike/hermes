import { Request, Response } from "express";
import {
  createExpressServer,
  getMetadataArgsStorage,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import { RootController } from "./controllers/root.controller";

const app = createExpressServer({
  controllers: [RootController],
});

const storage = getMetadataArgsStorage();
const swaggerSpec = routingControllersToSpec(storage);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/swagger", (_req: Request, res: Response): void => {
  res.status(200).json(swaggerSpec);
});

const port = process.env["PORT"] || 3000;

app.listen(port, () => console.log(`Listen on port ${port}`));
