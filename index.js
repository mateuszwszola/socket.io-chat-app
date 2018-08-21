var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/socket-chat-app');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('DB connected!');
});
var User = require('./models/User');


app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  socket.on('user connect', function(data) {
    socket.username = data.username;
    socket.room = data.roomName;

    const newUser = new User({
      username: data.username,
      room: data.roomName
    });

    newUser
      .save()
      .then(user => {
        User.find({})
          .then(users => {
            io.to(socket.room).emit('users', users);
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));

    socket.join(socket.room);
    const msg = socket.username + ' connected to ' + socket.room;
    socket.broadcast.to(socket.room).emit('user connect', msg);
  });

  socket.on('disconnect', function() {
    User.findOneAndDelete({ username: socket.username })
      .then(user => {
        User.find({})
          .then(users => {
            io.to(socket.room).emit('users', users);
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));

    const msg = socket.username + ' disconnected from ' + socket.room;
    socket.broadcast.to(socket.room).emit('user disconnect', msg);
    socket.leave(socket.room);
  });

  // socket.on('users', function() {
  //   socket.to(socket.room).emit('users', users);
  // });
  
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
