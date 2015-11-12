/**
 * Created by miller on 2015/10/14.
 */
var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use('/', routes);



var server = app.listen(80, function() {
    console.log('Listening on port %d', server.address().port);
})

