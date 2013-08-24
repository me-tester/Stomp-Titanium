// var win = Ti.UI.createWindow();
// 
// var web = Ti.UI.createWebView
// ({
	// url : "echo.html"
// });
// 
// win.add(web);
// 
// win.open();


var win = Ti.UI.createWindow
({
	backgroundColor : 'red' ,
});

var but = Ti.UI.createButton({title:'click'});
but.addEventListener('click',function()
{
	var win = Ti.UI.createWindow
	({
		backgroundColor : 'blue' ,
		url : 'client.js'		
	});	
	win.open();
});

win.add(but);

win.open()
