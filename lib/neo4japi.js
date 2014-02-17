var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://localhost:7474');

var saveNode = function( obj, callback ) {
	db.getIndexedNodes( 'node_auto_index', '_id', obj._id, function( err, nodes ) {
		if( err || nodes.length==0 ) {
			var node = db.createNode(obj);
			node.save( function (err, node) {
				if (err) {
					console.error('Error saving new node to database:', err);
				}	else {
					callback( node );
				}
			});
		}	else {
			if( nodes.length > 1 )
				console.error('duplice id in database:', nodes[0]._id);
			else {
				var node = nodes[0];
				for( var k in obj ) {
					node[k]=obj[k];
				}  
				node.save( function (err, node) {
					if (err) {
						console.error('Error update node to database:', err);
					}	else {
						callback( node );
					}
				});
			}
		}
	});
};

var forNodeByID = function( id, callback ) {
	db.getNodeById(id, function(err,data) {
		if( err ) {
			console.error('Error find node in database:', err);
		}	else {
			callback( data );
		}
	});
};

var delNode = function( node, callback ) {
	node.delete( function( err ) {
		if( err ) {
			console.error('Error del node from database:', err);
		}	else {
			callback();
		}
	});
};

var findNodes = function( key, value, callback ) {
	db.getIndexedNodes( 'node_auto_index', key, value, function( err, nodes ) {
		if( err ) {
			console.error('Error find nodes from database:', err);
		}	else {
			nodes.forEach( callback );
		}
	});
};

var cleanNodes = function( key, value ) {
	findNodes( key, value, function( node ) {
		delNode( node, function(){} )
	});
};
module.exports = {
  	saveNode: saveNode,
  	forNodeByID: forNodeByID,
  	delNode:delNode,
  	findNodes:findNodes,
  	cleanNodes:cleanNodes,
  	rawdb:db
};
