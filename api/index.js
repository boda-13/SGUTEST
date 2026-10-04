const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('../src/routes');
const errorHandler = require('../src/middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api', routes);
app.use(errorHandler);

// ⚠️ Vercel Serverless: لا نستخدم app.listen
module.exports = app;