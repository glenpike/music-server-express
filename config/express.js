import express from 'express';
import bodyParser from 'body-parser';
import cors from 'express-cors';
import logger from 'express-bunyan-logger';
// import bunyanRequest from 'bunyan-request';
import config from './env';
import routes from '../server/routes';
import appLogger from '../utils/logger';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger({ logger: appLogger }));

app.set('json spaces', 2);

// All routes under /api
app.use('/api', routes);

export default app;
