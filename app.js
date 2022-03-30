const axiosDebugLog = require('axios-debug-log');
const express = require('express');
const cookieParser = require('cookie-parser');
const nunjucks = require('nunjucks');
const router = require('./routes');
const connect = require('./database');
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");

axiosDebugLog({});

const createApp = async () => {
  const app = express();

  console.info('process.env', process.env);

  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    release: 'hermes@',
  });

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  app.use(cookieParser());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  nunjucks.configure('views', { autoescape: true, express: app });
  app.set('view engine', 'njk');
  app.set('views', `${__dirname}/views`);

  app.locals.db = await connect();

  app.use('/', router);

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  return app;
}

module.exports = createApp;
