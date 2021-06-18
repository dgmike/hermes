const knex = require('knex');

const connect = async () => {
  return knex({
    client: 'sqlite',
    useNullAsDefault: true,
    connection: {
      filename: `${__dirname}/db.sqlite`,
    },
  });
};

module.exports = connect;
