
/*  OAuth v1.0A implementation
 *  reqiured for Application-user authentication
 *
 *  https://dev.twitter.com/docs/auth/oauth 
 */


// https://tools.ietf.org/html/rfc5849
function OAuth1(req_token_url, auth_url, access_url){
  OAuth1.req_token_url = req_token_url;
  OAuth1.auth_url = auth_url;
  OAuth1.access_url = access_url;
  localStorage["oauth_version"] = 1;
}

$(document).ready(function () {
  var oauth_verifier = getParameter(location.search, "oauth_verifier");
  var oauth_token = getParameter(location.search, "oauth_token");
  
  if (oauth_verifier && oauth_token)
  {
    localStorage["twitter_token"] = oauth_token;
    localStorage["twitter_token_secret"] = oauth_verifier;
    window.close();
  }
});

OAuth1.step1 = function() {
  sendRequest(OAuth1.req_token_url, "POST", OAuth1.step2, logError);
}

OAuth1.step2 = function(result){
  console.log(result);
  var token = getParameter(result, 'oauth_token');
  var win = window.open(OAuth1.auth_url + "?oauth_token=" + token, 'OWS' ,'width=800,height=600,status=0,toolbar=0');
  if (win == null || typeof(win)=='undefined')
    alert("Turn off your pop-up blocker and reload the page.");
  else {
    var timer = setInterval(function() {
      var oauth_verifier = localStorage["twitter_token_secret"];
      if(win.closed && oauth_verifier != undefined) {
          clearInterval(timer);  
          OAuth1.step3(oauth_verifier);
      }
    }, 1000);
  }
}

OAuth1.step3 = function(oauth_verifier){
  sendRequest(OAuth1.access_url + "?oauth_verifier=" + oauth_verifier, "POST", OAuth1.complete_oauth, logError);
}

OAuth1.complete_oauth = function(result){
  console.log(result);
  var oauth_token = getParameter(result, "oauth_token");
  var oauth_token_secret = getParameter(result, "oauth_token_secret");

  if (oauth_token && oauth_token_secret){
    localStorage["twitter_token"] = oauth_token;
    localStorage["twitter_token_secret"] = oauth_token_secret;
  }
  showApp();
  Twitter.createUserTimeline('me');
}

/*  OAuth v2.0 implementation
 *  reqiured for Application-only authentication
 *
 *  https://dev.twitter.com/docs/auth/application-only-auth
 */

// http://tools.ietf.org/html/rfc6749
function OAuth2(req_token_url){
  OAuth2.req_token_url = req_token_url;
  localStorage["oauth_version"] = 2;
}

OAuth2.step1 = function() {
  sendRequest(OAuth2.req_token_url, "POST", OAuth2.step2, logError);
}

OAuth2.step2 = function(result){
  console.log(result);
  if (result.token_type == "bearer"){
    localStorage["twitter_token"] = result.access_token;
    showApp();
  }
}
