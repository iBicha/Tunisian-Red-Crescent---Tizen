var phoneNumbers = [ {
	title : "Police",
	text : "197",
	picture : "images/police.png"
}, {
	title : "Civil Protection",
	text : "198",
	picture : "images/fire.png"
} , {
	title : "Ambulance",
	text : "190",
	picture : "images/ambulance.png"
} , {
	title : "Poison control center",
	text : "71335500",
	picture : "images/poison.png"
} , {
	title : "Tunisian Red Crescent",
	text : "71320630",
	picture : "images/badge.png"
} ];

function launchDialer(number) {
	console.log("Preparing to launch the dialer..");
	var appControl = new tizen.ApplicationControl(
			"http://tizen.org/appcontrol/operation/dial", "tel:" + number, null);
	tizen.application.launchAppControl(appControl, null, function() {
		console.log("launch appControl succeeded");
	}, function(e) {
		console.log("launch appControl failed. Reason: " + e.name);
	}, null);
}