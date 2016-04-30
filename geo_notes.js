// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// db schemas
var mongoose = require('mongoose');
var Users = require('./model/users');
var Subscribers = require('./model/subscribers');
var Messages = require('./model/messages');
var db = require('./model/db')


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

var geoRoutes = require("./routes/geoRoutes");
geoRoutes(app);


// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	console.log('request received');
    res.json({ message: 'hooray! welcome to our api!' });   
});

// -----------------------------------------------------------------------------------
// utility functions used
// push message to user queue and gcm server
var pushMessage = function(message, subscriberID) {
	
	// get GCM ID for subscriber
	Users.find({ ID: subscriberID }, 'GCMID', function(err, gcmID) {
		if(err) {
			console.log("GCMERR");
			throw err;
		} else {
			// update user message queue
			Users.update({ID : subscriberID}, {$push : {"MESSAGEQUEUE" : message}}, {upsert : true}, function(err, model){
				if(err) {
					console.log("UPDATEERR");
					throw err;
				} else {
					// push message to gcm server here
					pushTOGCM(gcmID, message);
				} 

			});
		}
	});
}

// more routes for our API will happen here

// create users for app
// on routes that end in /bears
// ----------------------------------------------------
router.route('/users')

    // create new user (accessed at POST http://localhost:8080/api/users)
    .post(function(req, res) {
        
        var user = new Users();      // create a new instance of the Bear model
        console.log(req.body);

        var newUser = req.body;
        user.ID = newUser.userID;
        user.NAME = newUser.userName;
        user.TYPE = newUser.userType;
        user.GCMID = newUser.gcmID;
        user.LOCATION = newUser.userLocation;
        user.MESSAGEQUEUE = [];

        // save this user
        user.save(function(err) {
        	if(err)
        		res.json({status : "failed"});
        	else {  // add user to publishers table
        		var subscriber = new Subscribers();
        		subscriber.PUBLISHERID = user.ID;
        		subscriber.SUBSCRIBERS = []

        		subscriber.save(function(err){
        			if(err)
        				res.json({status : "failed"});
        			else res.json({status : "success"});
        		});
        	}
        });
        
    });

// ----------------------------------------------------------
router.route('/subscribe')

    // subscribe user (accessed at POST http://localhost:8080/api/subscribe)
    .post(function(req, res) {
        
        var subscriber = new Subscribers();      // create a new instance of the Bear model
        console.log(req.body);

        Subscribers.update({PUBLISHERID : req.body.publisherID}, {$push: {"SUBSCRIBERS" : req.body.subscriberID}}, {upsert:true}, function(err, model) {
                  if(err){
                    res.json({status : "failed"});
                  }	else {
                    res.json({status : "success"});

                    // push all the alive messages to the new user

                  }
        });
        
});

// ----------------------------------------------------------

// ----------------------------------------------------------
router.route('/publish')

    // create new user (accessed at POST http://localhost:8080/api/publish)
    .post(function(req, res) {
        
        var subscriber = new Subscribers();      // create a new instance of the Bear model
        console.log(req.body);
        var message = req.body;

        message.ID = message.time + "_" + message.sender;
        message.TEXT = message.text;
        message.LOCATION = message.location;
        message.SENDER = message.sender;
        message.ISVALID = true;
        message.VALIDFOR = message.validFor || -1;
        message.TIME = message.time;

		Subscribers.find({PUBLISHERID : message.sender}, 'SUBSCRIBERS', function(err, subscribersList){
              if (err) {
              	console.log(err);
              	res.json({status : "failed"});
              } else {
              	var subscribers = subscribersList[0].SUBSCRIBERS;
              	var subscribersLength = subscribers.length;
              	for(var index = 0; index < subscribersLength; index++) {
              		pushMessage(message, subscribers[index]);
              	}
              	res.json({status : "success"});
              }
        });        
        
});






// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);