const express = require('express');
const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost:27017/assistant-core', { useNewUrlParser: true })
  .then(() => logger.info('Connected to MongoDB...'))
  .catch(err => winston.error('Could not connect to MongoDB...', err));

const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listining on port ${PORT}`));
