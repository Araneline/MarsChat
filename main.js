var sfs = null;

function init()
{
	trace("Application started");

	// Create configuration object
	var config = {};
	config.host = "127.0.0.1";
	config.port = 8080;
	config.zone = "BasicExamples";
	config.debug = true;
	config.useSSL = false;

	// Create SmartFox client instance
	sfs = new SFS2X.SmartFox(config);

	// Set logging
	sfs.logger.level = SFS2X.LogLevel.DEBUG;
	sfs.logger.enableConsoleOutput = true;
	sfs.logger.enableEventDispatching = false;

	//sfs.logger.addEventListener(SFS2X.LoggerEvent.DEBUG, onDebugLogged, this);
	//sfs.logger.addEventListener(SFS2X.LoggerEvent.INFO, onInfoLogged, this);
	//sfs.logger.addEventListener(SFS2X.LoggerEvent.WARNING, onWarningLogged, this);
	//sfs.logger.addEventListener(SFS2X.LoggerEvent.ERROR, onErrorLogged, this);

	// Add event listeners
	sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, onConnection, this);
	//sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost, this);
	sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, onLoginError, this);
	sfs.addEventListener(SFS2X.SFSEvent.LOGIN, onLogin, this);
	//sfs.addEventListener(SFS2X.SFSEvent.LOGOUT, onLogout, this);
	//sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, onRoomJoinError, this);
	//sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, onRoomJoin, this);
	//sfs.addEventListener(SFS2X.SFSEvent.USER_COUNT_CHANGE, onUserCountChange, this);
	//sfs.addEventListener(SFS2X.SFSEvent.USER_ENTER_ROOM, onUserEnterRoom, this);
	//sfs.addEventListener(SFS2X.SFSEvent.USER_EXIT_ROOM, onUserExitRoom, this);
	//sfs.addEventListener(SFS2X.SFSEvent.PUBLIC_MESSAGE, onPublicMessage, this);
	//sfs.addEventListener(SFS2X.SFSEvent.ROOM_VARIABLES_UPDATE, onRoomVariablesUpdate, this);
	//sfs.addEventListener(SFS2X.SFSEvent.USER_VARIABLES_UPDATE, onUserVariablesUpdate, this);
}

//------------------------------------
// SFS EVENT HANDLERS
//------------------------------------

function onConnection(event)
{
	if (event.success)
	{
		trace("Connected to SmartFoxServer 2X!");

		// Perform login
		var uName = "ParanoidAndroid";
		var isSent = sfs.send(new SFS2X.LoginRequest(uName));
	}
	else
	{
		trace("Connection failed: " + (event.errorMessage ? event.errorMessage + " (" + event.errorCode + ")" : "Is the server running at all?"), true);
	}
}

function onLoginError(event)
{
	trace("Login error: " + event.errorMessage + " (" + event.errorCode + ")", true);
}

function onLogin(event)
{
	trace("Login successful!" +
		  "\n\tZone: " + event.zone +
		  "\n\tUser: " + event.user +
		  "\n\tData: " + event.data);

	// Set user name
	$("#usernameIn").val(event.user.name);

	// Populate rooms list
	populateRoomsList();
}

function onRoomJoinError(event)
{
	trace("Room join error: " + event.errorMessage + " (" + event.errorCode + ")", true);

	// Reset roomlist selection
	if (sfs.lastJoinedRoom != null)
	{
		var index = searchRoomList(sfs.lastJoinedRoom.id);
	}
}

function onRoomJoin(event)
{
	trace("Room joined: " + event.room);

	// Enable interface
	//enableChatArea(true, true);

	writeToChatArea("<em>You entered room '" + event.room.name + "'</em>");

	//showRoomTopic(event.room);

}

//------------------------------------
// BUTTON FUNCTIONS
//------------------------------------
function onRoomSelected(event)
{
	var args = event.args;
    var item = $("#roomList").jqxListBox("getItem", args.index);
	var room = item.originalItem.roomObj;

	// Join selected room
	if (sfs.lastJoinedRoom == null || room.id != sfs.lastJoinedRoom.id)
		sfs.send(new SFS2X.JoinRoomRequest(room));
}
//------------------------------------
// OTHER FUNCTIONS
//------------------------------------
function writeToChatArea(text)
{
	$("#messageWindow_container").append("<p class='chatAreaElement'>" + text + "</p>");
}

function searchRoomList(roomId)
{
	var items = $('.rooms');

	for (var i = 0; i < items.length; i++)
	{
		var room = items[i].roomObj;

		if (room.id == roomId)
			return i;
	}

	return -1;
}

function populateRoomsList()
{
	var rooms = sfs.roomManager.getRoomList();
	var index = 0;
	var selectedIndex = -1;
	var source = [];

	for (var r in rooms)
	{
		var room = rooms[r];
		//item.html = "<div><p class='itemTitle'><strong>" + room.name + "</strong>" + (room.isPasswordProtected ? " <img src='images/lock.png'/>" : "") + "</p>" +
		//			"<p class='itemSub'>Users: " + room.userCount + "/" + room.maxUsers + "</p></div>";
		$("#roomlist_container").append("<button class=\"chatButton rooms\">" + room.name + "</button>");
		
	}
}


function trace(txt, showAlert)
{
	console.log(txt);

	if (showAlert)
		alert(txt);
}