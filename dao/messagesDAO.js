var mongoose = require('mongoose');
var db = require('../model/db')
var usersController = require('../controller/usersController');
var subscribersController = require('../controller/subscribersController');

var Schema = mongoose.Schema;

// create a schema
var messageSchema = new Schema({
	ID: {
		type: String,
		unique: true
	},
	TEXT: String,
	LOCATION: [],
	TIME: Number,
	SENDER: String,
	VALIDFOR: Number,
	ISVALID: Boolean,
	SENDERNAME: String,
	TITLE: String
});

messageSchema.index({
	ID: 1
});
var Messages = mongoose.model('Messages', messageSchema);
module.exports = Messages;

// create a new message object
var createMessage = function(messageData) {
	var message = new Messages();
	message.ID = messageData.time + "_" + messageData.senderID;
	message.TEXT = messageData.text;
	message.LOCATION = [messageData.locationLat, messageData.locationLon];
	message.SENDER = messageData.senderID;
	message.SENDERNAME = messageData.senderName;
	message.ISVALID = true;
	message.VALIDFOR = parseInt(messageData.validFor) || -1;
	message.TIME = messageData.time;
	message.TITLE = messageData.title;
	return message;
};


// save user message to main table 
module.exports.saveMessage = function(newMessage, callback) {

	var message = createMessage(newMessage);

	// save this message
	message.save(function(err) {
		if (err) {
			callback({
				status: "failed"
			});
		} else {
			callback({
				status: "success"
			});
		}
	});

};

// fetch alive messages for publisher
module.exports.fetchPublishersAliveMessages = function(publisherID, callback) {

	Messages.find({
		SENDER: publisherID
	}, function(err, messageData) {
		if (err) {
			callback({
				status: "failed"
			});
		} else {
			var aliveMessages = [];
			var len = messageData.length;
			if (messageData.length > 0) {
				for (var index = 0; index < len; index++) {
					var timeNow = new Date();
					if (timeNow.getTime() < messageData[index].TIME + messageData[index].VALIDFOR * 3600 * 1000) {
						aliveMessages.push(messageData[index]);
					}
				}
				callback({
					status: "success",
					data: aliveMessages
				});
			} else {
				callback({
					status: "failed",
					data: "no results found"
				});
			}


		}
	});
};