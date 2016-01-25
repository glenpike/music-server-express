/* global require */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var library = require('./music-library');

var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
    { name: "help", alias: "h", type: Boolean, description: 'Display this usage guide'},
    { name: "test", alias: "t", type: Boolean, description: 'Use the test configuration'}
]);
var options = cli.parse();

if(options.help) {
    var usage = cli.getUsage({
        title: "server",
        description: "Music Server API",
        footer: "Project home: [underline]{https://github.com/me/my-app}"
    });

    console.log(usage);
    process.exit();
}

var dbConf;

if(options.test) {
    dbConf = require('./config/test-database');
} else {
    dbConf = require('./config/database');
}
library.configure(dbConf);

var cors = require('express-cors')

app.use(cors({
    allowedOrigins: [
        'localhost:8100', '192.168.0.3', '192.168.0.4'
    ]
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'));

app.use('/library', library);
app.set('json spaces', 2);
app.listen(8081);

module.exports = app;

