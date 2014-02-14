var config = require('./confige').config
	, bitcoin = require('bitcoin')
	, client = new bitcoin.Client({
  									host: 'localhost'
  								, port: config.rpcport
  								, user: config.rpcuser
  								, pass: config.rpcpass
  								})
  ;

var top = function( callback ) {
	client.getInfo(function( err, info ) {
		if( err==null ) {
			callback( info.blocks-1 );
		}
		else
			console.log(JSON.stringify(err));
	});
};

var height = function( h, callback ) {
	client.getBlockHash(h,function( err, hash ) {
		if( err==null ) {
			callback( hash );
		}
		else
			console.log(err);
	});
};
	
var block = function( h, callback ) {
	client.getBlock(h,function( err, block ) {
		if( err==null ) {
			var dump = {};
			var keys = ['previousblockhash','nextblockhash','tx','time','height'];
			for( var key in keys ) {
				if( block[keys[key]] )
					dump[keys[key]]=block[keys[key]];
			}
			dump['type']='block'
			dump['_id']=block['hash']
			callback( dump );
		}
		else
			console.log(err);
	});
};

var tx = function( h, callback ) {
		client.getrawtransaction( h, function( err, txraw ) {
			if( err==null ) {
				client.decoderawtransaction( txraw, function( err, tx ) {
					if( err==null ) {
						dump = {};
						dump['type']='tx';
						dump['_id']=tx['txid'];
						dump['vin']=[];
						for( var x in tx['vin'] ) {
							var y={};
							var keys = ['coinbase','txid','vout'];
							for( var key in keys ) {
								if( tx['vin'][x][keys[key]] ) 
									y[keys[key]]=tx['vin'][x][keys[key]];
							}
							dump['vin'].append(y);
						}
						dump['vout']=tx['vout']
						for( var x in dump['vout'] ) {
							if( dump['vout'][x]['scriptPubKey'] ) {
								var keys=['asm','hex','reqSigs'];
								for( var key in keys )
									if( dump['vout'][x]['scriptPubKey'][keys[key]] )
										delete dump['vout'][x]['scriptPubKey'][keys[key]];
							}
						}
						callback(dump);
					}
					else
						console.log(err);
				});
			}
			else
				console.log(err);
		});
};
			
var byHeight = function( h, callback ) {
	height( h, function( hash ) {
		block( hash, console.log );
	});
};

module.exports = {
  	byHeight: byHeight
  , tx: tx
  , block: block
  , top: top
  , height: height
};