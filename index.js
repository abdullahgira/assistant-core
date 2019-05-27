const express = require('express');
const mongoose = require('mongoose');
const winston = require('winston');
const helmet = require('helmet');
const compression = require('compression');

// Catch async errors and pass them to the error route
require('make-promises-safe');
require('express-async-errors');

const bodyParser = require('body-parser');
const app = express();

mongoose
  .connect('mongodb://localhost:27017/assistant-core', { useNewUrlParser: true })
  .then(() => logger.info('Connected to MongoDB...'))
  .catch(err => winston.error('Could not connect to MongoDB...', err));

const logger = winston.createLogger({
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: './logs/info.log' })]
});

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());

app.disable('etag');
app.disable('x-powered-by');

// routes
app.use('/api/users', require('./components/users'));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Listining on port ${PORT}`));
