
// array of timelines
var twArray = [];

$(document).ready(function () {
  // check if token exists
  var token = localStorage["twitter_token"];
  var secret = localStorage["twitter_token_secret"];

  if (token != undefined && secret != undefined){
    showApp();
    Twitter.createUserTimeline('me');
  }
});

