import { Response } from "express";
import { Knex } from "knex";
import { Authorized, Get, JsonController, Res } from "routing-controllers";
import { OpenAPI, ResponseSchema } from "routing-controllers-openapi";
import { UserBaseModel, UserBaseSchema } from "../models";

@OpenAPI({
  security: [{ BearerAuth: [] }],
})
@JsonController("/api/users")
class UsersController {
  @Authorized()
  @Get()
  @ResponseSchema(UserBaseSchema)
  async findAll(@Res() res: Response): Promise<UserBaseModel[]> {
    const db: Knex = res.app.locals["db"];

    const users = await db<UserBaseModel>("users").select(
      "user_id",
      "username",
      "name",
      "roles",
      "created_at",
      "updated_at"
    );
    return users;
  }
}

export { UsersController };
