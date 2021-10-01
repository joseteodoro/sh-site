const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser')
const express = require('express');
const path = require('path');

const config = require('./config')
const routes = require('./routes/index');

const app = express();

app.use(express.static('static'))

app.use(basicAuth({
    users: { [config.user]: config.password },
    challenge: true,
    realm: 'sh-site',
}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', routes);

module.exports = app;