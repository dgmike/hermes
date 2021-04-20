import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { Application, Response } from "express";
import jwt from "jsonwebtoken";
import {
  Action,
  createExpressServer,
  getMetadataArgsStorage,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import { stringify } from "yaml";
import database from "./configurations/database";
import {
  AuthenticationController,
  ClientsController,
  RootController,
  UsersController,
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
  const originalSchemas = validationMetadatasToSchemas();

  const schemas = Object.entries(originalSchemas)
    .filter(([key]: [string, unknown]): boolean => !key.includes("ableModel"))
    .reduce(
      (
        acc: { [key: string]: unknown },
        [key, value]: [string, unknown]
      ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { [key: string]: any } => ({
        ...acc,
        [key]: value,
      }),
      {}
    );

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

  app.get("/api/swagger(.json)?", (_req, res: Response): void => {
    res.status(200).json(swaggerSpec);
  });

  app.get("/api/swagger.ya?ml", (_req, res: Response) => {
    res.status(200).type("text/yaml").send(stringify(swaggerSpec));
  });

  app.locals["db"] = await database();

  return app;
};
