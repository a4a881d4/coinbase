var rpc = require('./lib/coinrpc');
var db = require('./lib/neo4japi');


var clean = function( start,end ) {
	array = new Array();
	for (i = start; i < end; i++) {
	    array.push(i);
	}

	array.forEach( function( h ) {
		db.forNodeByID( h, function( node ) {
			console.log( node );
			db.delNode( node, function(){} )
		});
	});
};

var txprocess = function( blknode ) {
	var blk = JSON.parse(blknode.data.comment);
	for( var txid in blk.tx ) {
		console.log("txid:",blk.tx[txid]);
		rpc.tx( blk.tx[txid], function( txobj ) {
			db.saveNode( txobj, function( txnode ) {
				console.log( txnode );
			});
		});
	}
};	 

var createBlock = function( num ) {
	array = new Array();
	for (i = 0; i < num; i++) {
	    array[i] = i;
	}

	array.forEach( function( h ) {
		rpc.byHeight( h, function( blk ) {
			
			db.saveNode( blk, txprocess );
		});
	});
};

//db.cleanNodes('type','block');
//db.cleanNodes('type','tx');
//createBlock(100);
//clean(400,900);

db.findNodes('type','block',function( node ) {
	var blk = JSON.parse(node.data.comment);
	if( blk.nextblockhash )
		db.createRelation( node,blk.nextblockhash, 'next', {}, console.log );
	if( blk.previousblockhash )
		db.createRelation( node,blk.previousblockhash, 'previous', {}, console.log );
	if( blk.tx )
		blk.tx.forEach( function( txid ) {
			db.createRelation( node, txid, 'tx', {}, console.log );
		});
});
	
	


/*
	rpc.height( h, function( blk ) {
		console.log( blk );
		rpc.block( blk, console.log );
	});
*/

