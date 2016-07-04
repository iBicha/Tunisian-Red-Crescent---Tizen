//callback(err,access_token)
  
function FacebookLoginDialog(callback) {
	var baseUrl = 'https://www.facebook.com/dialog/oauth';
	var client_id = '519757734868044';
	var redirect_uri = 'https://www.facebook.com/connect/login_success.html';
	var scope = 'user_birthday,email';

	if (!window.fbMonitor) {
		 
		window.oauthDialog = window.open(baseUrl + '?client_id=' + client_id
				+ "&redirect_uri=" + redirect_uri + "&scope=" + scope);
 		window.fbMonitor = setInterval(function() {
			if (window.oauthDialog && window.oauthDialog.window) {
				var code = getParameterByName(oauthDialog.window.location.href,
						"code");
				if (code != "") {
					window.oauthDialog.close();
					window.oauthDialog = null;
					clearInterval(window.fbMonitor);
					window.fbMonitor = null;
					getAccessToken(code, callback);
				}
			} else {
				window.oauthDialog = null;
				clearInterval(window.fbMonitor);
				window.fbMonitor = null;
			}
		}, 50);
	}
}

function getAccessToken(code, callback) {
	var baseUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
	var client_id = '519757734868044';
	var redirect_uri = 'https://www.facebook.com/connect/login_success.html';
	var client_secret = '7e526bc009e83c75896a5d07cc5e8c72';
	 
	$.get(
			baseUrl + '?client_id=' + client_id + '&redirect_uri='
					+ redirect_uri + '&client_secret=' + client_secret
					+ '&code=' + code, function(data) {
				if (callback) {
					if (data.access_token) {
						callback(null, data.access_token);
					} else {
						callback("Graph API ERROR", null);
					}
				}
			}, "json").fail(function(xhr, textStatus, errorThrown) {
		callback(errorThrown, null);
	});
}
function getParameterByName(url, name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(url);
	if (results == null)
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}
 