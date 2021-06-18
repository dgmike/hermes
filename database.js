const knex = require('knex');

const {
  DATABASE_CLIENT: client,
  DATABASE_URL: url,
} = process.env;


const connection = () => {
  if (client === 'sqlite3') {
    return { filename: url };
  }

  if (client === 'postgres') {
    return {
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    };
  }

  return url;
}

const connect = async () => {
  const settings = {
    client,
    connection: connection(),
    useNullAsDefault: true,
  };
  return knex(settings);
};

module.exports = connect;
