const knex = require('knex');

const {
  DATABASE_CLIENT: client,
  DATABASE_URL: url,
} = process.env;


const connection = () => {
  if (client === 'sqlite3') {
    return { filename: url };
  }

  return url;
}

const connect = async () => {
  return knex({
    client,
    connection,
    useNullAsDefault: true,
  });
};

module.exports = connect;
