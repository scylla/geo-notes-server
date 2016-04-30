// geo_mvc.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var compression = require('compression');
var NodeCache = require("node-cache");

global.shortCache = new NodeCache({
	stdTTL: 10
});
global.longCache = new NodeCache({
	stdTTL: 100
});

global.smallestID = -1;

app.use(compression());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

var port = process.env.PORT || 9000; // set our port

// ROUTES FOR OUR API
// =============================================================================
// var router = express.Router();              // get an instance of the express Router

var geoRoutes = require("./routes/geoRoutes");

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
// app.use('/api', geoRoutes);

geoRoutes(app);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);