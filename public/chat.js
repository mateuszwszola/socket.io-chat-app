const form = document.querySelector('form');
const input = document.getElementById('m');
const messages = document.getElementById('messages');
const users = document.getElementById('users');

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

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let username = sessionStorage.getItem('username');
    username = username || 'User';
    const message =  username + ': ' + input.value;
    // When user submits the form append the message immediately, and then emit event to the server.
    appendNewMessage(message);
    socket.emit('chat message', message);

    input.value = '';
    return false;
  });

  socket.on('chat message', function(msg) {
    appendNewMessage(msg);
  });

  socket.on('user connect', function(msg) {
    const newUserElement = createElement('li', msg);
    users.appendChild(newUserElement);
  });

  socket.on('user disconnect', function(msg) {
    const disconnectedUser = createElement('li', msg);
    users.appendChild(disconnectedUser);
  });


  let username = prompt("What is your name?");
  username = username || 'User';
  sessionStorage.setItem('username', username);
  socket.emit('user connect', username);
})();
