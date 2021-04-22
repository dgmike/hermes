import { IsDate, IsString } from "class-validator";
import { decorate } from "ts-mixer";
import { TimestampsSchema } from "../schemas/shared.schemas";

export class TimestampableModel implements TimestampsSchema {
  @decorate(IsDate())
  created_at: Date | undefined;

  @decorate(IsDate())
  updated_at: Date | undefined;
}

export class NotFoundModel {
  @IsString()
  message = "Resource not found";
}
