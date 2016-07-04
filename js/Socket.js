var socket;
var IsConnectedToInternet = false;
socket = io.connect("https://crt-server-ibicha.c9users.io/", {
	'force new connection' : true,
	'timeout' : 5000
});


socket.on('connect', function() {
	socket.emit("tizen");

	IsConnectedToInternet = true;
	UpdateNavCommands();
	mapInitialize();
	
	// replace guid with socket id for consistency
	var newGuid = socket.io.engine.id;
	Members[socketId].id = newGuid;
	Members[newGuid] = Members[socketId];
	delete Members[socketId];
	socketId = newGuid;
	if(Members[socketId].Location && Members[socketId].Location.Longitude && Members[socketId].Location.Latitude){
		updateUserMarker(socketId);	
	}
	
	function addUpdateUser(user) {
		if (!Members[user.id]) {
			Members[user.id] = {};
		}
		Members[user.id].id = user.id;
		Members[user.id].Location = user.Location;
		if (user.BloodType) {
			Members[user.id].BloodType = user.BloodType;
		}
		updateUserMarker(user.id);
	}
	
	if(Token){
		socket.emit("access_token", Token);
	}	
	socket.on('Members', function(data) {
		data.forEach(function(item) {
			addUpdateUser(item);
		});
	});

	socket.on('SharingOFF', function(data) {
		if(data.id!=socketId){
			removeUserMarker(data.id);
			delete Members[data.id];
		}
	});
	socket.on('SharingON', function(data) {
		if(data.id!=socketId){
			addUpdateUser(data);		
		}
	});
	socket.on('Accident', function(data) {
		Accidents[data.id] = data;
		updateAccidentMarker(data.id);

		try
		{
			var notificationElements = {
					content :  data.Description,
					iconPath : "../images/accident.png",
					vibration: true
		
			};
			var	statNotif = new tizen.StatusNotification("SIMPLE", 
					"An accident just happened!", notificationElements);
 			
			tizen.notification.post(statNotif);

		} 
		catch (err) 
		{
			alert (err.name + ": " + err.message);
		}
	});
	socket.on('AccidentHandled', function(data) {
		if(Accidents[data.id]){
			Accidents[data.id].IsHandled=true;
			updateAccidentMarker(data.id);
		}

	});

	socket.on('Location', function(data) {
		if(data.id!=socketId){
			addUpdateUser(data);		
		}
	});
	socket.on('access_token', function(data) {
		var toggle = document.querySelector(".toggleLocation").winControl;
		shareLocation(toggle.checked);
	});

	socket.on('disconnect', function() {
		IsConnectedToInternet = false;
		UpdateNavCommands();
		for (guid in Members){
			if(guid!=socketId){
				removeUserMarker(guid);
			}
		}
	});
	
	
});

function sendLocation() {
	if (UserMe.IsMember == true && UserMe.IsSharing==true) {
		socket.emit("Location", {
			id : socketId,
			Location : Members[socketId].Location
		});
	}
}
function sendAccessToken() {
	socket.emit("access_token", Token);
}

function shareLocation(shareOn) {
	UserMe.IsSharing = shareOn;
	if (shareOn) {
		socket.emit("SharingON", {
			Location : Members[socketId].Location
		// Blood Type, Level
		});
	} else {
		socket.emit("SharingOFF", "");
	}
}