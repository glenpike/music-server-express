/* global require */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var library = require('./music-library');
var cors = require('express-cors')

app.use(cors({
    allowedOrigins: [
        'localhost:8100', 'google.com'
    ]
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'));

app.use('/library', library);
app.set('json spaces', 2);
app.listen(8081);

module.exports = app;
