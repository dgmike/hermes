import { IsEnum, IsString, Matches, MinLength } from "class-validator";
import { UserBaseModel, UserRoles } from "../models";

export class CreateUserValidation implements UserBaseModel {
  @IsString()
  name = "";

  @IsString()
  @MinLength(3)
  @Matches(/^[a-z][a-z0-9_.-]+[a-z]+$/, {
    message: "only can contain letter, numbers, underscore, dash and dots",
  })
  @Matches(/^[a-z]/, { message: "must start with letter" })
  @Matches(/[a-z]$/, { message: "must end with letter" })
  username = "";

  @IsString()
  password = "";

  @IsEnum(UserRoles, { each: true })
  roles: UserRoles[] = [];
}
