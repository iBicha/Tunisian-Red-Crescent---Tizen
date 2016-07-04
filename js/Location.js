function watchLocation(onPositionChange, onPositionError) {
	if (!navigator.geolocation) {
		onPositionError();
		return;
	}
	getLocation(function(pos) {
		
		onPositionChange(pos);
		
	}, onPositionError);
	setTimeout(watchLocation, 5000);
}

function getLocation(onPosition, onPositionError) {
	if (!navigator.geolocation) {
		onPositionError();
		return;
	}
	function posChange(position) {
		var pos = {
			Longitude : position.coords.longitude,
			Latitude : position.coords.latitude,
			Accuracy : position.coords.accuracy,
			Timestamp : position.timestamp
		};
		onPosition(pos);
		UpdateNavCommands();	

		if(!pos.Longitude || !pos.Latitude){
			$(".location").hide();
		}
	}

	var geoOptions = {
		enableHighAccuracy : true
	};
	navigator.geolocation.getCurrentPosition(posChange, onPositionError,
			geoOptions);
}