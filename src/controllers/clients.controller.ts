import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Application, Response } from "express";
import { Knex } from "knex";
import {
  Body,
  Get,
  JsonController,
  OnUndefined,
  Param,
  Post,
  QueryParam,
  Res,
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";
import { decorate, mix } from "ts-mixer";

interface ClientIdentiableSchema {
  client_id?: number | undefined;
}

class ClientIdentiableModel implements ClientIdentiableSchema {
  @decorate(IsNumber())
  client_id = undefined;
}

interface ClientSchema extends ClientIdentiableSchema {
  name?: string | undefined;
}

class ClientBasicModel implements ClientSchema {
  @decorate(IsString())
  @decorate(IsNotEmpty())
  name = undefined;
}

interface TimestampsSchema {
  created_at?: Date;
  updated_at?: Date;
}

class TimestampableModel implements TimestampsSchema {
  @decorate(IsDate())
  created_at: Date | undefined;

  @decorate(IsDate())
  updated_at: Date | undefined;
}

interface CompleteClientSchema extends ClientSchema, TimestampsSchema {}

@mix(ClientIdentiableModel, ClientBasicModel, TimestampableModel)
class CompleteClientModel implements CompleteClientSchema {}

// @Authorized()
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
  ): Promise<void | string> {
    const db = this.db<CompleteClientSchema>(res.app);
    const [insertResult] = await db.insert(body, "client_id").debug(true);
    if (!insertResult) {
      res.status(422).json({
        error: "invalid data",
      });
      return;
    }
    res.location(`/api/clients/${insertResult}`);
  }

  @Get("/:id_client")
  @ResponseSchema(CompleteClientModel)
  async fetchOne(
    @Res() res: Response,
    @Param("id_client") id: number
  ): Promise<CompleteClientSchema> {
    const db = this.db<CompleteClientSchema>(res.app);
    const resource = await db.where("client_id", id).first();
    return resource;
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
