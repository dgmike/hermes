import { NextFunction, Request, Response } from "express";
import { Knex } from "knex";
import { ExpressMiddlewareInterface } from "routing-controllers";
import { CompleteClientSchema } from "../schemas/clients.schemas";

export class ClientExistsMiddleware implements ExpressMiddlewareInterface {
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const db: Knex = req.app.locals["db"];
    const countResult = await db<CompleteClientSchema>("clients")
      .where("client_id", req.params["client_id"])
      .count()
      .first();

    if (countResult && parseInt(`${countResult["count"]}`)) {
      return next();
    }

    res.status(404).json({
      message: "resource not found",
    });
  }
}
