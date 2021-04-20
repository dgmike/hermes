import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { Application, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  Action,
  createExpressServer,
  getMetadataArgsStorage,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import database from "./configurations/database";
import {
  AuthenticationController,
  RootController,
  UsersController,
  ClientsController,
} from "./controllers";

export const createApp = async (): Promise<Application> => {
  const app: Application = createExpressServer({
    controllers: [
      RootController,
      AuthenticationController,
      UsersController,
      ClientsController,
    ],
    authorizationChecker: async (action: Action): Promise<boolean> => {
      try {
        const authorizationHeader: string | undefined =
          action.request.headers["authorization"];

        if (!authorizationHeader?.match(/^Bearer \w[\w.-]+\w$/)) {
          throw new Error("Authorization does not match");
        }
        const token = authorizationHeader.substr(7);
        const verify = jwt.verify(token, process.env["JWT_SECRET"] || "");
        return !!verify;
      } catch (err) {
        console.log("Error:", err);
        return false;
      }
    },
  });

  const storage = getMetadataArgsStorage();
  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: "#/components/schemas/",
  });
  const swaggerSpec = routingControllersToSpec(
    storage,
    {},
    {
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
        schemas,
      },
    }
  );

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/api/swagger", (_req: Request, res: Response): void => {
    res.status(200).json(swaggerSpec);
  });

  app.locals["db"] = await database();

  return app;
};
