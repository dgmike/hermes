import { Response } from "express";
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
  Res,
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import {
  UserBaseSchema,
  UserModel,
  UserWithCreateAndUpdateModel,
} from "../models";
import { CreateUserValidation } from "../validations/user.validation";

@OpenAPI({
  security: [{ BearerAuth: [] }],
})
@JsonController("/api/users")
class UsersController {
  @Authorized()
  @Get()
  @ResponseSchema(UserBaseSchema, { isArray: true })
  async findAll(@Res() res: Response): Promise<UserWithCreateAndUpdateModel[]> {
    const db: Knex = res.app.locals["db"];

    const users = await db<UserWithCreateAndUpdateModel>("users")
      .select(
        "user_id",
        "username",
        "name",
        "roles",
        "created_at",
        "updated_at"
      )
      .orderBy("user_id", "asc");
    return users;
  }

  @Authorized()
  @Post()
  @OnUndefined(201)
  async create(
    @Res()
    res: Response,
    @Body({ validate: true }) body: CreateUserValidation
  ): Promise<undefined> {
    const db: Knex = res.app.locals["db"];
    const userId = await db<UserModel>("users")
      .returning("user_id")
      .insert(body.toJSON());
    res.location(`/api/users/${userId}`);
    return;
  }

  @Authorized()
  @Get("/:user_id")
  @ResponseSchema(UserBaseSchema)
  @OnUndefined(404)
  async fetchOne(
    @Res() res: Response,
    @Param("user_id") user_id: number
  ): Promise<UserBaseSchema | undefined> {
    const db: Knex = res.app.locals["db"];
    const user = await db<UserBaseSchema>("users")
      .select(
        "user_id",
        "username",
        "name",
        "roles",
        "created_at",
        "updated_at"
      )
      .where({ user_id })
      .first();
    return user;
  }

  @Authorized()
  @Patch("/:user_id")
  @ResponseSchema(UserBaseSchema)
  @OnUndefined(404)
  async update(
    @Res() res: Response,
    @Param("user_id") user_id: number,
    @Body({ validate: true }) body: CreateUserValidation
  ): Promise<UserBaseSchema | undefined> {
    const db: Knex = res.app.locals["db"];
    const found = await db<UserModel>("users").where({ user_id }).count();
    if (!found) {
      return undefined;
    }
    const fields: string[] = [
      "user_id",
      "username",
      "name",
      "roles",
      "created_at",
      "updated_at",
    ];
    const [user] = await db<UserModel>("users")
      .where({ user_id })
      .update(body.toJSON(), fields);
    return user;
  }

  @Authorized()
  @Delete("/:user_id")
  @HttpCode(200)
  @OnUndefined(404)
  async remove(
    @Res() res: Response,
    @Param("user_id") user_id: number
  ): Promise<{ ok: boolean } | undefined> {
    const db: Knex = res.app.locals["db"];
    const found = await db<UserModel>("users")
      .where({ user_id })
      .count()
      .first();
    const count = parseInt(`${found?.["count"] || 0}`);
    if (!count) {
      return undefined;
    }
    await db<UserModel>("users").where({ user_id }).delete();
    return { ok: true };
  }
}

export { UsersController };
