var mongoose = require('mongoose');
var db = require('../model/db')
var usersController = require('../controller/usersController');
var messagesController = require('../controller/messagesController');

var Schema = mongoose.Schema;

// create a schema
var subscribersSchema = new Schema({
  PUBLISHERID : {type: String, unique: true},	
  SUBSCRIBERS : []
});

subscribersSchema.index({ PUBLISHERID: 1});

var Subscribers = mongoose.model('Subscribers', subscribersSchema);
module.exports = Subscribers;

// add new publisher
module.exports.addNewPublisher = function(newUser, callback){

	var subscriber = new Subscribers();
    subscriber.PUBLISHERID = newUser.ID;
   	subscriber.SUBSCRIBERS = []

    subscriber.save(function(err){
        if(err)
        	callback({status : "failed"});
        else callback(status : "success");
    });

};

// subscribe user
module.exports.subscribeUser = function(subscribe, callback){

	Subscribers.update({PUBLISHERID : subscribe.publisherID}, {$push: {"SUBSCRIBERS" : subscribe.subscriberID}}, {upsert:true}, function(err, model) {
        if(err){
            callback({status : "failed"});
        } else {
        	callback({status : "success"});
        }
    });

};

// get subscribers list for the publisher
module.exports.getAllSubscribers = function(publisher, callback){

	Subscribers.find({PUBLISHERID : publisher}, 'SUBSCRIBERS', function(err, subscribersList){
        if (err) {
            callback({status : "failed"});
        } else {
        	if (subscribersList.length > 0) {
        		callback({status : "success", data : subscribersList[0].SUBSCRIBERS});
        	} else {
        		callback({status : "failed"});
        	}
        	
        }
    });   

};









