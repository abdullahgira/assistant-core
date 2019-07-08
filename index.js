const express = require('express');
const mongoose = require('mongoose');
const winston = require('./config/winston');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const config = require('config');

// Catch async errors and pass them to the error route
require('make-promises-safe');
require('express-async-errors');

const bodyParser = require('body-parser');
const app = express();

mongoose
  .connect(config.get('mongodb'), { useNewUrlParser: true })
  .then(() => winston.info('Connected to MongoDB...'))
  .catch(err => winston.error('Could not connect to MongoDB...', err));

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: winston.stream }));
app.use(bodyParser.json());

app.disable('etag');
app.disable('x-powered-by');

app.use((req, res, next) => {
  // res.setHeader("Access-Control-Allow-Headers", req.getHeader("Access-Control-Request-Headers")); // allow any headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type, x-auth-token');
  res.header('Access-Control-Expose-Headers', 'content-type, x-auth-token');
  next();
});

// routes
app.use('/api/users', require('./components/users'));
app.use('/api/groups', require('./components/groups'));
app.use('/api/posts', require('./components/posts'));
app.use('/api/scores', require('./components/scores'));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  winston.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.statusCode || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => winston.info(`Listining on port ${PORT}`));
