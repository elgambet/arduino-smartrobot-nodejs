var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var serlib  = require('./lib/serial');
var soclib  = require('./lib/socket');
var serial  = new serlib(io);
var socket  = new soclib(io, serial);

// Set public directory
app.use(express.static('public'));

// Server
http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
  serial.find();
});