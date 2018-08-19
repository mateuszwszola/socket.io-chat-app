var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket) {
  socket.on('user connect', function(username) {
    socket.username = username;
    socket.broadcast.emit('user connect', username + ' connected!');
  });

  socket.on('disconnect', function() {
    socket.broadcast.emit('user disconnect', socket.username + ' disconnected!');
  });

  socket.on('chat message', function(msg) {
    socket.broadcast.emit('chat message', msg);
  });
});

server.listen(3000, function() {
  console.log('listening on *:3000');
});
