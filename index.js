var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket) {
  socket.on('user connect', function(data) {
    socket.username = data.username;
    socket.room = data.roomName;

    socket.join(socket.room);
    socket.broadcast.to(socket.room).emit('user connect', socket.username + ' connected to ' + socket.room);
  });

              
  socket.on('disconnect', function() {
    socket.broadcast.to(socket.room).emit('user disconnect', socket.username + ' disconnected from ' + socket.room);
  });
  
  socket.on('chat message', function(msg) {
    socket.broadcast.to(socket.room).emit('chat message', msg);
  });

  socket.on('typing', function() {
    socket.broadcast.to(socket.room).emit('typing', socket.username + ' is typing!');
  });

  socket.on('not typing', function() {
    socket.broadcast.to(socket.room).emit('not typing');
  });
});

server.listen(3000, function() {
  console.log('listening on *:3000');
});
