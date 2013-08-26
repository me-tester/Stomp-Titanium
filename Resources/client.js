var win = Ti.UI.currentWindow;

var but = Ti.UI.createButton({
	title : 'close',
	top : 0,
	left : 0,
	zIndex : 1
});
but.addEventListener('click', function() {
	win.close();
});
//win.add(but);


var scrollview = Ti.UI.createScrollView
({
	height : Ti.UI.FILL,
	width : Ti.UI.FILL
});
win.add(scrollview);

var tableView = Ti.UI.createTableView
({
	//top : "70dp",
	bottom : "65dp",
	left : "10dp",
	right : "10dp"
});
scrollview.add(tableView);

var view = Ti.UI.createView
({
	height : "60dp",
	width : Ti.UI.FILL,
	bottom : "0dp"
});
scrollview.add(view);

var mesg = Ti.UI.createTextField
({
	width : Ti.UI.FILL,
	height : "40dp" ,
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_LINE,
	borderWidth : 1,
  	color: '#000',
  	hintText : "Enter message",
  	left : "10dp",
  	right : "70dp",
  	paddingLeft : "10dp"
});
view.add(mesg);

var but2 = Ti.UI.createButton
({
	title : 'Send',
	right : "10dp",
	width : "50dp",
	height : "40dp"	
});
but2.addEventListener('click', function() 
{
	if( mesg.value != null && mesg.value != "" && mesg.value.trim != "" )
	{
		writeIt( mesg.value );
		mesg.value = "";
	}
});
view.add(but2);

var username = win.username;
var hostname = '10.0.11.35';
var port = 61613;
var queue = "/topic/test";
var message = "";
var msg_connect = "CONNECT\nlogin:guest\npasscode:guest\n\n\x00";

var msg_recv = "SUBSCRIBE\ndestination:"+queue+"\nid:substo_11\nack:client\n\n\x00";
var msg_disconnect = "DISCONNECT\n\n\x00";

function writeIt( mesg )
{
	message = username + " - " + mesg ;
	msg_send = "SEND\ndestination:"+queue+"\n\n"+message+"\x00";
	
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

var readData = {};
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
			
			readData = parseItCustom(received);
			displayUi(readData);
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
		data = data.replace("\u0000", "");
		
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
		
		var obj = { };
		obj.type = type;
		
		if( type.trim() === "MESSAGE" )
		{
			var key = "";
			var value = "";
			var valueFlag = false;
			
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
			
			var mesg = data.substr( length - obj["content-length"] , length );
			obj.message = mesg;
		}
		
		Ti.API.info("obj = " + JSON.stringify(obj));
		return obj;
	}
}

function displayUi(readData)
{
	if( readData.type === "MESSAGE" )
	{
		var row = Titanium.UI.createTableViewRow
		({
			title : readData.message,
			font : { fontSize: "16dp", fontWeight : "medium" }
		});
		
		tableView.appendRow(row , { animated :true , animationStyle : Titanium.UI.iPhone.RowAnimationStyle.FADE });
	}
}

String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};