var usersDAO = require('../dao/userDAO');

module.exports.addUser = function(newUser, callback) {
	console.log("adding new user");
	usersDAO.addUser(newUser, callback);
}

module.exports.getGCMID = function(userID, callback) {
	console.log("getting gcm id for user");
	usersDAO.getGCMID(userID, callback);
}

module.exports.updateMessageQueue = function(userID, message, callback) {
	console.log("updating user message queue");
	usersDAO.updateMessageQueue(userID, message, callback);
}

module.exports.getActiveMessagesAtLocation = function(userID, location, callback) {
	console.log("getting user messages at " + location);
	usersDAO.getActiveMessagesAtLocation(userID, location, callback);
}

module.exports.getMatchingUsers = function(query, callback) {
	console.log("getting users matching " + query);
	usersDAO.getMatchingUsers(query, callback);
}

module.exports.setSmallestID = function(callback) {
	console.log("setting smallest ID");
	usersDAO.setSmallestID(callback);
}

module.exports.getSubscribedTo = function(userID, callback) {
	console.log("getting subscribed to list");
	usersDAO.getSubscribedTo(userID, callback);
}

module.exports.updateSubscribedTo = function(userID, subscribeToID, callback) {
	console.log("update user subscribed to list");
	usersDAO.updateSubscribedTo(userID, subscribeToID, callback);
}

module.exports.deleteSentMessage = function(userID, senderID, time, callback) {
	console.log("deleting user message");
	usersDAO.deleteSentMessage(userID, senderID, time, callback);
}

module.exports.checkUserExists = function(userID, callback) {
	console.log("checking if user exists");
	usersDAO.checkUserExists(userID, callback);
}

module.exports.getSubscribersNames = function(IDArray, callback) {
	console.log("fetch subscriber names");
	usersDAO.getSubscribersNames(IDArray, callback);
}
