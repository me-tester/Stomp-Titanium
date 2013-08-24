var win = Ti.UI.currentWindow;

var but = Ti.UI.createButton({
	title : 'close',
	top : 0,
	left : 0
});
but.addEventListener('click', function() {
	win.close();
});

win.add(but);

var but2 = Ti.UI.createButton({
	title : 'send',
	top : 0,
	right : 0
});
but2.addEventListener('click', function() {
	writeIt();
});

win.add(but2);

hostname = 'localhost';
port = 61613;
queue = "/topic/test";
message = "valid";
msg_connect = "CONNECT\nlogin:guest\npasscode:guest\n\n\x00";
msg_send = "SEND\ndestination:"+queue+"\nreceipt:ok\n\n"+message+"\x00";
msg_recv = "SUBSCRIBE\ndestination:"+queue+"\nid:substo_11\nack:client\n\n\x00";
msg_disconnect = "DISCONNECT\n\n\x00";

function writeIt()
{
	Ti.Stream.write(socket, Ti.createBuffer
	({
		value: msg_send
	}), writeCallback);
}

var socket = Ti.Network.Socket.createTCP
({
	host : hostname,
	port : port,
	connected : function(e) 
	{
		Ti.API.info('Socket opened!' + JSON.stringify(e));
		Ti.Stream.pump(e.socket, readCallback, 1024, true);
		Ti.Stream.write(socket, Ti.createBuffer
		({
			value: msg_connect + msg_recv
		}),
		writeCallback);
	},
	error : function(e) 
	{
		Ti.API.info('Error (' + e.errorCode + '): ' + e.error);
	},
});
socket.connect();

function writeCallback(e) 
{
	Ti.API.info('Successfully wrote to socket.' + JSON.stringify(e));
}

function readCallback(e) 
{
	if (e.bytesProcessed == -1) 
	{
		// Error / EOF on socket. Do any cleanup here.
	}
	try 
	{
		if (e.buffer) 
		{
			var received = e.buffer.toString();
			Ti.API.info('Received: ' + received );
			
			parseItCustom(received);
		} 
		else 
		{
			Ti.API.error('Error: read callback called with no buffer!');
		}
	} 
	catch (ex) 
	{
		Ti.API.error(ex);
	}
}

function parseItCustom(data)
{
	if( data != null || data != "" )
	{
		var length = data.length;
		var charData = null;
		var type = '';
		for( var i = 0 ; i < length ; i++ )
		{
			charData = data.charAt(i);
			
			if( charData === "\n" )
			{
				break;
			}
			else
			{
				type = type + charData;
			}
		}
		
		
		if( type.trim() === "MESSAGE" )
		{
			var key = "";
			var value = "";
			var valueFlag = false;
			var obj = { };
			obj.type = type;
			
			for( var i = ( type.length ) ; i < length ; i++ )
			{
				charData = data.charAt(i);
				
				if( charData === "\n" )
				{
					if ( key != "" )
					{
						if( value == "" )
						{
							obj["message"] = key;
						}
						else
						{
							obj[key] = value;
						}
						
						key = "";
						value = "";
					}
					valueFlag = false;
				}
				else if ( charData === ":" )
				{
					valueFlag = true;
				}
				else
				{
					if( valueFlag )
					{
						value = value + charData;
					}
					else
					{
						key = key + charData;
					}
					
				}
			}
			
			var mesg = obj.message;
			mesg = mesg.substr( 0 , obj["content-length"] );
			obj.message = mesg;
			
			Ti.API.info("obj = " + JSON.stringify(obj));
		}
	}
}

String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};