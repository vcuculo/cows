
function showApp() {
  $('#splash').fadeOut('slow', function () {
    $('#app').show();
  });
}

function hideApp() {
  $('#app').fadeOut('slow', function () {
    $('#splash').fadeIn('slow');
  });
}

function addTimeline(name){
  var closebutton = '';
  var offset = '';

  if(name != 'me'){
    // add the close timeline button
    closebutton = '<button id="close-'+name+'" type="button" class="close" data-dismiss="alert">&times;</button>';

    // increase page width
    $('body').width(function(n,c){
      return c+500;
    });

    $('body,html').animate(
        {scrollLeft: $('body').width() - 1851}, 800
    );

    // shift left first timeline
    $('#timeline-me').removeClass("offset3");
  }else{
    offset = 'offset3';
  }
  $('#timelines').append('<div id="timeline-'+name+'" class="span5 '+offset+' content-main">\
                          <div class="content-header">'+closebutton+'<span><b>'+name+'</b></span>\
                          <br><span id="counter-'+name+'" class="counter"></span><br>\
                          <a id="refresh-'+name+'" class="btn btn-success" href="#""><i class="icon-refresh"></i> Refresh</a></div>\
                          <div class="nothing-new alert alert-info text-center" id="nothing-'+name+'"><b>Nothing new</b>, try again later!</div>\
                          <div class="error-message alert alert-error text-center" id="error-'+name+'"></div>\
                          <div class="content-body" id="results-'+name+'"></div></div>');
  startSpinner(name);
}

function showTweets(data, name){
  stopSpinner(name);
  $('#results-'+name).html(
    $('#twitterTemplate').render(data)
  );
  updateCounter(data.length, name);
}

function startSpinner(name){
  $('#refresh-'+name+' > i').addClass("icon-spin");
}

function stopSpinner(name){
  $('#refresh-'+name+' > i').removeClass("icon-spin");
}

function nothingNew(name){
  stopSpinner(name);
  $('#nothing-'+name).slideDown('slow').delay(1000).slideUp('slow');
}

function showError(message, name){
  stopSpinner(name);
  $('#error-'+name).html("<b>Error!</b> "+message);
  $('#error-'+name).slideDown('slow').delay(1000).slideUp('slow');
}

function showGenericError(message){
  $('#error-generic').html("<b>Error!</b> "+message);
  $('#error-generic').slideDown('slow').delay(1000).slideUp('slow');
}

function updateCounter(num, name){
  $('#counter-'+name).html(num + " tweets stored");
}

function logError(richiesta,stato,errori){
  console.log(stato + ': ' +errori);
}


// Event Listeners

$(document).on({
  click: function () {
    Twitter.connect();
  }
}, '#twitter-signin');

$(document).on({
  click: function () {
    Twitter.disconnect();
  }
}, '#disconnect');

$(document).on({
  keypress: function (e) {
    var key = e.keyCode;
    if (key == 13){
      Twitter.createUserTimeline($('#prependedInput').val());
      $('#prependedInput').val('');
    }
  }
}, '#prependedInput');

$(document).on({
  click: function() {
    Twitter.createUserTimeline($('#prependedInput').val());
    $('#prependedInput').val('');
  }
}, '#add');

$(document).on({
  click: function() {
    var name = this.id.split("-")[1];
    startSpinner(name);
    twArray[name].refreshTimeline();
  }
}, '[id^=refresh-]');

$(document).on({
  dblclick: function() {
    var tweetId = this.id.split("-")[1];
    var timelineId = this.parentNode.id.substring(8);
    // remove tweet from timeline
    $('#tweet-'+tweetId).hide( "drop", function(){
      $(this).remove();
      twArray[timelineId].removeTweet(tweetId);
    });
  }
}, '[id^=tweet-]');

$(document).on({
  click: function() {
    var name = this.id.split("-")[1];
    // remove timeline
    $('#timeline-'+name).hide("puff", function(){
      $(this).remove();
      Twitter.removeTimeline(name);
    });
    // decrese body width
    $('body').width(function(n,c){
      return c-500;
    });

    $('body,html').animate(
        {scrollLeft: "-="+500}, 800
    );

    // center home_timeline
    if (Object.keys(twArray).length == 2)
      $('#timeline-me').addClass("offset3");
  }
}, '[id^=close-]');

