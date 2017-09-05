var sfs = null;
var roomsArray = [];
var usersArray = [];
var privateChats;
var needed_room;

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

	needed_room = "The Lobby";
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
	sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost, this);
	sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, onLoginError, this);
	sfs.addEventListener(SFS2X.SFSEvent.LOGIN, onLogin, this);
	//sfs.addEventListener(SFS2X.SFSEvent.LOGOUT, onLogout, this);
	sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, onRoomJoinError, this);
	sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, onRoomJoin, this);
	//sfs.addEventListener(SFS2X.SFSEvent.USER_COUNT_CHANGE, onUserCountChange, this);
	sfs.addEventListener(SFS2X.SFSEvent.USER_ENTER_ROOM, onUserEnterRoom, this);
	sfs.addEventListener(SFS2X.SFSEvent.USER_EXIT_ROOM, onUserExitRoom, this);
	sfs.addEventListener(SFS2X.SFSEvent.PUBLIC_MESSAGE, onPublicMessage, this);
	sfs.addEventListener(SFS2X.SFSEvent.PRIVATE_MESSAGE, onPrivateMessage, this);
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
		var query = "" + window.location;
		console.log("input:" + query);
		query = query.split('user=');
		if (query[1]) {
			query = query[1].match(/[a-zA-Zа-яА-Я0-9]+/).toString();
			var uName = query;
			var isSent = sfs.send(new SFS2X.LoginRequest(uName));
		} else {
			removePreloader();
		}
		
	}
	else
	{
		trace("Connection failed: " + (event.errorMessage ? event.errorMessage + " (" + event.errorCode + ")" : "Is the server running at all?"), true);
	}
}
function onConnectionLost(event)
{
	init();
	sfs.connect();
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
	$("#nick").html(event.user.name);


	var rooms = sfs.roomManager.getRoomList();
	if (sfs.lastJoinedRoom == null || room.id != sfs.lastJoinedRoom.id)
		for (i=0; i<rooms.length; i++) {
			if (rooms[i].name == needed_room)
				sfs.send(new SFS2X.JoinRoomRequest(rooms[i].id));		
		}		

	currentPrivateChat = -1;
	privateChats = [];
	// Populate rooms list
	$('#error_screen').css('opacity','0');
	removePreloader();	
	populateRoomsList();
}

function removePreloader() {
	setTimeout(function(){$('#preload_container').css('display','none'); $('#error_screen').css('display','none');}, 5000);
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
	writeToChatArea("<em>Вы на связи</em>");

	populateUsersList();
}

function onPrivateMessage(event)
{
	var user;

	if (event.sender.isItMe)
	{
		var userId = event.data.get("recipient"); // "data" is an SFSObject
		user = sfs.userManager.getUserById(userId);
	}
	else
		user = event.sender;

	if (privateChats[user.id] == null)
		privateChats[user.id] = {queue:[], toRead:0};

	var message = "@" + (event.sender.isItMe ? "Вы" : event.sender.name) + ": " + event.message;
	
	privateChats[user.id].queue.push(message);

	if (currentPrivateChat == user.id)
		writeToChatArea(message);
	else
	{
		privateChats[user.id].toRead += 1;

		// For code simplicity we rebuild the full userlist instead of just editing the specific item
		// This causes # of PM to read being displayed
		populateUsersList();
	}
	updateScroll();
}
function onPublicMessage(event)
{
	var sender = (event.sender.isItMe ? "Вы" : event.sender.name);
	var nick = event.sender.getVariable("nick");
	var message = "<span class=\"broadcast\">@" + sender + ": " + event.message + "</span>";
	for (i=0; i < usersArray.length; i++) {
		if (privateChats[usersArray[i]] == null)
			privateChats[usersArray[i]] = {queue:[], toRead:0};

		privateChats[usersArray[i]].queue.push(message);
	}
	writeToChatArea(message);
	updateScroll();
}

function onUserEnterRoom(event)
{
	writeToChatArea("<em>" + event.user.name + " на связи</em>");
	populateUsersList();
}

function onUserExitRoom(event)
{
	if (!event.user.isItMe)
		writeToChatArea("<em>Связь с " + event.user.name + " потеряна</em>");

	populateUsersList();
}
//------------------------------------
// BUTTON FUNCTIONS
//------------------------------------
function onToAllClick() {
	var button = $("#toAllButton");
	if (!button.hasClass('active')) {
		$("#toAllButton").addClass('active');
	} else {
		$("#toAllButton").removeClass('active');
	}	
}
function reconnectClick() {
	$('#preload_container').css('display','flex');

	init();
	sfs.connect();
}
function onUserClick(user)
{
		var id = $(user).attr('val');
		$("#chatWith").html("@" + $(user).html());
		// Enable private chat
		if (currentPrivateChat != id)
			enablePrivateChat(id);

		// For example code simplicity we rebuild the full userlist instead of just editing the specific item
		// This causes # of PM to read being updated
		populateUsersList();
	
}
function onSendPublicMessageBtClick()
{
	var message = $("#inputMessage").val();
	if (message != '') {
		if ($('#toAllButton').hasClass('active')) {
			var isSent = sfs.send(new SFS2X.PublicMessageRequest(message));
			if (isSent)
				$("#inputMessage").val("");	
		} else {
				var params = new SFS2X.SFSObject();
				params.putInt("recipient", parseInt(currentPrivateChat));

				var isSent = sfs.send(new SFS2X.PrivateMessageRequest(message, parseInt(currentPrivateChat), params));

				if (isSent)
					$("#inputMessage").val("");
		}
		
	}
}

function onRoomClick(room)
{
	// Join selected room
	if (sfs.lastJoinedRoom == null || room.id != sfs.lastJoinedRoom.id)
		sfs.send(new SFS2X.JoinRoomRequest(roomsArray[room.attr('val')]));
}
//------------------------------------
// OTHER FUNCTIONS
//------------------------------------
function updateScroll() {
        var element = document.getElementById("scrollbar_window");
        element.scrollTop = element.scrollHeight;
};
function enablePrivateChat(userId)
{
	currentPrivateChat = userId;

	doEnable = (userId > -1);

	// Clear current chat
		$("#messageWindow_container").html("");

		// Fill chat with history
		if (privateChats[userId] != null)
		{
			privateChats[userId].toRead = 0;

			for (var i = 0; i < privateChats[userId].queue.length; i++)
				writeToChatArea(privateChats[userId].queue[i]);
		}
}

function writeToChatArea(text)
{
	$("#messageWindow_container").append("<p class='chatAreaElement'>" + text + "</p>");
}
function populateUsersList()
{
	var source = [];
	usersArray = [];

	$("#userlist_container").empty();

	if (sfs.lastJoinedRoom != null)
	{
		var users = sfs.lastJoinedRoom.getUserList();
		for (var u in users)
		{
			var user = users[u];
			
			if (!user.isItMe) {
				item = "<button class=\"chatButton users";
				if (privateChats[user.id] != null && privateChats[user.id].toRead > 0) {
					 item += " unread";
				} else {
					if (currentPrivateChat > -1 && user.id == currentPrivateChat)
						item+= " current"
				}	
				item +=  "\" val=\"" + user.id + "\">" + user.name + "</button>";
				$("#userlist_container").append(item);		
				usersArray[u] = user.id;
			}
		}

		$('.users').click(function() {
			onUserClick(this);
		});
	}
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
		$("#roomlist_container").append("<button class=\"chatButton rooms\" val=\"" + r + "\">" + room.name + "</button>");
		roomsArray[r] = room;
	}


	$(".rooms").click(function() {
		onRoomClick($(this));
	});
}

function trace(txt, showAlert)
{
	console.log(txt);

	if (showAlert)
		alert(txt);
}
