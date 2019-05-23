const express = require('express');
const mongoose = require('mongoose');
const winston = require('winston');

const bodyParser = require('body-parser');
const app = express();

mongoose
  .connect('mongodb://localhost:27017/assistant-core', { useNewUrlParser: true })
  .then(() => logger.info('Connected to MongoDB...'))
  .catch(err => winston.error('Could not connect to MongoDB...', err));

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: './logs/info.log' })
  ]
});

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Listining on port ${PORT}`));
