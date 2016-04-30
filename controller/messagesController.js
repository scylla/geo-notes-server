var messagesDAO = require('../dao/messagesDAO');

module.exports.saveMessage = function(message, callback) {
	console.log("saving user message");
	messagesDAO.saveMessage(message, callback);
}

module.exports.fetchPublishersAliveMessages = function(publisherID, callback) {
	console.log("fetching publishers alive messages");
	messagesDAO.fetchPublishersAliveMessages(publisherID, callback);
}
