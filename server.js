const express = require('express');
const logger = require('morgan');
const users = require('./src/routes/users');
const bodyParser = require('body-parser');
const mongoose = require('./config/database');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const app = express();

app.use(cors());

// JWT secret token
app.set('secretKey', 'nodeRestApi');

// Connection to mongodb
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.json({ 'tutorial' : 'Build REST API with node.js' });
});

// Public route
app.use('/users', users);

function validateUser(req, res, next) {
    jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded) {
        if (err) {
            res.json({ status: 'error', message: err.message, data: null });
        }
        else {
            // Add user id to request
            req.body.userId = decoded.id;
            next();
        }
    })
}

// Handle 404 error
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    if (err.status === 404) {
        res.status(404).json({ message: 'Not found' });
    }
    else {
        res.status(500).json({ message: 'Something looks wrong' });
    }
});

app.listen(5000, function() {
    console.log('Node server listening on port 5000');
});