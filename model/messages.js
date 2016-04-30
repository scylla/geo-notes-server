var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var messageSchema = new Schema({
  ID : {type: String, unique: true},	
  TEXT : String,
  LOCATION : [],
  TIME : Number,
  SENDER : String,
  VALIDFOR : Number,
  ISVALID : Boolean
});

var Messages = mongoose.model('Messages', messageSchema);
module.exports = Messages;