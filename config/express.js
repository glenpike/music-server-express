import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'express-cors';
import config from './env';
import routes from '../server/routes';
import { collection } from '../db';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.set('json spaces', 2);

// Would be nice not to have to rely on coupling so closely here
// but middleware order is important...
// consider splitting the DB from the routes - "model" layer
app.use('/', function(req, res, next) {
    req.collection = collection;
    return next();
});

// All routes under /api
app.use('/api', routes);

// TODO: default error handling;

export default app;
