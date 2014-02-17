var rpc = require('./lib/coinrpc');
var db = require('./lib/neo4japi');


var clean = function( num ) {
	array = new Array();
	for (i = 0; i < num; i++) {
	    array[i] = i;
	}

	array.forEach( function( h ) {
		db.forNodeByID( h, function( node ) {
			console.log( node );
			db.delNode( node, function(){} )
		});
	});
};



var createBlock = function( num ) {
	array = new Array();
	for (i = 0; i < num; i++) {
	    array[i] = i;
	}

	array.forEach( function( h ) {
		rpc.byHeight( h, function( blk ) {
			var txprocess = function( blknode ) {
				console.log( blknode );
				for( var txid in blknode.tx ) {
					rpc.tx( blknode.tx[txid], function( txobj ) {
						db.saveNode( txobj, function( txnode ) {
							console.log( txnode );
						});
					});
				}
			};	 
			db.saveNode( blk, txprocess );
		});
	});
};

//db.cleanNodes('type','block');
//createBlock(2);
clean(100);


/*
	rpc.height( h, function( blk ) {
		console.log( blk );
		rpc.block( blk, console.log );
	});
*/

