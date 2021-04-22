import { Application, Response } from "express";
import { Knex } from "knex";
import {
  Authorized,
  Body,
  Delete,
  Get,
  HttpCode,
  JsonController,
  OnUndefined,
  Param,
  Patch,
  Post,
  QueryParam,
  Res,
  UseBefore
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { ClientExistsMiddleware } from "../middlewares/client.middlewares";
import { ClientBasicModel, CompleteClientModel } from "../models/client.models";
import { NotFoundModel } from "../models/shared.models";
import { CompleteClientSchema } from "../schemas/clients.schemas";

@Authorized()
@JsonController("/api/clients")
class ClientsController {
  @Get()
  @ResponseSchema(CompleteClientModel, { isArray: true })
  async find(
    @Res() res: Response,
    @QueryParam("limit") userLimit = 10,
    @QueryParam("offset") userOffset = 0
  ): Promise<unknown[]> {
    const { limit, offset } = this.offsetAndLimit(userOffset, userLimit);
    return this.db<CompleteClientSchema>(res.app)
      .select("client_id", "name", "created_at", "updated_at")
      .limit(limit)
      .offset(offset);
  }

  @Post()
  @OnUndefined(201)
  async create(
    @Res() res: Response,
    @Body({ validate: true }) body: ClientBasicModel
  ): Promise<void> {
    const db = this.db<CompleteClientSchema>(res.app);
    const [insertResult] = await db.insert(body.toJSON(), "client_id");
    if (!insertResult) {
      res.status(422).json({
        error: "invalid data",
      });
      return;
    }
    res.location(`/api/clients/${insertResult}`);
  }

  @UseBefore(ClientExistsMiddleware)
  @Get("/:client_id")
  @ResponseSchema(CompleteClientModel)
  @ResponseSchema(NotFoundModel, { statusCode: 404 })
  async fetchOne(
    @Res() res: Response,
    @Param("client_id") id: number
  ): Promise<CompleteClientSchema> {
    const db = this.db<CompleteClientSchema>(res.app);
    return db.where("client_id", id).first();
  }

  @UseBefore(ClientExistsMiddleware)
  @Patch("/:client_id")
  @HttpCode(204)
  @ResponseSchema(NotFoundModel, { statusCode: 404 })
  async update(
    @Res() res: Response,
    @Param("client_id") id: number,
    @Body({ validate: true }) body: ClientBasicModel
  ): Promise<void> {
    const db = this.db<CompleteClientSchema>(res.app);
    await db.where("client_id", id).update(body.toJSON());
  }

  @UseBefore(ClientExistsMiddleware)
  @Delete("/:client_id")
  @HttpCode(204)
  @ResponseSchema(NotFoundModel, { statusCode: 404 })
  async remove(
    @Res() res: Response,
    @Param("client_id") id: number
  ): Promise<void> {
    const db = this.db<CompleteClientSchema>(res.app);
    await db.where("client_id", id).delete();
  }

  private offsetAndLimit(
    userOffset: number,
    userLimit: number
  ): { offset: number; limit: number } {
    const limit =
      userLimit && userLimit > 0 && userLimit <= 100 ? userLimit : 10;
    const offset =
      userOffset && userOffset > 0 && userOffset <= 100 ? userOffset : 0;
    return { offset, limit };
  }

  private db<T>(app: Application, tableName = "clients"): Knex.QueryBuilder<T> {
    const dbInstace: Knex = app.locals["db"];
    return dbInstace<T>(tableName);
  }
}

export { ClientsController };

