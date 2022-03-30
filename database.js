const knex = require('knex');

const env = () => {
  const {
    DATABASE_CLIENT: client,
    DATABASE_URL: url,
  } = process.env;
  return { client, url };
}

const connection = () => {
  const { client, url } = env();

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
  const { client, url } = env();

  const settings = {
    client,
    connection: connection(),
    useNullAsDefault: true,
    debug: ['true', 'TRUE', 'yes', 'YES', 'on', 'ON', '1'].includes(process.env.DATABASE_DEBUG || 'FALSE'),
  };
  return knex(settings);
};

module.exports = connect;
