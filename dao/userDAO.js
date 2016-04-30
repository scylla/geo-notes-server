var mongoose = require('mongoose');
var db = require('../model/db');
var subscribersController = require('../controller/subscribersController');
var messagesController = require('../controller/messagesController');
var gcmHandler = require('../model/gcmHandler.js');
var GeoPoint = require('geopoint');

var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
	ID: {
		type: String,
		unique: true
	},
	NAME: String,
	TYPE: String,
	GCMID: String,
	LOCATION: [],
	MESSAGEQUEUE: [],
	SUBSCRIBEDTO: []
});

userSchema.index({
	ID: 1
});

var Users = mongoose.model('Users', userSchema);
module.exports = Users;


// add new user
module.exports.addUser = function(newUser, callback) {

	var user = new Users();

	user.ID = newUser.userID;
	user.NAME = newUser.userName;
	user.TYPE = newUser.userType;
	user.GCMID = newUser.gcmID;
	user.LOCATION = [newUser.locationLat, newUser.locationLon];
	user.MESSAGEQUEUE = [];
	user.SUBSCRIBEDTO = [];

	// save this user
	user.save(function(err) {
		if (err)
			callback("failed");
		else {
			subscribersController.addNewPublisher({
				ID: newUser.userID
			}, callback);
		}
	});
};

// get subscribed to list
module.exports.getSubscribedTo = function(userID, callback) {

	Users.find({
		ID: userID
	}, 'SUBSCRIBEDTO', function(err, subscriberData) {
		if (err) {
			callback({
				status: "failed"
			});
		} else {

			if (subscriberData.length > 0) {
				var susbList = subscriberData[0].SUBSCRIBEDTO;
				var len = susbList.length;
				if (len <= 0) {
					callback({
						status: "failed"
					});
				} else {
					callback({
						status: "success",
						data: subscriberData[0].SUBSCRIBEDTO
					});
				}
			} else {
				callback({
					status: "failed"
				});
			}
		}
	});
};

// set smallest_ID
module.exports.setSmallestID = function(callback) {

	Users.findOne().sort({
		"_id": -1
	}).select({
		"ID": 1,
		"_id": 1
	}).exec(function(err, results) {
		if (err) {
			callback({
				status: "failed"
			});
		} else {
			if (results) {
				smallestID = results._id;
				callback({
					status: "success",
					newID: smallestID
				});
			} else {
				callback({
					status: "failed"
				});
			}
		}
	});
};

// get gcmID for user
module.exports.getGCMID = function(userID, callback) {

	Users.find({
		ID: userID
	}, 'GCMID', function(err, gcmID) {
		if (err) {
			callback({
				status: "failed"
			});
		} else {
			callback({
				status: "success",
				data: gcmID
			});
		}
	});
};

// add message to user queue
module.exports.updateMessageQueue = function(userID, message, callback) {

	Users.update({
		ID: userID
	}, {
		$push: {
			"MESSAGEQUEUE": message
		}
	}, {
		upsert: true
	}, function(err, model) {
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

// delete sent messages
module.exports.deleteSentMessage = function(userID, senderID, mtime, callback) {

	Users.update({
		ID: userID
	}, {
		$pull: {
			"MESSAGEQUEUE": {
				senderID: senderID,
				time: mtime
			}
		}
	}, function(err, model) {

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

// update subscribeTo list
module.exports.updateSubscribedTo = function(userID, subscribeToID, callback) {

	Users.update({
		ID: userID
	}, {
		$addToSet: {
			SUBSCRIBEDTO: subscribeToID
		}
	}, function(err, model) {
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


// get active messages at this location
module.exports.getActiveMessagesAtLocation = function(userID, location, callback) {

	var finalMessages = [];
	var g1 = new GeoPoint(parseFloat(location[0]), parseFloat(location[1]));

	Users.find({
		ID: userID
	}, 'MESSAGEQUEUE', function(err, messageData) {
		if (err) {
			callback({
				status: "failed"
			});
		} else {

			try {
				var messageData = messageData[0].MESSAGEQUEUE;
				var len = messageData.length;

				for (var i = 0; i < len; i++) {

					if (messageData[i].locationLat == null || messageData[i].locationLon == null)
						continue;

					var g2 = new GeoPoint(parseFloat(messageData[i].locationLat), parseFloat(messageData[i].locationLon));

					if (g1.distanceTo(g2, true) <= 0.01) {
						finalMessages.push(messageData[i]);
					}

				}

				callback({
					status: "success",
					data: finalMessages
				});
			} catch (exception) {
				callback({
					status: "success",
					data: finalMessages
				});
			}
		}
	});



};

// get users matching query
module.exports.getMatchingUsers = function(query, callback) {

	if (parseInt(query.lastID) == -1) {

		Users.find({
			NAME: {
				"$regex": query.query,
				"$options": "i"
			}
		}).limit(10).sort({
			"_id": -1
		}).select({
			"ID": 1,
			"NAME": 1,
			"TYPE": 1
		}).exec(function(err, matchingUsers) {
			if (err) {
				callback({
					status: "failed",
					data: "query failed"
				});
			} else {
				// console.log("query res " + matchingUsers);
				if (matchingUsers.length > 0)
					callback({
						status: "success",
						data: matchingUsers
					});
				else
					callback({
						status: "failed",
						data: "no results found"
					});
			}
		});

	} else {

		Users.find({
			NAME: {
				"$regex": query.query,
				"$options": "i"
			},
			_id: {
				"$lt": query.lastID
			}
		}).limit(10).sort({
			"_id": -1
		}).select({
			"ID": 1,
			"NAME": 1,
			"TYPE": 1
		}).exec(function(err, matchingUsers) {
			if (err) {
				callback({
					status: "failed",
					data: "query failed"
				});
			} else {
				if (matchingUsers.length > 0)
					callback({
						status: "success",
						data: matchingUsers
					});
				else
					callback({
						status: "failed",
						data: "no results found"
					});
			}
		});

	}

};

// check if user exists
module.exports.checkUserExists = function(userID, callback) {

	Users.find({
		ID: userID
	}, "ID", function(err, userData) {
		if (err) {
			callback({
				status: "failed"
			});
		} else {
			if (userData.length > 0)
				callback({
					status: "success",
					data: "user exists"
				});
			else
				callback({
					status: "failed",
					data: "new user"
				});
		}
	});
};


// get all users names in array
module.exports.getSubscribersNames = function(IDArray, callback) {
	console.log(IDArray);
	Users.find({
		ID: {
			$in: IDArray
		}
	}, 'NAME ID', function(err, userNames) {
		if (err) {
			callback({
				status: "failed"
			});
		} else {

			if (userNames.length > 0)
				callback({
					status: "success",
					data: userNames
				});
			else
				callback({
					status: "failed"
				});
		}
	});
};