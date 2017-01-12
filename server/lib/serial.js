var BTSP      = require('bluetooth-serial-port');
var sp        = new BTSP.BluetoothSerialPort();

var serial = function(io){

  var self = this;
  
  this.port = sp;
  this.connected = false;
  this.found = false;
  this.received = '';
  this.commands = ['stop', 'left', 'right', 'forward', 'backward'];

  this.find = function(){
    try{
      console.log('start inquiry');
      io.emit('bluetooth_searching');
      self.port.inquire();
      console.log('should be displayed before the end of inquiry');
    } catch(e){
      console.log(e);
    }
  };

  this.connect = function(address, name){  
    self.port.findSerialPortChannel(address, function (channel) {
      self.port.connect(address, channel, function () {
        self.connected = true;
        console.log('bluetooth connected');
        io.emit('bluetooth_connected');
      }, function () {
        io.emit('bluetooth_error');
        self.connected = false;
      });
    });
  };

  this.send = function(text){
    try{
      self.port.write( new Buffer(text, 'utf-8') );
    } catch(e){
      //console.log(e);
    }
  };

  this.checkInitEndString = function(init, end){
    var init = self.received.indexOf(init);
    var end = self.received.indexOf(end);
    if(  init >= 0 &&  end >= 0 ){
      return self.received.substring(init + 3, end);
    }
    return false;
  };

  this.checkInput = function(){
    var return_data = false;
    var text = '';
    var index = self.commands.findIndex(function(command){
      console.log(command);
      return command.indexOf(self.received) >= 0;
    });
    if( index >= 0 ){
      self.received = '';
      console.log(self.received);
      return {type: 'command', text: self.received};
    }
    if( self.received.length >= 7){
      // Check for front distance
      text = self.checkInitEndString('_fi', 'fe_');
      if( text ) {
        self.received = '';
        console.log('FRONT: ' + text);
        return {type: 'front_distance', text: text};
      }
      // Check for left distance
      text = self.checkInitEndString('_li', 'le_');
      if( text ) {
        self.received = '';
        console.log('LEFT: ' + text);
        return {type: 'left_distance', text: text};
      }
      // Check for right distance
      text = self.checkInitEndString('_ri', 're_');
      if( text ) {
        self.received = '';
        console.log('RIGHT: ' + text);
        return {type: 'right_distance', text: text};
      }
    }
    if( self.received.length >= 9){
      // Check for speed
      text = self.checkInitEndString('Speed: ', '.');
      if( text ) {
        self.received = '';
        console.log(text);
        return {type: 'speed', text: text};
      }
    }
    if(self.received.length >= 255){
      self.received = '';
      console.log('message to long')
    }
    return false;
  };

  // Port events

  self.port.on('found', function (address, name) {
    console.log('Arduino found at addres (' + address + ') with name (' + name  + ')');
    self.found = true;
    io.emit('bluetooth_found', 'Arduino found at addres (' + address + ') with name (' + name  + ')');
    self.connect(address, name);
  });

  self.port.on('data', function (data) {
    self.received = self.received + data.toString('utf8');
    var input = self.checkInput();
    if(input) io.emit(input.type, input.text);
  });

  self.port.on('closed', function () {
    console.log('bluetooth connection closed');
    io.emit('bluetooth_closed');
    self.found = false;
    self.connected = false;
    self.find();
  });

  self.port.on('finished', function () {
    console.log('inquiry finished');
    if(!self.found){
      console.log('no bluetooth found');
      self.find();
    }
  });
};

module.exports = serial;