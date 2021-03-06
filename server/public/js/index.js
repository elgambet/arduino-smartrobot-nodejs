var socket = io();

var commands = function(){
  var self = this;

  this.lastcommand = '';

  this.send = function(key){
    var command = false;
    var command_string = '';
    switch (key) {
      case 40:
        command = 'b'; // down
        command_string = 'Down (b)';
        break;
      case 38:
        command = 'f'; // up
        command_string = 'Up (f)';
        break;
      case 37:
        command = 'l'; // left
        command_string = 'Left (l)';
        break;
      case 39:
        command = 'r'; // right
        command_string = 'Right (r)';
        break;
      default:
        command = 's'; // stop
        command_string = 'Stop (s)';
        break;
    }
    // Send command to arduino
    if(command != self.lastcommand){
      self.lastcommand = command;
      socket.emit('command', command);
      $( ".console-messages" ).prepend( '<p>Sending command: ' + command_string + '</p>' );
      $( ".last-command" ).text( command_string );
    }
  };
};

var main = function(){

  var self = this;

  this.commands = new commands();

  this.init = function(){
    var self = this;
    
    this.searching = function(){
      $( '#searching').show();
      $( '#online').hide();
      $( '#offline').hide();
      $( '#found').hide();
      $( '#last-speed').prop( "disabled", true );
    };

    this.searching = function(){
      $( '#searching').show();
      $( '#found').hide();
      $( '#online').hide();
      $( '#offline').hide();
      $( '#last-speed').prop( "disabled", true );
    };

    this.online = function(){
      $( '#online').show();
      $( '#searching').hide();
      $( '#found').hide();
      $( '#offline').hide();
      $( '#last-speed').prop( "disabled", false );
    };

    this.offline = function(){
      $( '#offline').show();
      $( '#searching').hide();
      $( '#online').hide();
      $( '#found').hide();
      $( '#last-speed').prop( "disabled", true );
    };

    socket.on('connection', function(socket){
      $( ".console-messages" ).prepend( '<p>Socket.io connected</p>' );
    });
    socket.on('bluetooth_searching', function(){
      $( ".console-messages" ).prepend( '<p>Searhing bluetooth</p>' );
      self.searching();
    });
    socket.on('bluetooth_found', function(msg){
      $( ".console-messages" ).prepend( '<p>' + msg + '</p>' );
      self.found();
    });
    socket.on('bluetooth_connected', function(msg){
      $( ".console-messages" ).prepend( '<p>Bluetooth connected</p>' );
      self.online();
    });
    socket.on('bluetooth_error', function(msg){
      $( ".console-messages" ).prepend( '<p>Bluetooth error</p>' );
      self.offline();
    });
    socket.on('bluetooth_closed', function(msg){
      $( ".console-messages" ).prepend( '<p>Bluetooth closed</p>' );
      self.offline();
    });
    socket.on('bluetooth_data', function(msg){
      $( ".console-messages" ).prepend( '<p>Message from car: ' + msg + '</p>' );-
      $( ".last-message" ).text( msg );
    });
    // Send command to car
    $(document).keydown(function(e){
      self.commands.send(e.keyCode);
    });
    // Stop car
    $(document).keyup(function(e){
      self.commands.send(0);
    });
    $( '#show-console').click(function(){
      $( '.terminal' ).toggle();
    });
    $( "#last-speed" ).change(function() {
      var speed = $( "#last-speed" ).val();
      socket.emit('speed', speed);
      var speed_text = '';
      if(speed == 'F') speed_text = 'Fast';
      else if(speed == 'N') speed_text = 'Normal';
      else if(speed == 'S') speed_text = 'Slow';
      $( ".console-messages" ).prepend( '<p>Change speed: ' + speed + '</p>' );
      $( ".last-command" ).text( 'Change speed: ' + speed );
    });
  }
};

$(document).ready(function() {
  new main().init();
});