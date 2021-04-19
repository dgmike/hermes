import { IsDate, IsPositive, IsString } from "class-validator";

export interface UserBaseModel {
  user_id: number | undefined;
  username: string;
  name: string;
  roles: string[];
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

  @IsString({ each: true })
  roles: string[] = [];

  @IsDate()
  created_at = new Date();

  @IsDate()
  updated_at = new Date();
}
