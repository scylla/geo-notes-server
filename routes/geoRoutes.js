var usersController = require('../controller/usersController');
var subscribersController = require('../controller/subscribersController');
var messagesController = require('../controller/messagesController');
var gcmHandler = require('../model/gcmHandler.js');
var geoCache = require('../lib/memcache.js');


var createUsersArray = function (subscribedToDict, matchArr) {
	var finalArr = [];
	var listLen = matchArr.length;

	for (var index = 0; index < listLen; index++) {
		if (subscribedToDict[matchArr[index].ID] != "subscribed"){
			finalArr.push(matchArr[index]);
		}
	}
	return finalArr;
};

var batchUpdateUsersMessageQueue = function (userID, messages) {
		var messageLen = messages.length;

		// push all alive messages to user queue
		for (var index = 0; index < messageLen; index++) {
			usersController.updateMessageQueue(userID, messages[index], function(results){
            	console.log("message pushed");
            });	
		}
};

module.exports = function(app) {

	// add a new user
	app.route('/adduser').post(function(req, res) {
		usersController.addUser(req.body, function(results) {
			res.json(results);
		});

		// usersController.setSmallestID(function(results) {
		// 	console.log(results);
		// });
	
	});

	// subscribe user 
	app.route('/subscribe').post(function(req, res) {

		subscribersController.subscribeUser(req.body, function(results) {
			if(results.status == "success") {
				usersController.updateSubscribedTo(req.body.subscriberID, req.body.publisherID, function(resultsIOne) {
					if(resultsIOne.status == "success") {
						res.json(results);
						geoCache.getFromLongCache(req.body.publisherID + "_alive", function(cacheResults){
							if(cacheResults.status == "success") {
								batchUpdateUsersMessageQueue(req.body.publisherID, cacheResults.data);
							} else {
								messagesController.fetchPublishersAliveMessages(req.body.publisherID, function(messageResults){
									if(messageResults.status == "success") {
										geoCache.addToLongCache(req.body.publisherID + "_alive", messageResults.data, function(cacheStatus){
											console.log("cache status " + cacheStatus);
										});
										batchUpdateUsersMessageQueue(req.body.subscriberID, messageResults.data);
									}
								});
							}
						});
					} else {
						res.json(results);
					}
				});
			} else {
				res.json(results);
			}
		});

		

		
	});

	// post a new message
	app.route('/publish').post(function(req, res) {

		// get all subscribers
		subscribersController.getAllSubscribers(req.body.senderID, function(subsData) {
			if(subsData.status == "success") {
				var subscribersList = subsData.data;
				var subscribersLength = subscribersList.length;
				for(var index = 0; index < subscribersLength; index++) {
					// push data to subscriber queue
              		usersController.updateMessageQueue(subscribersList[index], req.body, function(results){
              			console.log("message queue updated");
              		});
              	}
			}
		});

		// save message to main messages table
		messagesController.saveMessage(req.body, function(results) {
			res.json(results);
		});

	});
	
	// check for new messages at a location fo the user
	app.route('/location').post(function(req, res) {
		usersController.getActiveMessagesAtLocation(req.body.userID, [req.body.locationLat, req.body.locationLon], function(messageData) {
			if(messageData.status == "failed") {
				res.json(messageData);
			} else {
				var messageList = messageData.data;
				var dataLen = messageList.length;

				for (var index = 0;index < dataLen; index++) {
					console.log("gogo " + dataLen);
					gcmHandler.pushTOGCM(req.body.gcmID, messageList[index]);

				}
				res.json({status : "success"});
			}
		});
	});

	// search users
	app.route('/search').post(function(req, res){
		var userID = req.body.userID;
		usersController.getMatchingUsers(req.body, function(results){

			if(results.status == "success") {

				geoCache.getFromShortCache(userID + "_subs_list", function(cacheResults){

					var finalArr = [];

					if(cacheResults.status == "success") {
						res.json({status : "success", data : createUsersArray(cacheResults.data, results.data)});
					} else {
						usersController.getSubscribedTo(userID, function(subList) {
							if(subList.status == "success") {

								var tempList = subList.data;
								var subscribedToDict = {};
								var listLen = tempList.length;
								for (var index = 0; index < tempList.length; index++) {
									subscribedToDict[tempList[index]] = "subscribed";
								}

								geoCache.addToShortCache(userID + "_subs_list", subscribedToDict, function(cacheStatus){
									console.log("added to cache ");
								});

								res.json({status : "success", data : createUsersArray(subscribedToDict, results.data)});

								} else {
									res.json(results);
								}

							});
						} 
				});
			} else {
				res.json(results);
			}

		});
	});

	// fetch publisher messages
	app.route('/fetch').post(function(req, res){
		messagesController.fetchPublishersAliveMessages(req.body.publisherID, function(results){
			res.json(results);
		});
	});

	// delete user message 
	app.route('/delete').post(function(req, res){
		usersController.deleteSentMessage(req.body.userID, req.body.senderID, req.body.time, function(results){
			res.json(results);
		});
	});

	// check if user exists
	app.route('/checkuser').post(function(req, res){
		usersController.checkUserExists(req.body.userID, function(results){
			res.json(results);
		});
	});

	// fetch user subscriptions
	app.route('/fetchsubscriptions').post(function(req, res){
		usersController.getSubscribedTo(req.body.userID, function(subsList){
			if(subsList.status == "success") {
				usersController.getSubscribersNames(subsList.data, function(subsName){
						res.json(subsName);
				});
			} else {
				res.json(subsList);
			}
		});
	});

};