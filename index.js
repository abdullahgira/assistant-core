const express = require('express');
const mongoose = require('mongoose');
const winston = require('./config/winston');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

// Catch async errors and pass them to the error route
require('make-promises-safe');
require('express-async-errors');

const bodyParser = require('body-parser');
const app = express();

mongoose
  .connect('mongodb://localhost:27017/assistant-core', { useNewUrlParser: true })
  .then(() => winston.info('Connected to MongoDB...'))
  .catch(err => winston.error('Could not connect to MongoDB...', err));

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: winston.stream }));
app.use(bodyParser.json());

app.disable('etag');
app.disable('x-powered-by');

// routes
app.use('/api/users', require('./components/users'));
app.use('/api/groups', require('./components/groups'));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  winston.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.statusCode || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => winston.info(`Listining on port ${PORT}`));
