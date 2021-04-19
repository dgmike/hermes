import { Response } from "express";
import { Knex } from "knex";
import {
  Authorized,
  Body,
  Get,
  JsonController,
  OnUndefined,
  Post,
  Res,
} from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import {
  UserBaseSchema,
  UsernameModel,
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
  @ResponseSchema(UserBaseSchema)
  async findAll(@Res() res: Response): Promise<UserWithCreateAndUpdateModel[]> {
    const db: Knex = res.app.locals["db"];

    const users = await db<UserWithCreateAndUpdateModel>("users").select(
      "user_id",
      "username",
      "name",
      "roles",
      "created_at",
      "updated_at"
    );
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
    const userId = await db<UsernameModel>("users")
      .returning("user_id")
      .insert(body.toJSON());
    res.location(`/api/users/${userId}`);
    return;
  }
}

export { UsersController };
