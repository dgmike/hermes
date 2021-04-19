import * as bcrypt from "bcrypt";
import { ArrayNotEmpty, IsEnum, IsString, Matches, MinLength, IsNotEmpty } from "class-validator";
import { UserBaseModel, UserRoles } from "../models";

export class CreateUserValidation implements UserBaseModel {
  @IsNotEmpty()
  @IsString()
  name = "";

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z][a-z0-9_.-]+[a-z]+$/, {
    message: "only can contain letter, numbers, underscore, dash and dots",
  })
  @Matches(/^[a-z]/, { message: "must start with letter" })
  @Matches(/[a-z]$/, { message: "must end with letter" })
  username = "";

  @IsNotEmpty()
  @IsString()
  password = "";

  @ArrayNotEmpty()
  @IsEnum(UserRoles, { each: true })
  roles: UserRoles[] = [];

  toJSON() {
    const password = bcrypt.hashSync(this.password, bcrypt.genSaltSync());

    return {
      password,
      name: this.name,
      username: this.username,
      roles: JSON.stringify(this.roles),
    };
  }
}
