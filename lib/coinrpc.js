var configs = require('../config')
	, config = configs.config.rpc[configs.coin]
	, bitcoin = require('bitcoin')
	, client = new bitcoin.Client({
  									host: 'localhost'
  								, port: config.rpcport
  								, user: config.rpcuser
  								, pass: config.rpcpass
  								})
  ;

Object.defineProperty(global, '__stack', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function(){
    return __stack[1].getLineNumber();
  }
});

Object.defineProperty(global, '__file', {
  get: function(){
    return __stack[1].getFileName().split('/').slice(-1)[0];
  }
});

var logfun = function(file,lineno,message) {
	console.log(file+'#'+lineno+':\t'+message);
};

var top = function( callback ) {
	client.getInfo(function( err, info ) {
		if( err==null ) {
			callback( info.blocks-1 );
		}
		else
			logfun(__file,__line,JSON.stringify(err));
	});
};

var height = function( h, callback ) {
	client.getBlockHash(h,function( err, hash ) {
		if( err==null ) {
			callback( hash );
		}
		else
			logfun(__file,__line,err);
	});
};
	
var block = function( h, callback ) {
	client.getBlock(h,function( err, block ) {
		if( err==null ) {
			var dump = {};
			var keys = ['previousblockhash','nextblockhash','tx','time'];
			for( var key in keys ) {
				if( block[keys[key]] )
					dump[keys[key]]=block[keys[key]];
			}
			callback( {'type':'block', '_id':block['hash'], 'height':block.height, comment:JSON.stringify(dump)} );
		}
		else
			logfun(__file,__line,err);
	});
};

var tx = function( h, callback ) {
		client.getRawTransaction( h, function( err, txraw ) {
			if( err==null ) {
				client.decodeRawTransaction( txraw, function( err, tx ) {
					if( err==null ) {
						dump = {};
						txobj={};
						txobj['type']='tx';
						txobj['_id']=tx['txid'];
						dump['vin']=[];
						for( var x in tx['vin'] ) {
							var y={};
							var keys = ['coinbase','txid','vout'];
							for( var key in keys ) {
								if( tx['vin'][x][keys[key]] ) 
									y[keys[key]]=tx['vin'][x][keys[key]];
							}
							dump['vin'].push(y);
						}
						dump['vout']=tx['vout']
						var value=0;
						for( var x in dump['vout'] ) {
							value+=dump['vout'][x]['value'];
							if( dump['vout'][x]['scriptPubKey'] ) {
								var keys=['asm','hex','reqSigs'];
								for( var key in keys )
									if( dump['vout'][x]['scriptPubKey'][keys[key]] )
										delete dump['vout'][x]['scriptPubKey'][keys[key]];
							}
						}
						txobj['comment']=JSON.stringify(dump);
						txobj['value']=value;
						callback(txobj);
					}
					else
						logfun(__file,__line,err);
				});
			}
			else
				logfun(__file,__line,err);
		});
};
			
var byHeight = function( h, callback ) {
	height( h, function( hash ) {
		block( hash, callback );
	});
};

module.exports = {
  	byHeight: byHeight
  , tx: tx
  , block: block
  , top: top
  , height: height
};
