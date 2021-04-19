import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { Application, Request, Response } from "express";
import {
  createExpressServer,
  getMetadataArgsStorage,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import database from "./configurations/database";
import { AuthenticationController, RootController } from "./controllers";

export const createApp = async (): Promise<Application> => {
  const app: Application = createExpressServer({
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

  app.locals["db"] = await database();

  return app;
};
