var NodeCache = require( "node-cache" );

module.exports.addToShortCache = function(key, data, callback) {
	global.shortCache.set( key, data, function( err, success ){
  		if( !err && success ){
    		// console.log( success );
    		callback({status : "success"});
  		} else callback({status : "failed"});
	});

};

module.exports.getFromShortCache = function(key, callback) {
	global.shortCache.get( key,  function( err, value ){
  		if( !err){
  			if (value == undefined)
  				callback({status : "failed"});
  			else {
  				
    			callback({status : "success", data : value});
  			}
  		} else callback({status : "failed"});
	});

};


module.exports.addToLongCache = function(key, data, callback) {
	global.longCache.set( key, data, function( err, success ){
  		if( !err && success ){
    		callback({status : "success"});
  		} else callback({status : "failed"});
	});

};

module.exports.getFromLongCache = function(key, callback) {
	global.longCache.get( key, function( err, value ){
  		if( !err){
  			if (value == undefined)
  				callback({status : "failed"});
  			else {
    			callback({status : "success", data : value});
  			}
  		} else callback({status : "failed"});
	});
};
