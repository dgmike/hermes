import { IsString, MaxLength } from "class-validator";

export default class SignInValidation {
  @IsString()
  @MaxLength(50)
  login = "";

  @IsString()
  @MaxLength(50)
  password = "";
}
