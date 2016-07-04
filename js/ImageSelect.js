function SelectImage() {
	var appControl = new tizen.ApplicationControl(
			"http://tizen.org/appcontrol/operation/pick", null, "image/*", null);

	var appControlReplyCallback = {
		// callee sent a reply
		onsuccess : function(data) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].key == "http://tizen.org/appcontrol/data/selected") {
					// alert('Selected image is ' + data[i].value[0]);

					var blob = null;
					var xhr = new XMLHttpRequest();
					xhr.open("GET", data[i].value[0]);
					xhr.responseType = "blob";// force the HTTP response,
												// response-type header to be
												// blob
					xhr.onload = function() {
						blob = xhr.response;// xhr.response is now a blob object
						var reader = new FileReader();
						reader.onload = function(e) {
							$('#profilePicEdit').css('background-image',
									'url("' + e.target.result + '")');
						}
						reader.readAsDataURL(blob)
						profilePicChangeFile = blob;
						function GetFileName(fullPath) {
							var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath
									.lastIndexOf('\\')
									: fullPath.lastIndexOf('/'));
							var filename = fullPath.substring(startIndex);
							if (filename.indexOf('\\') === 0
									|| filename.indexOf('/') === 0) {
								filename = filename.substring(1);
							}
							return filename;
						}
						profilePicChangeFile.name = GetFileName(data[i].value[0]);
					}
					xhr.send();

					/*
					 * var file = new File(data[i].value[0]); var reader = new
					 * FileReader(); reader.onload = function(e) {
					 * $('#profilePicEdit').css('background-image', 'url("' +
					 * e.target.result + '")'); } reader.readAsDataURL(file);
					 * profilePicChangeFile=file;
					 */
				}
			}
		},
		// callee returned failure
		onfailure : function() {
			console.log('Failed to select an image.');
		}
	}

	tizen.application.launchAppControl(appControl, null, function() {
	}, function(e) {
		alert("Please install an image browser to use this feature.");
	}, appControlReplyCallback);
}