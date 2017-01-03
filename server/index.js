var express = require('express');
var app     = express();
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var BTSP    = require('bluetooth-serial-port');
var serial  = new BTSP.BluetoothSerialPort();
var found   = false;
var connected = false;

// Set public directory
app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

// Socket.io
io.on('connection', function(socket){
  console.log('New socket connection');
  if(connected){
    io.emit('bluetooth_connected');
  }
  socket.on('command', function(command){
    try{
      serial.write( new Buffer(command, 'utf-8') );
    } catch(e){
      //console.log(e);
    }
  });
  socket.on('speed', function(speed){
    try{
      serial.write( new Buffer(speed, 'utf-8') );
    } catch(e){
      //console.log(e);
    }
  });
});

// Serial
var received = '';
var commands = ['stop', 'left', , 'right', 'forward', 'backward'];

var connect = function(address, name){  
  serial.findSerialPortChannel(address, function (channel) {
    serial.connect(address, channel, function () {
      connected = true;
      console.log('bluetooth connected');
      io.emit('bluetooth_connected');
    }, function () {
      io.emit('bluetooth_error');
      connected = false;
    });
  });
};

serial.on('found', function (address, name) {
  console.log('Arduino found at addres (' + address + ') with name (' + name  + ')');
  found = true;
  io.emit('bluetooth_found', 'Arduino found at addres (' + address + ') with name (' + name  + ')');
  connect(address, name);
});

serial.on('data', function (data) {
  received = received + data.toString('utf8');
  var index = commands.findIndex(function(command){
    return command == received;
  });
  if( (index  >= 0) || (received.indexOf('Speed: ') >=0 && received.slice(-1) == '.')){
    io.emit('bluetooth_data', received);
    received = '';
  } else if(received.length >= 255){
    received = '';
    console.log('message to long')
  }
});

serial.on('closed', function () {
  console.log('bluetooth connection closed');
  io.emit('bluetooth_closed');
  found = false;
  connected = false;
  find();
});

serial.on('finished', function () {
  console.log('inquiry finished');
  if(!found){
    console.log('no bluetooth found');
    find();
  }
});

var find = function(){
  console.log('start inquiry');
  io.emit('bluetooth_searching');
  serial.inquire();
  console.log('should be displayed before the end of inquiry');
};

// Server

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
  find();
});