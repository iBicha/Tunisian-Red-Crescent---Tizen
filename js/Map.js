var map = null;

function mapInitialize() {
	if (!map) {
		map = new google.maps.Map(document.getElementById("map"), {
			zoom : 6,
			center : {
				lat : 33.7270846,
				lng : 9.5760645
			}
		});
	}
	google.maps.event.addListenerOnce(map, 'idle', function() {
		getLocation(function(pos) {

			if(pos && pos.Latitude && pos.Longitude){
				mapSetCenter(pos);
				Members[socketId].Location = pos;
				updateUserMarker(socketId);
			}
		}, function() {
		});
		if (Members[socketId].Location && Members[socketId].Location.Longitude && Members[socketId].Location.Latitude) {
			updateUserMarker(socketId);
		}
		if (!CrtPlaces) {
			GetCrtPlaces();
		}
	});
}

function mapSetCenter(pos) {
	if (map && pos && pos.Latitude && pos.Longitude) {
		map.panTo(new google.maps.LatLng(pos.Latitude, pos.Longitude));
	}
}

function updateUserMarker(guid) {
	if (!map)
		return;
	var user = Members[guid];
	if (!user)
		return;
	if (!user.marker) {
		user.marker = new google.maps.Marker({
			map : map,
			animation : google.maps.Animation.DROP,
 		});
		if (guid != socketId || UserMe.IsMember == true) {
			var image = {
				url : 'images/badge.png',
				size : new google.maps.Size(256, 256),
				origin : new google.maps.Point(0, 0),
				anchor : new google.maps.Point(16, 16),
				scaledSize : new google.maps.Size(32, 32)
			};
			user.marker.setIcon(image);
		}else {
			user.marker.setIcon(null);
		}
	}
	if (user.marker) {
		if (guid != socketId || UserMe.IsMember == true) {
			var image = {
				url : 'images/badge.png',
				size : new google.maps.Size(32, 32),
				origin : new google.maps.Point(0, 0),
				anchor : new google.maps.Point(16, 16),
				scaledSize : new google.maps.Size(32, 32)
			};
			user.marker.setIcon(image);
		} else {
			user.marker.setIcon(null);
		}
	}
	if (user.Location) {
		user.marker.setPosition(new google.maps.LatLng(user.Location.Latitude,
				user.Location.Longitude));
	}
}

function removeUserMarker(guid) {
	if (!map)
		return;
	var user = Members[guid];
	if (user && user.marker) {
		user.marker.setMap(null);
		user.marker = null;
	}
}

function updateAccidentMarker(guid) {
	if (!map)
		return;
	var accident = Accidents[guid];
	if (!accident)
		return;
	if (!accident.marker) {
		var image = {
			url : (accident.IsHandled == true) ? 'images/accidentOk.png'
					: 'images/accident.png',
			size : new google.maps.Size(256, 256),
			origin : new google.maps.Point(0, 0),
			anchor : new google.maps.Point(16, 16),
			scaledSize : new google.maps.Size(32, 32)
		};
		var center = new google.maps.LatLng(accident.Location.Latitude,
				accident.Location.Longitude);
		accident.marker = new google.maps.Marker({
			map : map,
			position : center,
			animation : google.maps.Animation.DROP,
			icon : image
		});
		if (!accident.IsHandled) {
			accident.circle = new google.maps.Circle({
				map : map,
				center : center,
				radius : 100,
				strokeColor : "#E16D65",
				strokeOpacity : 1,
				strokeWeight : 1,
				fillColor : "#E16D65",
				fillOpacity : 0.1
			});
			accident.circle.animationStep = 0;
			accident.circle.animationLoop = setInterval(
					function() {
						var radius = accident.circle.getRadius();
						accident.circle.animationStep = (accident.circle.animationStep + 2) % 100;
						accident.circle.setRadius(lerp(0, 2000,
								accident.circle.animationStep / 100.0));
						// argbToHex(255,0,0,
						// lerp(255,0,accident.circle.animationStep/100.0))
					}, 50);
		}
		var accidentTime = new Date(accident.Location.Timestamp);
		accident.infowindow = new google.maps.InfoWindow(
				{
					content : '<div>'
							+ '<div style="color: black;">'
							+ accident.Description
							+ '</div>'
							+ '<div style="color: black;">'
							+ accidentTime
							+ '</div>'
							+ '<img style="max-width:200px; max-height:200px;" alt="" src="'
							+ accident.ImageFile + '">'
							+ (accident.IsHandled ? '' : ('<button id="acc'+accident.id+'" onclick="HandleAccident(\'' +accident.id+ '\')">Handle</button>')) + '</div>'
				});
		google.maps.event.addListener(accident.marker, 'click', function() {
			// mapSetCenter(accident.Location);
			// map.setZoom(13);
			accident.infowindow.open(map, accident.marker);

		});
		google.maps.event.addListener(map, 'click', function() {
			accident.infowindow.close();
		});
		google.maps.event.addListener(accident.circle, 'click', function() {
			accident.infowindow.close();
		});
	}
	if (accident.IsHandled) {
		if (accident.circle) {
			clearInterval(accident.circle.animationLoop);
			accident.circle.setMap(null);
		}
		if (accident.marker) {
			var image = {
				url : 'images/accidentOk.png',
				size : new google.maps.Size(256, 256),
				origin : new google.maps.Point(0, 0),
				anchor : new google.maps.Point(16, 16),
				scaledSize : new google.maps.Size(32, 32)
			};
			accident.marker.setIcon(image);
		}
		$("#acc"+accident.id).hide();

	}
}

function updateCrtPlaceMarker(guid) {
	if (!map) {
		return;
	}
	var crtPlace = CrtPlaces[guid];
	if (!crtPlace) {
		return;
	}
	if (!crtPlace.marker) {
 		var image = {
			url : 'images/crtPlace.png',
			size : new google.maps.Size(256, 256),
			origin : new google.maps.Point(0, 0),
			anchor : new google.maps.Point(16, 16),
			scaledSize : new google.maps.Size(32, 32)
		};
		var center = new google.maps.LatLng(crtPlace.Location.Latitude,
				crtPlace.Location.Longitude);
		crtPlace.marker = new google.maps.Marker({
			map : map,
			position : center,
			icon : image
		});

		crtPlace.infowindow = new google.maps.InfoWindow({
			content : '<div>' + '<div style="color: black;">' + crtPlace.Title
					+ '</div>' + '<div style="color: black;">'
					+ 'Phone Number : ' + ('N/A' || crtPlace.PhoneNumber) + '</div>' + '</div>'
		});
		google.maps.event.addListener(crtPlace.marker, 'click', function() {
			// mapSetCenter(accident.Location);
			// map.setZoom(13);
			crtPlace.infowindow.open(map, crtPlace.marker);

		});
		google.maps.event.addListener(map, 'click', function() {
			crtPlace.infowindow.close();
		});
	}
}
function removeAccidentMarker(guid) {
	if (!map)
		return;
	var accident = Accidents[guid];
	if (accident.marker) {
		accident.marker.setMap(null);
		accident.marker = null;
		clearInterval(accident.circle.animationLoop);
		accident.circle.setMap(null);
		accident.circle = null;
	}
}

function lerp(A, B, t) {
	return x = A + t * (B - A);
}
function argbToHex(a, r, g, b) {
	return '#' + a.toString(16) + r.toString(16) + g.toString(16)
			+ b.toString(16);
}