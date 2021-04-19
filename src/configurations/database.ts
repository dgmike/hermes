import * as util from "util";
import knex, { Knex } from "knex";

export default async (): Promise<Knex> => {
  const log = util.debuglog("database");
  log("Connection to database...");
  const database = await knex({
    client: "pg",
    connection: {
      host: process.env["DB_HOST"],
      user: process.env["DB_USER"],
      password: process.env["DB_PASS"],
      database: process.env["DB_NAME"],
    },
  });
  log("Database connection: OK");
  return database;
};
