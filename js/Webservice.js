var Token = '';

function AddUser() {
	var pass1 = $("#signupPassword").val();
	var pass2 = $("#signupPasswordConfirm").val();
	if (pass1 != pass2) {
		alert("Password missmatch!");
		return;
	}
	var birthday = $("#signupBirthDate").val();
	if (birthday) {
		var dateParts = birthday.split('-');
		birthday = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
	}
	/*function validateEmail(email) {
	    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	}*/
	$.post("https://crt-server-ibicha.c9users.io/api/v1/user/add", {
		FirstName : $("#signupFirstName").val(),
		LastName : $("#signupLastName").val(),
		Username : $("#signupUsername").val(),
		BirthDate : birthday,
		Password : pass1
	}, function(data) {
		if (data.success == true) {
			$("#loginUsername").val($("#signupUsername").val());
			$("#loginPassword").val(pass1);
			$("#login-box-link").click();
			LOG("User Created. Login to continue.");
			//Authenticate();
		} else {
			LOG(data.message);
		}
	}, "json").fail(function(xhr, textStatus, errorThrown) {
		try {
			alert((JSON.parse(xhr.responseText)).message);
		} catch (e) {
			alert("Could not complete action. try again later.");
		}
	});
}

function Authenticate(hideErrorMessage) {
	$.post("https://crt-server-ibicha.c9users.io/api/v1/authenticate", {
		Username : $("#loginUsername").val(),
		Password : $("#loginPassword").val()
	}, function(data) {
		if (data.success == true) {
			Token = data.token;
			localStorage.setItem("Username", $("#loginUsername").val());
			localStorage.setItem("Password", $("#loginPassword").val());
			onConnect();
		} else {
			alert(data.message);
		}
	}, "json").fail(function(xhr, textStatus, errorThrown) {
		if(!hideErrorMessage){
			try {
				alert((JSON.parse(xhr.responseText)).message);
			} catch (e) {
				alert("Could not complete action. try again later.");
			}
		}
	});
}

function FacebookAuth() {
	FacebookLoginDialog(function(err, access_token) {
		if (err) {
			alert("Could not complete action. try again later.");
		} else if (access_token) {
			$.get(
					"https://crt-server-ibicha.c9users.io/api/v1/facebookauth?access_token="
							+ access_token, function(data) {
						if (data.success == true) {
							Token = data.token;
							onConnect();
						}
					}, "json").fail(function() {
				alert("Could not complete action. try again later.");
			});
		}
		if (window.oauthDialog) {
			window.oauthDialog.close();
		}
	});
}

function GetCrtPlaces() {

	$.get("https://crt-server-ibicha.c9users.io/api/v1/crtplaces", function(
			data) {
		if (data.success == true) {
			CrtPlaces = {};
			data.crtplaces.forEach(function(crtPlace) {
				CrtPlaces[crtPlace.id] = crtPlace;
				updateCrtPlaceMarker(crtPlace.id);
			});
		}
	}, "json");
}
function EditUser() {
	var pass1 = $("#editPassword").val();
	var pass2 = $("#editPasswordConfirm").val();
	if (pass1 != pass2) {
		alert("Password missmatch!");
		return;
	}
	var birthday = $("#editBirthDate").val();
	if (birthday) {
		var dateParts = birthday.split('-');
		birthday = dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];
	}
	/*function validateEmail(email) {
	    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	}*/
	$
			.post(
					"https://crt-server-ibicha.c9users.io/api/v1/user/edit?access_token="
							+ Token, {
						FirstName : $("#editFirstName").val(),
						LastName : $("#editLastName").val(),
						Username : $("#editUsername").val(),
						BirthDate : birthday,
						Password : pass1
					}, function(data) {
						if (data.success == true) {
							GetUserMe();
							LOG(data.message);
						} else {
							LOG(data.message);
						}
					}, "json")
			.fail(
					function(xhr, textStatus, errorThrown) {
						try {
							alert((JSON.parse(xhr.responseText)).message);
						} catch (e) {
							alert("Could not update user info. please try again later.");
						}
					});

	if ((profilePicChangeFiles && profilePicChangeFiles.length > 0) || profilePicChangeFile) {
		var myFormData = new FormData();
		if(profilePicChangeFiles && profilePicChangeFiles.length > 0){
			myFormData.append('ImageFile', profilePicChangeFiles[0]);
		}else if(profilePicChangeFile){
			myFormData.append('ImageFile', profilePicChangeFile);
		}

		$
				.ajax({
					url : "https://crt-server-ibicha.c9users.io/api/v1/user/submitimage?access_token="
							+ Token,
					type : 'POST',
					data : myFormData,
					success : function(data) {
						if (data.success == true) {
							GetUserMe();
							LOG(data.message);
						} else {
							LOG(data.message);
						}
					},
					error : function(jqXHR, textStatus, errorThrown) {
						try {
							alert((JSON.parse(jqXHR.responseText)).message);
						} catch (e) {
							alert("Could not complete action. try again later.");
						}
					},
					cache : false,
					contentType : false,
					processData : false
				});

	}
}

function GetUserMe(callback) {
	$
			.get(
					"https://crt-server-ibicha.c9users.io/api/v1/user/me?access_token="
							+ Token,
					function(data) {
						if (data.success == true) {
							UserMe = data.user;
							UpdateNavCommands();
							updateUserMarker(socketId);
							$(".profilePic").css('background-image',
									'url("' + data.user.ImageFile + '")');
							$("#editFirstName").val(data.user.FirstName);
							$("#editLastName").val(data.user.LastName);
							$("#editUsername").val(data.user.Username);
							if (data.user.BirthDate) {
								var dateParts = data.user.BirthDate.split('/');
								$("#editBirthDate").val(
										dateParts[2] + '-' + dateParts[1] + '-'
												+ dateParts[0]);
							}
							if (callback) {
								callback();
							}
							UpdateNavCommands();
						}
					}, "json")
			.fail(
					function(xhr, textStatus, errorThrown) {
						try {
							alert((JSON.parse(xhr.responseText)).message);
						} catch (e) {
							alert("Could not retrive user information. please try again later.");
						}
					});
}

function GetAccidents() {
	$
			.get(
					"https://crt-server-ibicha.c9users.io/api/v1/accidents?access_token="
							+ Token, function(data) {
						if (data.success == true) {
							// Clear all accident markers
							Accidents = {};
							data.accidents.forEach(function(accident) {
								Accidents[accident.id] = accident;
								updateAccidentMarker(accident.id);
							});
						}
					}, "json")
			.fail(
					function(xhr, textStatus, errorThrown) {
						try {
							alert((JSON.parse(xhr.responseText)).message);
						} catch (e) {
							alert("Could not retrive accidents. please log out and login again.");
						}
					});

}

function GetMessages() {
	$
			.get(
					"https://crt-server-ibicha.c9users.io/api/v1/messages?access_token="
							+ Token, function(data) {
						if (data.success == true) {
							$("#listView").css("height", "100%");
							Messages = {};
							Messages.ListView.Clear();
							data.messages.forEach(function(message) {
								Messages[message.id] = message;
								Messages.ListView.Add(message);
							});
						}
					}, "json")
			.fail(
					function(xhr, textStatus, errorThrown) {
						try {
							alert((JSON.parse(xhr.responseText)).message);
						} catch (e) {
							alert("Could not retrive your messages. please log out and login again.");
						}
					});
}

function ReportAccident() {

	var myFormData = new FormData();
	myFormData.append('Description', $("#reportDescription").val());
	myFormData.append('Location', JSON.stringify(Members[socketId].Location));

	var files = $("#imageAccidentInput").prop('files');
	if (files && files.length > 0) {
		myFormData.append('ImageFile', files[0]);
	}
	$
			.ajax({
				url : "https://crt-server-ibicha.c9users.io/api/v1/accident/report?access_token="
						+ Token,
				type : 'POST',
				data : myFormData,
				success : function(data) {
					if (data.success == true) {
						LOG(data.message);
					} else {
						LOG(data.message);
					}
				},
				error : function(jqXHR, textStatus, errorThrown) {
					try {
						alert((JSON.parse(jqXHR.responseText)).message);
					} catch (e) {
						alert("Could not complete action. try again later.");
					}
				},
				cache : false,
				contentType : false,
				processData : false
			});

}

function Logout() {
	$.get("https://crt-server-ibicha.c9users.io/api/v1/logout?access_token="
			+ Token, function(data) {
	}, "json");
	Token = '';
	shareLocation(false);
	for ( var acc in Accidents) {
		removeAccidentMarker(acc);
	}
	Accidents = {};
	UserMe = {};
	
	$(".profilePic").css('background-image',
			'url(../images/user.png)');
	
	UpdateNavCommands();
	removeUserMarker(socketId);

	updateUserMarker(socketId);
	showPage("mapPage");
}

function RequestMembership() {
	$
			.get(
					"https://crt-server-ibicha.c9users.io/api/v1/user/requestmembership?access_token="
							+ Token, function(data) {
						if (data.success) {
							LOG(data.message);
						}
					}, "json").fail(function(xhr, textStatus, errorThrown) {
				try {
					alert((JSON.parse(xhr.responseText)).message);
				} catch (e) {
					alert("Could not complete action. try again later.");
				}
			});
}

function RequestAdminship() {
	$
			.get(
					"https://crt-server-ibicha.c9users.io/api/v1/user/requestadminship?access_token="
							+ Token, function(data) {
						if (data.success) {
							LOG(data.message);
						}
					}, "json").fail(function(xhr, textStatus, errorThrown) {
				try {
					alert((JSON.parse(xhr.responseText)).message);
				} catch (e) {
					alert("Could not complete action. try again later.");
				}
			});
}

function SendMessage() {
	var myFormData = new FormData();
	myFormData.append('Title', $("#newMessageTitle").val());
	myFormData.append('Audience', '["Admins"]');
	myFormData.append('Description', $("#newMessageDescription").val());

	$
			.ajax({
				url : "https://crt-server-ibicha.c9users.io/api/v1/message/send?access_token="
						+ Token,
				type : 'POST',
				data : myFormData,
				success : function(data) {
					if (data.success == true) {
						LOG(data.message);
						$("#newMessageTitle").val("");
						$("#newMessageDescription").val("");
					} else {
						LOG(data.message);
					}
				},
				error : function(jqXHR, textStatus, errorThrown) {
					try {
						alert((JSON.parse(jqXHR.responseText)).message);
					} catch (e) {
						alert("Could not complete action. try again later.");
					}
				},
				cache : false,
				contentType : false,
				processData : false
			});

}

function HandleAccident(id) {
	$.get("https://crt-server-ibicha.c9users.io/api/v1/accident/handle/"+id+"?access_token="
			+ Token, function(data) {
	}, "json");
}