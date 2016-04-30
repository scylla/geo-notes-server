var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var subscribersSchema = new Schema({
  PUBLISHERID : {type: String, unique: true},	
  SUBSCRIBERS : []
});


var Subscribers = mongoose.model('Subscribers', subscribersSchema);
module.exports = Subscribers;