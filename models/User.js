var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true 
  }
});

module.exports = Users = mongoose.model('User', userSchema);