var win = Ti.UI.createWindow
({
	//backgroundImage : 'bg.png' ,
	backgroundColor: "#fff",
});

var view = Ti.UI.createView
({
	height : Ti.UI.SIZE,
	width : Ti.UI.FILL,
	layout : "vertical"
});
win.add(view);

var name = Ti.UI.createTextField
({
	width : Ti.UI.FILL,
	height : "40dp" ,
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_LINE,
	borderWidth : 1,
  	color: '#000',
  	hintText : "Enter name to be begin",
  	left : "30dp",
  	right : "30dp",
  	paddingLeft : "10dp",
  	bottom : "10dp"
});
view.add(name);

var but = Ti.UI.createButton({title:'Begin'});
but.addEventListener('click',function()
{
	if( name.value != null && name.value != "" && name.value.trim != "" )
	{
		var winClient = Ti.UI.createWindow
		({
			//backgroundImage : 'bg.png' ,
			backgroundColor: "#fff",
			url : 'client.js' ,
			username : name.value
		});	
		winClient.open({fullscreen : true});
	}
	else
	{
		name.borderColor = "red";
	}
});

but.addEventListener('focus',function()
{
	name.borderColor = "#000";
});
view.add(but);

win.open({fullscreen : true})

String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};