var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mongoose = require('mongoose');
mongoose.connect(
  'mongodb://localhost/socket-chat-app',
  { useNewUrlParser: true }
);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', console.log.bind(console, 'Connection open!'));

var User = require('./models/User');

// Drop users collection
db.dropCollection('users', function(err, result) {
  if (err) return console.log(err);
  console.log(result);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  socket.on('user connect', function(data) {
    socket.username = data.username;
    socket.room = data.roomName;
    socket.join(socket.room);

    const newUser = new User({
      username: data.username,
      room: data.roomName
    });

    newUser
      .save()
      .then(user => {
        socket.userId = user._id;
        User.find({})
          .then(users => {
            io.to(socket.room).emit('users', users);
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));

    const msg = socket.username + ' connected to ' + socket.room;
    socket.broadcast.to(socket.room).emit('user connect', msg);
  });

  socket.on('disconnect', function() {
    User.findOneAndDelete({ _id: socket.userId })
      .then(user => {
        User.find({})
          .then(users => {
            socket.to(socket.room).emit('users', users);
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));

    const msg = socket.username + ' disconnected from ' + socket.room;
    socket.broadcast.to(socket.room).emit('user disconnect', msg);
    socket.leave(socket.room);
  });

  socket.on('chat message', function(msg) {
    socket.broadcast.to(socket.room).emit('chat message', msg);
  });

  socket.on('typing', function() {
    socket.broadcast
      .to(socket.room)
      .emit('typing', socket.username + ' is typing!');
  });

  socket.on('not typing', function() {
    socket.broadcast.to(socket.room).emit('not typing');
  });
});

server.listen(3000, function() {
  console.log('listening on *:3000');
});
