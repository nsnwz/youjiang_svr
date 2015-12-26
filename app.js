/**
 * Created by miller on 2015/10/14.
 */
var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var dataapi = require('./dataapi');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use('/', routes);
/*
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
*/

console.log(dataapi.seed);

var server = app.listen(80, function() {
    console.log('Listening on port %d', server.address().port);
});

