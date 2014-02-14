var rpc = require('./lib/coinrpc');

rpc.top( function( h ) {
	rpc.byHeight(h,console.log);
});


