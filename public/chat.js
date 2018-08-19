const form = document.querySelector('form');
const input = document.getElementById('m');
const messages = document.getElementById('messages');
const users = document.getElementById('users');
const feedback = document.getElementById('feedback');

function createElement(element, value) {
  const newElement = document.createElement(element);
  newElement.textContent = value;
  return newElement;
}

function appendNewMessage(msg) {
  const newMessageElement = createElement('li', msg);
  messages.appendChild(newMessageElement);
}

(function() {
  var socket = io();

  let username = prompt("What is your name?");
  username = username || 'User';
  let roomName = prompt("Type in the room name");
  roomName = roomName || '/';

  sessionStorage.setItem('username', username);
  sessionStorage.setItem('roomname', roomName);

  socket.emit('user connect', {
    username: username,
    roomName: roomName
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let username = sessionStorage.getItem('username');
    const message =  username + ': ' + input.value;
    // When user submits the form append the message immediately, and then emit an event to the server
    appendNewMessage(message);
    socket.emit('chat message', message);

    input.value = '';
    input.blur();
    return false;
  });

  input.addEventListener('keypress', function() {
    socket.emit('typing');
  });

  input.addEventListener('focusout', function() {
    socket.emit('not typing');
  });

  socket.on('chat message', function(msg) {
    appendNewMessage(msg);
  });

  socket.on('typing', function(msg) {
    feedback.innerHTML = `<p><em>${msg}</em></p>`;
  });

  socket.on('not typing', function() {
    feedback.innerHTML = '';
  });

  socket.on('user connect', function(msg) {
    const newUserElement = createElement('li', msg);
    users.appendChild(newUserElement);
  });

  socket.on('user disconnect', function(msg) {
    const disconnectedUser = createElement('li', msg);
    users.appendChild(disconnectedUser);
  });
})();
