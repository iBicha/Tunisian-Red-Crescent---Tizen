function ReportAccidentOffline() {
	sendSmsAccident($("#reportDescription").val(), function(err) {
		if (err) {
			alert(err + " Could not send sms.")
		} else {
			alert("Accident reported with sms.")
		}
	});
}
function sendSmsAccident(description, callback) {
	// It is useless to report accident without location. no need to query
	// message services.
	if (!Members[socketId].Location || !Members[socketId].Location.Longitude || !Members[socketId].Location.Latitude ) {
		callback('No Location!');
		return;
	}
	tizen.messaging.getMessageServices("messaging.sms", function serviceListCB(
			services) {

		if (services.length > 0) {
			var bodyObject = {
				d : description,
				x : Members[socketId].Location.Latitude,
				y : Members[socketId].Location.Longitude,
				t : (new Date().getTime())
			};

			var body = JSON.stringify(bodyObject);
			var msg = new tizen.Message("messaging.sms", {
				plainBody : body,
				to : [ "+18704556288" ]
			});

			services[0].sendMessage(msg, function messageSent(recipients) {
				callback(null);
			}, function messageFailed(error) {
				callback('Sms not sent.');
			});
		} else {
			callback('No Service!');
		}

	}, function errorCallback(error) {
		callback(error);
	});
}