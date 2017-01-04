var socket = function(io, serial){

  var self = this;
  
  this.events = function(socket){
    socket.on('command', function(command){
      serial.send( command );
    });

    socket.on('speed', function(speed){
      serial.send( speed );
    });
  };

  // Socket.io
  io.on('connection', function(socket){
    console.log('New socket connection');
    if(serial.connected){
      io.emit('bluetooth_connected');
    }
    self.events(socket);
  });

};

module.exports = socket;