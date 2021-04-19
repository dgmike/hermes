import { Response } from "express";
import * as jwt from "jsonwebtoken";
import { Body, HttpCode, JsonController, Post, Res } from "routing-controllers";
import SignInValidation from "../validations/signin.validation";

@JsonController("/api")
class AuthenticationController {
  @Post("/signin")
  @HttpCode(201)
  signIn(
    @Body({ validate: true }) body: SignInValidation,
    @Res() res: Response
  ): { token: string } | Response {
    if (body.login === "admin" && body.password === "admin") {
      const data = {
        username: body.login,
        name: "Administrator",
        roles: ["admin"],
      };
      const secretKey = "secretKey";
      const token = jwt.sign(data, secretKey, { expiresIn: "5m" });
      return { token };
    }
    return res
      .status(422)
      .json({ error: true, message: "invalid credentials" });
  }
}

export { AuthenticationController };
