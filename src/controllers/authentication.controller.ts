import * as bcrypt from "bcrypt";
import { Response } from "express";
import * as jwt from "jsonwebtoken";
import { Knex } from "knex";
import { Body, HttpCode, JsonController, Post, Res } from "routing-controllers";
import { UsernameModel } from "../models";
import SignInValidation from "../validations/signin.validation";

@JsonController("/api")
class AuthenticationController {
  @Post("/signin")
  @HttpCode(201)
  async signIn(
    @Body({ validate: true }) body: SignInValidation,
    @Res() res: Response
  ): Promise<{ token: string } | Response> {
    const db: Knex = res.app.locals["db"];

    const username = await db<UsernameModel>("users")
      .where({ username: body.login })
      .first();

    if (!username || !bcrypt.compareSync(body.password, username.password)) {
      return res
        .status(422)
        .json({ error: true, message: "invalid credentials" });
    }

    const data = {
      username: username.username,
      name: username.name,
      roles: username.roles,
    };

    const secretKey = process.env["JWT_SECRET"] || "";
    const token = jwt.sign(data, secretKey, { expiresIn: "5m" });

    return { token };
  }
}

export { AuthenticationController };
