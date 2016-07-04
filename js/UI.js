"use strict";

var app = WinJS.Application;

// SPLIT VIEW
var currentPage = '';
var pages = [ "mapPage", "loginPage", "profilePage", "messagesPage",
		"messageNewPage", "messageViewPage", "reportAccidentPage",
		"settingsPage", "sosPage", "aboutPage" ];

function showPage(page, callbackVisible, callbackHidden) {
	pages.forEach(function(item) {
		if (item != "mapPage") {
			if (item == page) {
				$("#" + item).show(200, function() {
					if (callbackVisible) {
						callbackVisible();
					}
				});
			} else {
				$("#" + item).hide(200, function() {
					if (callbackHidden) {
						callbackHidden();
					}
				});
			}
		} else {
			if (item == page) {
				$("#" + item).show(200, function() {
					if (map) {
						google.maps.event.trigger(map, 'resize');
						if (callbackVisible) {
							callbackVisible();
						}
					}
				});
			} else {
				$("#" + item).hide(200, function() {
					if (map) {
						google.maps.event.trigger(map, 'resize');
						if (callbackHidden) {
							callbackHidden();
						}
					}
				});
			}
		}
	});

	currentPage = page;
}

WinJS.Namespace.define("Messages.ListView", {
	data : new WinJS.Binding.List()
});

Messages.ListView.Add = function(item) {
	if(item.Description){
		item.DescriptionShort = item.Description.substring(0, 20) + '...';
	}else{
		item.DescriptionShort = "";
	}
	Messages.ListView.data.dataSource.insertAtEnd(null, item);
}

Messages.ListView.Clear = function() {
	Messages.ListView.data.dataSource.getCount().done(function(count) {
		Messages.ListView.data.dataSource.list.splice(0, count);
	});
}

WinJS.Namespace.define("SOS.ListView", {
	data : new WinJS.Binding.List(phoneNumbers)
});

var OnNewMessageClicked = WinJS.UI.eventHandler(function(ev) {
	$("#newMessageTitle").val("");
	$("#newMessageDescription").val("");
	showPage("messageNewPage");
});
var mySplitView = window.mySplitView = {
	splitView : null,
	closed : WinJS.UI.eventHandler(function(ev) {
		$(".mainPic").hide(150);
		$(".toggleLocation").hide(150);
	}),
	opened : WinJS.UI.eventHandler(function(ev) {
		$(".mainPic").show(200);
		if (UserMe.IsMember == true && Members[socketId].Location && Members[socketId].Location.Longitude && Members[socketId].Location.Latitude) {
			$(".toggleLocation").show(200);
		}
	}),
	loginClicked : WinJS.UI.eventHandler(function(ev) {
		showPage("loginPage");
		mySplitView.splitView.closePane();
	}),
	reportAccidentClicked : WinJS.UI.eventHandler(function(ev) {
		showPage("reportAccidentPage");
		mySplitView.splitView.closePane();
	}),
	profileClicked : WinJS.UI.eventHandler(function(ev) {
		showPage("profilePage");
		mySplitView.splitView.closePane();
	}),
	whereClicked : WinJS.UI.eventHandler(function(ev) {
		showPage("mapPage", function() {
			if(map && Members[socketId].Location && Members[socketId].Location.Longitude && Members[socketId].Location.Latitude){
				mapSetCenter(Members[socketId].Location);
				map.setZoom(14);
			}
		});
		mySplitView.splitView.closePane();
	}),
	messagesClicked : WinJS.UI.eventHandler(function(ev) {
		showPage("messagesPage", function() {
			$(".listView").height($(window).height()-$(".pageTitle").height());
		});
		mySplitView.splitView.closePane();
	}),
	settingsClicked : WinJS.UI.eventHandler(function(ev) {
		showPage("settingsPage");
		mySplitView.splitView.closePane();
	}),
	aboutClicked : WinJS.UI.eventHandler(function(ev) {
		showPage("aboutPage");
		mySplitView.splitView.closePane();
	}),
	sosClicked : WinJS.UI.eventHandler(function(ev) {
		showPage("sosPage", function() {
			$(".listView").height($(window).height()-$(".pageTitle").height());
		});
		mySplitView.splitView.closePane();
	}),
	homeClicked : WinJS.UI.eventHandler(function(ev) {
		showPage("mapPage");
		mySplitView.splitView.closePane();
	})
};
var toggleLocation = window.toggleLocation = {
	onchange : WinJS.UI.eventHandler(function(ev) {
		var toggle = document.querySelector(".toggleLocation").winControl;
		if(typeof shareLocation !== "undefined"){
			shareLocation(toggle.checked);			
		}
	})
}


var toggleShareOnStartUp = window.toggleShareOnStartUp = {
	onchange : WinJS.UI.eventHandler(function(ev) {
		var toggle = document.querySelector(".toggleShareOnStartUp").winControl;
		localStorage.setItem("toggleShareOnStartUp",toggle.checked);
	})
}


var toggleConnectOnStartUp = window.toggleConnectOnStartUp = {
	onchange : WinJS.UI.eventHandler(function(ev) {
		var toggle = document.querySelector(".toggleConnectOnStartUp").winControl;
		localStorage.setItem("toggleConnectOnStartUp",toggle.checked);
	})
}


var internetIndicatorTimeout;
function UpdateNavCommands() {
	if (IsConnectedToInternet) {
		$(".online").slideDown(100);
		$(".offline").slideUp(100);
	} else {
		$(".online").slideUp(100);
		$(".offline").slideDown(100);
	}
	if (UserMe.id) {
		$(".loggedin").slideDown(100);
		$(".loggedout").slideUp(100);
	} else {
		$(".loggedin").slideUp(100);
		$(".loggedout").slideDown(100);
	}
	if (IsConnectedToInternet && UserMe.id) {
		$(".online.loggedin").slideDown(100);
	} else {
		$(".online.loggedin").slideUp(100);
	}
	if (IsConnectedToInternet && !UserMe.id) {
		$(".online.loggedout").slideDown(100);
	} else {
		$(".online.loggedout").slideUp(100);
	}
	if (Members[socketId].Location && Members[socketId].Location.Longitude && Members[socketId].Location.Latitude) {
		$(".location").show();
	} else {
		$(".location").hide();
	}
	if (Members[socketId].Location && Members[socketId].Location.Longitude && Members[socketId].Location.Latitude && IsConnectedToInternet) {
		$(".location.online").show();
	} else {
		$(".location.online").hide();
	}
	if($('#reportBtn').is(':visible')) {
		$("#SMSreportBtn").show();
	} else {
		$("#SMSreportBtn").show();
	}
	
	var internetIndicator = $("#internetIndicator");
	if (internetIndicator.hasClass("waitingForInternet")
			&& IsConnectedToInternet) {
		internetIndicator.removeClass("waitingForInternet");
		internetIndicator.addClass("connectedToInternet");
		internetIndicator.html("Connected.");
		internetIndicator.slideDown(500);
		clearTimeout(internetIndicatorTimeout);
		internetIndicatorTimeout = setTimeout(function() {
			internetIndicator.slideUp(500);
		}, 3000);
	} else if (internetIndicator.hasClass("connectedToInternet")
			&& !IsConnectedToInternet) {
		internetIndicator.removeClass("connectedToInternet");
		internetIndicator.addClass("waitingForInternet");
		internetIndicator.html("Waiting for internet...");
		clearTimeout(internetIndicatorTimeout);
		internetIndicator.slideDown(500);
	}
}

WinJS.UI
		.processAll()
		.done(
				function() {
					toggleLocation.toggle =  document.querySelector(".toggleLocation").winControl;
					toggleConnectOnStartUp.toggle =  document.querySelector(".toggleConnectOnStartUp").winControl;
					toggleShareOnStartUp.toggle =  document.querySelector(".toggleShareOnStartUp").winControl;

					var IstoggleConnectOnStartUp = (localStorage.getItem("toggleConnectOnStartUp") || "false")==="true";
					var IstoggleShareOnStartUp = (localStorage.getItem("toggleShareOnStartUp") || "false") ==="true";

					toggleConnectOnStartUp.toggle.checked = IstoggleConnectOnStartUp;
					toggleShareOnStartUp.toggle.checked = IstoggleShareOnStartUp;
					toggleLocation.toggle.checked = toggleShareOnStartUp.toggle.checked;
					
					var splitView = document.querySelector(".splitView").winControl;
					Messages.ListView.winControl = document
							.querySelector("#listView").winControl;
					SOS.ListView.winControl = document
							.querySelector("#sosListView").winControl;

					new WinJS.UI._WinKeyboard(splitView.paneElement); // Temporary
					mySplitView.splitView = splitView;
					Messages.ListView.winControl
							.addEventListener(
									'iteminvoked',
									function(e) {
										e.detail.itemPromise
												.done(function(invokedItem) {
													$("#messageTitle")
															.html(
																	Messages[invokedItem.data.id].Title
																			|| '');
													$("#messageDescription")
															.html(
																	Messages[invokedItem.data.id].Description
																			|| '');
													$("#messageImage")
															.attr(
																	'src',
																	Messages[invokedItem.data.id].ImageFile
																			|| '');
													showPage("messageViewPage");
												});
									});
					SOS.ListView.winControl.addEventListener('iteminvoked',
							function(e) {
								e.detail.itemPromise
										.done(function(invokedItem) {
											launchDialer(invokedItem.data.text)
										});
							});
				});

app.start();

/* LOGIN */
$(".email-signup").hide();
$("#signup-box-link").click(function() {
	$(".email-login").fadeOut(100);
	$(".email-signup").delay(100).fadeIn(100);
	$("#login-box-link").removeClass("active");
	$("#signup-box-link").addClass("active");
});
$("#login-box-link").click(function() {
	$(".email-login").delay(100).fadeIn(100);
	$(".email-signup").fadeOut(100);
	$("#login-box-link").addClass("active");
	$("#signup-box-link").removeClass("active");
});

$("#imageAccidentInput").change(
		function(event) {
			var files = $("#imageAccidentInput").prop('files');
			if (files.length > 0) {
				var reader = new FileReader();
				reader.onload = function(e) {
					$('#accidentPreview').css('background-image',
							'url("' + e.target.result + '")');
				}
				reader.readAsDataURL(files[0]);
			} else {
				$('#accidentPreview').css('background-image',
						'url("images/camera_icon.png")');
			}
		});

$("#profileCameraInput").change(
		function(event) {
			var files = $("#profileCameraInput").prop('files');
			if (files.length > 0) {
				var reader = new FileReader();
				reader.onload = function(e) {
					$('#profilePicEdit').css('background-image',
							'url("' + e.target.result + '")');
				};
				reader.readAsDataURL(files[0]);
				profilePicChangeFiles = files;
			} else {
				profilePicChangeFiles = null;
				$('#profilePicEdit').css('background-image',
						'url("' + UserMe.ImageFile + '")');
			}
		});

$("#profileGalleryInput").change(
		function(event) {
			var files = $("#profileGalleryInput").prop('files');
			if (files.length > 0) {
				var reader = new FileReader();
				reader.onload = function(e) {
					$('#profilePicEdit').css('background-image',
							'url("' + e.target.result + '")');
				}
				reader.readAsDataURL(files[0]);
				profilePicChangeFiles = files;
			} else {
				profilePicChangeFiles = null;
				$('#profilePicEdit').css('background-image',
						'url("' + UserMe.ImageFile + '")');
			}
		});
var profilePicChangeFiles;
var profilePicChangeFile;