var socket = io();

var commands = function(){
  var self = this;

  this.lastcommand = '';
  this.lasteye = 'R';

  this.sendSpeed = function(){
    var speed = $( "#last-speed" ).val();
    socket.emit('speed', speed);
    var speed_text = '';
    if(speed == 'F') speed_text = 'Fast';
    else if(speed == 'N') speed_text = 'Normal';
    else if(speed == 'S') speed_text = 'Slow';
    $( ".console-messages" ).prepend( '<p>Change speed: ' + speed + '</p>' );
    $( ".last-command" ).text( 'Change speed: ' + speed );
  };

  this.setSpeed = function(add){
    var speed = $( "#last-speed" ).val();
    if(add){
      if(speed == 'N') $( "#last-speed" ).val('F');
      else if(speed == 'S') $( "#last-speed" ).val('N');
    } else {
      if(speed == 'F') $( "#last-speed" ).val('N');
      else if(speed == 'N') $( "#last-speed" ).val('S');
    }
    self.sendSpeed();
  };

  this.send = function(key){
    var command = false;
    var command_string = '';
    $( ".last-front-distance-container" ).removeClass('border-color-warning');
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
      case 32:
        if(self.lasteye == 'R'){
          self.lasteye = 'L';
          command = 'L'; // left eyes
          command_string = 'Left eyes (L)';
        } else {
          self.lasteye = 'R';
          command = 'R'; // right eyes
          command_string = 'Right eyes (R)';  
        }
        break;
      case 107:
        self.setSpeed(true);
        break;
      case 109:
        self.setSpeed();
        break;
      default:
        command = 's'; // stop
        command_string = 'Stop (s)';
        break;
    }
    // Send command to arduino
    if(command && command != self.lastcommand){
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
      //self.found();
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
    socket.on('command', function(msg){
      if(msg.trim() !== ''){
        $( ".console-messages" ).prepend( '<p>Command from car: ' + msg + '</p>' );-
        $( ".last-command" ).text( msg );
      }
    });
    socket.on('speed', function(msg){
      $( ".console-messages" ).prepend( '<p>Speed from car: ' + msg + '</p>' );-
      $( ".last-speed" ).text( msg );
    });
    socket.on('front_distance', function(msg){
      $( ".console-messages" ).prepend( '<p>Front distance from car: ' + msg + '</p>' );-
      $( ".last-front-distance" ).text( msg );
      $( ".last-front-distance-container" ).addClass('border-color-warning');
    });
    socket.on('right_distance', function(msg){
      $( ".console-messages" ).prepend( '<p>Right distance from car: ' + msg + '</p>' );-
      $( ".last-right-distance" ).text( msg );
    });
    socket.on('left_distance', function(msg){
      $( ".console-messages" ).prepend( '<p>Left distance from car: ' + msg + '</p>' );-
      $( ".last-lefft-distance" ).text( msg );
    });
    // Send command to car
    $(document).keydown(function(e){
      self.commands.send(e.which);
    });
    // Stop car
    $(document).keyup(function(e){
      self.commands.send(0);
    });
    $( '#show-console').click(function(){
      $( '.terminal' ).toggle();
    });
    $( "#last-speed" ).change(function() {
      self.sendSpeed();
    });
  }
};

$(document).ready(function() {
  new main().init();
});