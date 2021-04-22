export interface ClientIdentiableSchema {
  client_id?: number | undefined;
}

export interface ClientSchema extends ClientIdentiableSchema {
  name?: string | undefined;
}

export interface CompleteClientSchema extends ClientSchema, TimestampsSchema {}
