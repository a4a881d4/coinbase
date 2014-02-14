
/*
 * GET users listing.
 */
var	config = require('../confige').config 
		couchdburl = config.couchdburl
	, nano = require('nano')(couchdburl)
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

exports.txvout = function(req,res) {
	var h = req.params['id'];
	var db = nano.use('coinbase');
	db.get( h, function(err,body) {
			var result={};
			if( err ) {
				result={'err':err,'body':body};
			}
			else if( body.type!='tx' ) {
				result={'err':'bad hash','body':null};
			}
			else {
				var n = parseInt(req.query.vout);
				result={'err':'cannot find vout','body':null};
				var vouts = body.vout;
				for( var idx in vouts ) {
					if( vouts[idx].n==n ) {
						result.err=null;
						result.body={'address':vouts[idx].scriptPubKey.addresses,'value':vouts[idx].value,'spend':vouts[idx].spend};
					}
				}
			}
			res.json(result);
		})
	;
};

exports.account = function(req,res) {
	var cointype = req.params['id'];
	var address = req.query.address;
	var db = nano.use('coinbase');
	db.view('vout','coin',{ 'startkey':[ cointype, address ], 'limit':1, 'group_level':2 }, function(err,body) {
			res.json({'err':err,'body':body});
		})
	;
};	
