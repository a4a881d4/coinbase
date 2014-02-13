
$(document)
  .ready(function() {

    $('.masthead .information')
      .transition('scale in')
    ;
		
  })
;


function toDateTime(secs)
{
	var t = new Date(1970,0,1);
	t.setSeconds(secs);
	return t;
}

function getHash(h, callback)
{
	var url = '/hash/'+h;
	$.getJSON( url, function(data) {
		if( data.err==null )
			callback(data.body);
		})
	;
}
function renderVin(vins)
{
	var html = '<table class="ui small table segment celled">';
	html+='<tr><th>source</th><th>vout</th></tr>';	
	for( var v in vins ) {
		var vin=vins[v];
		html+='<tr>';
		if( 'coinbase' in vin ) {
			html+='<td>coinbase</td>';
			html+='<td>'+vin['coinbase']+'</td>';
		}
		if( 'txid' in vin ) {
			html+='<td>'+vin['txid']+'</td>';
			html+='<td>'+vin['vout']+'</td>';
		}
		html+='</tr>';
	}
	html+='</table>';
	$('.txdetail#vin').html(html);
}

function renderVinAddr(vins)
{
	var html = '<table class="ui small table segment celled">';
	html+='<tr><th>source</th><th>value</th></tr>';	
	html+='<tr id="vin_end_th"><th colspan="2">0</th></tr>';
	html+='</table>';
	$('.txdetail#vin').html(html);
	var sum=0;	
	for( var v in vins ) {
		var vin=vins[v];
		if( 'coinbase' in vin ) {
			var tr='<tr>';
			tr+='<td>coinbase</td>';
			tr+='<td>'+vin['coinbase']+'</td>';
			tr+='</tr>';
			$('tr#vin_end_th').before(tr);
		}
		if( 'txid' in vin ) {
			var url='/txout/'+vin['txid']+'?vout='+vin['vout'];
			$.getJSON(url,function(data) {
				if( data.err==null ) {
					var tr='<tr>';
					tr+='<td>';
					for( var aidx in data.body.address ) {
						tr+='<div id="coinaddress">'+data.body.address[aidx]+'<div id="balance"></div></div>';
					}
					tr+='</td>';
					tr+='<td>'+data.body['value']+'</td>';
					tr+='</tr>';
					$('tr#vin_end_th').before(tr);
					sum+=data.body['value'];
					$('tr#vin_end_th th').text(sum);
					$('#coinaddress').on('click',onAddressClick);
				}
			});
		}
	}
}

function renderVout(vouts)
{
	var html = '<table class="ui small table segment celled">';
	html+='<tr><th>n</th><th>address</th><th>value</th><th>percent</th></tr>';
	var sum=0.;
	for( var v in vouts )
		sum+=vouts[v]['value'];	
	for( var v in vouts ) {
		var vout=vouts[v];
		if( vout.speed )
			html+='<tr class="disabled">';
		else
			html+='<tr>';
		if( 'scriptPubKey' in vout ) {
			html+='<td>'+vout['n']+'</td>';
			html+='<td>';
			for( var address in vout['scriptPubKey']['addresses'] ) 
				html+='<div id="coinaddress">'+vout['scriptPubKey']['addresses'][address]+'<div id="balance"></div></div>';
			html+='</td>';
			html+='<td>'+vout['value']+'</td>';
			html+='<td>'+(vout['value']/sum*100).toFixed(2)+'%</td>';
		}
		html+='</tr>';
	}
	html+='<tr><th colspan="4">'+sum+'</th></tr>';
	html+='</table>';
	$('.txdetail#vout').html(html);
	$('div#coinaddress').on('click',onAddressClick);
}

function load_heights(my)
{
  var url = '/heights/bek?start='+my;
  $.getJSON(url,function(data) {
  	if( data.err!=null ) {
  		$('.message#warning').html(data.err);
  		$('.message#warning').removeClass('hidden');
  	}
  	else {
    	var res=data.body.rows;
    	var tableBody='';
    	for( var idx in res ) {
    		var item = res[idx];
    	
    		var h = item.value;
    		tableBody+='<tr>';
    		tableBody+='<td id="height" data-closable=true data-variation="inverted large" data-position="top right"';
    		tableBody+='data-title="'+h['_id']+'"';
    		if( h['previousblockhash']!=undefined ) {
    			tableBody+='data-content="previous:'+h['previousblockhash'];
    			if( h['nextblockhash']!=undefined )
    				tableBody+=' next:'+h['nextblockhash']+'"';
    			else
    				tableBody+='"';
    		}
    		else if( h['nextblockhash']!=undefined )
    			tableBody+='data-content="next:'+h['nextblockhash']+'"';
    		tableBody+='>';
    		tableBody+=h['height']+'</td>';
    		tableBody+='<td id="tx">';
    		for( var txidx in h.tx ) {
    			tableBody+='<div id="txid">'+h.tx[txidx]+'</div>';
    		}
    		tableBody+='</td>';
    		tableBody+='<td>'+toDateTime(h.time).toUTCString()+'</td>';
    		tableBody+='</tr>';
    	}
    	$('tbody#height').html(tableBody);
    	$('tbody td#height')
  			.popup({
    			on: 'click'
  			})
  		;
  		$('td#tx #txid').on( 'click', function() {
				var txid = $(this).text();
				getHash(txid, function(tx) {
					$('.txdetail#vin').html("");
					$('.txdetail#vout').html("");
						
					if( tx['type']=='tx' ) {
						renderVinAddr(tx.vin);
						renderVout(tx.vout);
					}

					$('.ui.modal')
						.modal('show dimmer')
						.modal('show')
						;
					})
				;
				})
			;
  	}
  });
}


function onAddressClick()
{
	if( $(this).children("#balance").text()=="" ) {
		( function(obj) {
				var url = '/account/bek?address='+obj.text();
				$.getJSON( url, function( data ) { 
				 if( data.err==null ) 
					 if( data.body.rows[0].value ) 
						 obj.children("#balance").text(data.body.rows[0].value);
				 });
			})($(this));
	}		
	$(this).children("#balance").toggle();
}

$(function() {
	load_heights(0);
	$('#search>.button').on('click', function() {
		var myid = $(this).attr("id")
		var vh = $('#search>input').val();
		if( vh==undefined )
			vh='0'
		var nh = parseInt(vh)
		if(myid!='search') {
			if(myid=='left') 
				nh=nh-10;
			if(myid=='right')
				nh=nh+10;
			$('#search>input').val(nh);
		}	
		if( nh<0 )
			nh=0;
		load_heights(nh);
	});
});



