
const REQ_TOKEN_URL = "oauth/request_token";
const AUTH_URL = "https://api.twitter.com/oauth/authenticate";
const ACCESS_URL = "oauth/access_token";

const REQ_TOKEN_URL_V2 = "oauth2/token";

const HOME_TIMELINE_URL = "1.1/statuses/home_timeline.json";
const USER_TIMELINE_URL = "1.1/statuses/user_timeline.json";

// array of timelines
var twArray = [];

function Twitter(name){
  // array of tweets:
  // https://dev.twitter.com/docs/platform-objects/tweets
  this.tweets = [];
  // id of latest tweet received
  this.lastId = 0;
  // timeline name
  this.screen_name = name;
}

// static method
Twitter.connectOA1 = function() {
  // https://dev.twitter.com/docs/auth/implementing-sign-twitter
  OAuth1(REQ_TOKEN_URL, AUTH_URL, ACCESS_URL);
  OAuth1.step1();
};

Twitter.connectOA2 = function() {
  OAuth2(REQ_TOKEN_URL_V2);
  OAuth2.step1();
};

Twitter.disconnect = function() {
  localStorage.removeItem("twitter_token");
  localStorage.removeItem("twitter_token_secret");
  window.location.reload();
};

Twitter.createUserTimeline = function(name) {
  if (name in twArray){
    showGenericError('The username is already present');
  }
  else
  {  
    addTimeline(name);
    var t = new Twitter(name);
    t.getTimeline();
    twArray[name] = t;
  }
};	

Twitter.removeTimeline = function(name) {
  delete twArray[name];
};

// instance methods
Twitter.prototype.size = function() {
  return this.tweets.length;
};

Twitter.prototype.updateTweet = function(data) {
    if (data.errors){
      showError(data.errors[0].message, this.screen_name);
    }
    else
    {
      if (data.length > 0){
        // is better to use id_str instead of id because:
        // https://dev.twitter.com/docs/twitter-ids-json-and-snowflake
        this.lastId = data[0].id_str;
        this.tweets = data.concat(this.tweets);
        // call UI functions
        showTweets(this.tweets, this.screen_name);
      }
      else{
        nothingNew(this.screen_name);
      }
   }
};

Twitter.prototype.getTimeline = function() {
  if (this.screen_name == 'me')
    sendRequest(HOME_TIMELINE_URL, "GET", this.updateTweet.bind(this), logError);
  else
    sendRequest(USER_TIMELINE_URL + "?screen_name=" + this.screen_name, "GET", this.updateTweet.bind(this), logError);
}

Twitter.prototype.refreshTimeline = function() {
  if (this.lastId == 0)
    this.refreshTimeline().bind(this);
  else if (this.screen_name == 'me')
    sendRequest(HOME_TIMELINE_URL + "?since_id=" + this.lastId , "GET", this.updateTweet.bind(this), logError);
  else
    sendRequest(USER_TIMELINE_URL + "?screen_name=" + this.screen_name + "&since_id=" + this.lastId, "GET", this.updateTweet.bind(this), logError);
}

Twitter.prototype.removeTweet = function(id) {
  for (i=0; i<this.tweets.length; i++)
    if (this.tweets[i].id_str == id)
      this.tweets.splice(i, 1);
  showTweets(this.tweets, this.screen_name);
}

