const express = require('express');
const cookieParser = require('cookie-parser');
const nunjucks = require('nunjucks');
const router = require('./routes');
const connect = require('./database');

const createApp = async () => {
  const app = express();

  app.use(cookieParser());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  nunjucks.configure('views', { autoescape: true, express: app });
  app.set('view engine', 'njk');
  app.set('views', `${__dirname}/views`);

  app.locals.db = await connect();

  app.use('/', router);
  return app;
}

module.exports = createApp;
