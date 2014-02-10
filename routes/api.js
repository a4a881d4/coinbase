
/*
 * GET users listing.
 */
var couchdburl = require('../conf').couchdburl
	; nano = require('nano')(couchdburl)
  ;
  
exports.hash = function(req, res){
	var h = req.params.id;
	var db = nano.use('coinbase');
	db.get( h, function(err,body) {
			res.json({'err':err,'body':body});
		})
	;
};

exports.heights = function(req,res) {
	var cointype = req.params['id'];
	var start = parseInt(req.query.start);
	var db = nano.use('coinbase');
	db.view('height','coin',{ 'startkey':[ cointype, start ], 'limit':10 }, function(err,body) {
			res.json({'err':err,'body':body});
		})
	;
};