var express = require('express');
var exphbs = require('express-handlebars');
var http = require('http');
var mongoose = require('mongoose');
var twitter = require('ntwitter');
var routes = require('./router');
var config = require('./config');
var streamHandler = require('./utils/streamHandler');

//we create an instance of express and set port
var app = express();
var port = process.env.PORT || 8080;

//setting handlebars as templating engine
app.engine('handlebars', exphbs({ defaultLayout : 'main'}));
app.set('view engine', 'handlebars');

//disable etag headers on responses
app.disable('etag');

//connect to mongolab
mongoose.connect('mongodb://user:user@ds021289.mlab.com:21289/react_test');

//create ntwitter instance
var twit = new twitter(config.twitter);

//Index route
app.get('/', routes.index);

//Page route
app.get('/page/:page/:skip', routes.page);

//Set /public as static dir
app.use('/', express.static(_dirname + '/public/'));

//Start server

var server = http.createServer(app).listen(port, function(){
    console.log("Express server listening on port", port);
});

//Initialize socket.io
var io = require('socket.io').listen(server);

// Set a stream listener for tweets matching tracking keywords
twit.stream('statuses/filter', { track: '#angular'}, function(stream){
    streamHandler(strem, io);
});