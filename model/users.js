var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  ID : {type: String, unique: true},	
  NAME : String,
  TYPE : String,
  GCMID : String,
  LOCATION : [],
  MESSAGEQUEUE : []
});

var Users = mongoose.model('Users', userSchema);
module.exports = Users;