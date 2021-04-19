import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { Request, Response } from "express";
import {
  createExpressServer,
  getMetadataArgsStorage,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import { AuthenticationController, RootController } from "./controllers";

const app = createExpressServer({
  controllers: [RootController, AuthenticationController],
});

const storage = getMetadataArgsStorage();
const schemas = validationMetadatasToSchemas({
  refPointerPrefix: "#/components/schemas/",
});
const swaggerSpec = routingControllersToSpec(
  storage,
  {},
  {
    components: { schemas },
  }
);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/swagger", (_req: Request, res: Response): void => {
  res.status(200).json(swaggerSpec);
});

const port = process.env["PORT"] || 3000;

app.listen(port, () => console.log(`Listen on port ${port}`));
