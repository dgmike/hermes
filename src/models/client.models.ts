import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { decorate, mix } from "ts-mixer";
import {
  ClientIdentiableSchema,
  ClientSchema,
  CompleteClientSchema,
} from "../schemas/clients.schemas";
import { TimestampableModel } from "./shared.models";

export class ClientIdentiableModel implements ClientIdentiableSchema {
  @decorate(IsNumber())
  client_id = undefined;
}

export class ClientBasicModel implements ClientSchema {
  @decorate(IsString())
  @decorate(IsNotEmpty())
  name = undefined;

  toJSON(): ClientSchema {
    return {
      name: this.name,
    };
  }
}

@mix(ClientIdentiableModel, ClientBasicModel, TimestampableModel)
export class CompleteClientModel implements CompleteClientSchema {}
