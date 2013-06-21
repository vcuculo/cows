<?php
 
/**
 *  Usage:
 *  Send the url you want to access url encoded in the url paramater, for example (This is with JS): 
 *  /twitter-proxy.php?url='+encodeURIComponent('statuses/user_timeline.json?screen_name=MikeRogers0&count=2')
*/
 
// The tokens, keys and secrets from the app you created at https://dev.twitter.com/apps
$config = array(
	'oauth_access_token' => '',
	'oauth_access_token_secret' => '',
        'consumer_key' => '',
        'consumer_secret' => '',
	'use_whitelist' => false, // If you want to only allow some requests to use this script.
	'base_url' => 'https://api.twitter.com/',
        'oauth_version' => '1'
);
 
// Only allow certain requests to twitter. Stop randoms using your server as a proxy.
$whitelist = array(
	'statuses/user_timeline.json?screen_name=MikeRogers0&count=10&include_rts=false&exclude_replies=true'=>true
);

/*
* Ok, no more config should really be needed. Yay!
*/

if (!function_exists("getallheaders"))
{
  function getallheaders()
  {
    $headers = "";

    foreach ($_SERVER as $name => $value)
    {
      if (substr($name, 0, 5) == "HTTP_")
      {
        $headers[str_replace(" ", "-", ucwords(strtolower(str_replace("_", " ", substr($name, 5)))))] = $value;
      }
    }

    return $headers;
  }
}


foreach (getallheaders() as $name => $value) 
{
    if ($name == 'oauth_token'){
      $config['oauth_access_token'] = $value;
    }
    else if ($name == 'oauth_token_secret'){
      $config['oauth_access_token_secret'] = $value;
    }
    else if ($name == 'oauth_version'){
      $config['oauth_version'] = $value;
    }
}

// We'll get the URL from $_GET[]. Make sure the url is url encoded, for example encodeURIComponent('statuses/user_timeline.json?screen_name=MikeRogers0&count=10&include_rts=false&exclude_replies=true')
if(!isset($_GET['url'])){
	die('No URL set');
}
 
$url = $_GET['url'];
 
 
if($config['use_whitelist'] && !isset($whitelist[$url])){
	die('URL is not authorised');
}
 
// Figure out the URL parmaters
$url_parts = parse_url($url);
parse_str($url_parts['query'], $url_arguments);
 
$full_url = $config['base_url'].$url; // Url with the query on it.
$base_url = $config['base_url'].$url_parts['path']; // Url without the query.

/**
* Code below from http://stackoverflow.com/questions/12916539/simplest-php-example-retrieving-user-timeline-with-twitter-api-version-1-1 by Rivers 
* with a few modfications by Mike Rogers to support variables in the URL nicely
*/
$postfields = '';
$contenttype = '';

function buildBaseString($baseURI, $method, $params) {
	$r = array();
	ksort($params);
	foreach($params as $key=>$value){
	$r[] = "$key=" . rawurlencode($value);
	}
	return $method."&" . rawurlencode($baseURI) . '&' . rawurlencode(implode('&', $r));
}

function buildAuthorizationHeader($oauth, $config) {
        global $contenttype;
        global $postfields;

        if ($config['oauth_version'] == '1') {
          $r = 'Authorization: OAuth ';
          $values = array();
          foreach($oauth as $key=>$value)
            $values[] = "$key=\"" . rawurlencode($value) . "\"";
          $r .= implode(', ', $values);

        } else {

          if ($config['oauth_access_token'] == '') {
            $auth_string = rawurlencode($config['consumer_key']).':'.rawurlencode($config['consumer_secret']);
            $r = 'Authorization: Basic '.base64_encode($auth_string);
            $contenttype = 'Content-Type: application/x-www-form-urlencoded;charset=UTF-8';
            $postfields = 'grant_type=client_credentials';
          }else{
            $r = 'Authorization: Bearer '.$config['oauth_access_token'];
          }
        }
       	return $r;
}

$oauth = array(
          'oauth_consumer_key' => $config['consumer_key'],
          'oauth_nonce' => time(),
          'oauth_signature_method' => 'HMAC-SHA1',
          'oauth_token' => $config['oauth_access_token'],
          'oauth_timestamp' => time(),
          'oauth_version' => '1.0'
         );

$base_info = buildBaseString($base_url, 'GET', array_merge($oauth, $url_arguments));
$composite_key = rawurlencode($config['consumer_secret']) . '&' . rawurlencode($config['oauth_access_token_secret']);
$oauth_signature = base64_encode(hash_hmac('sha1', $base_info, $composite_key, true));
$oauth['oauth_signature'] = $oauth_signature;

// Make Requests
$header = array(
	buildAuthorizationHeader($oauth, $config)
);

if ($contenttype != '')
  $header[] = $contenttype;

$options = array(
	CURLOPT_HTTPHEADER => $header,
	CURLOPT_HEADER => false,
	CURLOPT_URL => $full_url,
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_SSL_VERIFYPEER => false
);

if ($postfields != '')
  $options[CURLOPT_POSTFIELDS] = $postfields;

$feed = curl_init();
curl_setopt_array($feed, $options);
$result = curl_exec($feed);
$info = curl_getinfo($feed);
curl_close($feed);
 
// Send suitable headers to the end user.
if(isset($info['content_type']) && isset($info['size_download'])){
	header('Content-Type: '.$info['content_type']);
	header('Content-Length: '.$info['size_download']);
 
}
 
echo($result);
?>
