//File name: gcmHandler.js
var gcm = require('node-gcm');

_GCM_API_KEY = 'AIzaSyAzew3ogvpdtR6NfdjbNO5GFkCU89g3oMQ';

var sender = new gcm.Sender(_GCM_API_KEY);

_TEST_KEY = 'fiUTx5sHabo:APA91bGHZA4naFSh6r937Ovu0cxx4YwRRzuyMegIX5W4GeUEsjimQ8JgzLEw0niHwpAd15-DxL8Xe2fJmUKa9V1fVujJ3xB-wirhv60mVT99sSX-_HhFhN5cBzeKWdd2akm1aV-CFOyy';
module.exports.pushTOGCM = function(gcmID, message){
	
	var gcmMessage = new gcm.Message();
	
	for (var property in message) {
    	if (message.hasOwnProperty(property)) {
    		gcmMessage.addData(property, message[property]);
    	}
	}
	
	gcmMessage.addNotification({
        title: "Hello from Geo Notes",
        body: "Guys this is our time..."
    });

	// console.log(gcmMessage);
	// console.log(gcmID);
	// gcmID = _TEST_KEY;

	sender.send(gcmMessage, { registrationTokens: [gcmID] }, function (err, response) {
    	if(err) 
    		console.log("gcm message failed " + err);
    	else    
    		console.log("gcm message sent");
	});

};
