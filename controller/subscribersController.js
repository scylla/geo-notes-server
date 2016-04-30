var subscribersDAO = require('../dao/subscribersDAO');

module.exports.addNewPublisher = function(newUser, callback) {
	console.log("adding new publisher");
	subscribersDAO.addNewPublisher(newUser, callback);
}

module.exports.subscribeUser = function(subscribe, callback) {
	console.log("creating new subscription");
	subscribersDAO.subscribeUser(subscribe, callback);
}

module.exports.getAllSubscribers = function(publisher, callback) {
	console.log("fetching subscribers list");
	subscribersDAO.getAllSubscribers(publisher, callback);
}