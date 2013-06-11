const PROXY = "twitter-proxy.php?url=";

function getParameter(string, param) {
  var regex = new RegExp(param + "=(.+?)(&|$)");
  try {
    return decodeURI(regex.exec(string)[1]);
  } catch (e) {
    return undefined;
  }
}

function sendRequest(endpoint, type, success, error){
  $.ajax({
    type: type,
    beforeSend: function (xhr) {
      var oauth_token = localStorage["twitter_token"];
      var oauth_secret = localStorage["twitter_token_secret"];
      if (oauth_token != undefined)
        xhr.setRequestHeader('oauth_token', oauth_token);
      if (oauth_secret != undefined)
        xhr.setRequestHeader('oauth_token_secret', oauth_secret);     
    },
    url: PROXY + encodeURIComponent(endpoint),
    success: success,
    error: error
  });
}


