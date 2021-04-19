import { IsDate, IsEnum, IsPositive, IsString } from "class-validator";

export enum UserRoles {
  ADMIN = "ADMIN",
}

export interface UserBaseModel {
  user_id?: number;
  username: string;
  name: string;
  roles: UserRoles[] | string;
}

export interface UserWithCreateAndUpdateModel extends UserBaseModel {
  created_at: Date;
  updated_at: Date;
}

export interface UsernameModel extends UserBaseModel {
  password: string;
}

export class UserBaseSchema implements UserBaseModel {
  @IsPositive()
  user_id: number | undefined;

  @IsString()
  username = "";

  @IsString()
  name = "";

  @IsEnum(UserRoles, { each: true })
  roles: UserRoles[] = [];

  @IsDate()
  created_at = new Date();

  @IsDate()
  updated_at = new Date();
}
