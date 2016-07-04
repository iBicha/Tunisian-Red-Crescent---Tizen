var socketId = "ME";
var UserMe = {};
var Accidents = {};
var Members = {};
var Messages = {};
var CrtPlaces;
var showedLocationAlert=false;
function LOG(obj) {
	alert(JSON.stringify(obj));
}

function Init() {
 	
	Members[socketId] = {
		id : socketId
	};
 	UpdateNavCommands();

 	$("#loginUsername").val(localStorage.getItem("Username"));
	$("#loginPassword").val(localStorage.getItem("Password"));

	watchLocation(function(location) {
		Members[socketId].Location = location;
		updateUserMarker(socketId);
		sendLocation();
	}, function() {
		if(!showedLocationAlert){
			alert('Could not detect your location. Some features might be unavailable. Please allow location settings and try again.');
		}
	});
	sendLocationInterval(5000);

	document.addEventListener('tizenhwkey', function(e) {
		if (e.keyName == "back") {
			if(window.oauthDialog){
  				window.oauthDialog.close();
			} else if (mySplitView.splitView.paneOpened == true) {
				mySplitView.splitView.closePane();
			} else if(currentPage=="messageViewPage" || currentPage=="messageNewPage"){
				showPage("messagesPage");
			} else {

				if (confirm("Are you sure you want to exit?")) {
					try {
						tizen.application.getCurrentApplication().exit();
					} catch (error) {
						console.error("getCurrentApplication(): "
								+ error.message);
					}
				}

			}
		}
		if (e.keyName == "menu") {
			mySplitView.splitView.openPane();
		}
	});
	if(toggleConnectOnStartUp.toggle.checked){
		Authenticate(true);
	}
}

function sendLocationInterval(interval) {
	setInterval(function() {
		if (Members[socketId].Location && Members[socketId].Location.Longitude && Members[socketId].Location.Latitude) {
			sendLocation();
		}
	}, interval);
}
function onConnect() {
	sendAccessToken();
	GetUserMe(function() {
		if (UserMe.IsMember == true) {
			GetAccidents();
		}
	});
	GetMessages();
	
	showPage("mapPage");
	updateUserMarker(socketId);
	//UpdateNavCommands();
}
function onDisconnect() {
	UpdateNavCommands();
	showPage("mapPage");
}

Init();
/*window.onerror = function (errorMsg, url, lineNumber) {
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    LOG(Members[socketId].Location)
}*/