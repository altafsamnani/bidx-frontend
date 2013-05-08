<?php

/**
 * @Author Altaf Samnani
 * API bridge abstract class for handling bidX API interaction
 */
abstract class APIbridge {

  private $authUsername = 'bidx'; // Bidx Auth login
  private $authPassword = 'gobidx'; // Bidx Auth password

  public function __construct() {
    // Do stuff specific for Foo
  }

  /**
	 * Calls Bidx Api Service
   * @Author Altaf Samnani
	 * @param String $urlService  Name of service
   * @param Array $body  Parameters needs to be send
   * @param String $method  Type of Method Get/Post/Put/Delete
   * @param Boolean $isFormUpload  is it form upload
   *
	 * Calls the bidx service and get the response
	 * @return Array $requestData response from Bidx API
	 */
  public function callBidxAPI($urlService, $body, $method = 'POST', $isFormUpload = false) {


    $bidxMethod = strtoupper($method);
    $bidx_get_params = "";
    $cookie_string = "";
    $sendDomain = 'bidx.net';
    $cookieArr = array();
    $groupDomain = $this->getBidxSubdomain();
    $groupDomain = "site1";

    /*     * *********1. Retrieve Bidx Cookies and send back to api to check ******* */
    $cookieInfo = $_COOKIE;
    foreach ($_COOKIE as $cookieKey => $cookieValue) {
      if (preg_match("/^bidx/i", $cookieKey)) {
        $cookieArr[] = new WP_Http_Cookie(array('name' => $cookieKey, 'value' => urlencode($cookieValue), 'domain' => $sendDomain));
      }
    }

    /*     * *********2. Set Headers ******************************** */
    //For Authentication
    $headers['Authorization'] = 'Basic ' . base64_encode("$this->authUsername:$this->authPassword");

    // 2.1 Is Form Upload
    if ($isFormUpload) {
      $headers['Content-Type'] = 'multipart/form-data';
    }


    // 2.2 Set the group domain header
    if ( $groupDomain ) {
      //Talk with arjan for domain on first page registration it will be blank when it goes live
      $headers['X-Bidx-Group-Domain'] = ($urlService == 'groups' && $bidxMethod == 'POST') ? 'beta' : $groupDomain;
      //$bidx_get_params.= '&groupDomain=' . $body['domain'];
    }

    /*     * ********* 3. Decide method to use************** */
    if ($bidxMethod == 'GET') {
      $bidx_get_params = ($body) ? '&' . http_build_query($body) : '';
      $body = NULL;
    }


    /*     * *********** 4. WP Http Request ******************************* */

    $url = API_URL . $urlService . '?csrf=false' . $bidx_get_params;

    $request = new WP_Http;
    $result = $request->request($url, array('method' => $bidxMethod,
      'body' => $body,
      'headers' => $headers,
      'cookies' => $cookieArr
        ));

    /*     * *********** 5. Set Cookies if Exist ************************* */
    $cookies = $result['cookies'];
    if (count($cookies)) {
      foreach ($cookies as $bidxAuthCookie) {
        $cookieDomain = (DOMAIN_CURRENT_SITE == 'bidx.dev') ? 'bidx.dev' : $bidxAuthCookie->domain;
        setcookie($bidxAuthCookie->name, $bidxAuthCookie->value, $bidxAuthCookie->expires, $bidxAuthCookie->path, $cookieDomain, FALSE, $bidxAuthCookie->httponly);
      }
    }

    $requestData = $this->processResponse($urlService, $result,$groupDomain);

   
    return $requestData;
  }


  /**
	 * Process Bidx Api Response
   * @Author Altaf Samnani
	 * @param String $urlService  Name of service
   * @param Array $requestData response from Bidx API
   *
	 * @return Array $requestData response from Bidx API
	 */
  public function processResponse($urlService, $result,$groupDomain) {

    $requestData = json_decode($result['body']);
    $httpCode = $result['response']['code'];
    $redirectUrl = NULL;

    /*     * ***Check the Http response and decide the status of request whether its error or ok * */

    if ($httpCode >= 200 && $httpCode < 300) {
      //Keep the real status
      //$requestData->status = 'OK';
      $requestData->authenticated = 'true';
    }
    else if ($httpCode >= 300 && $httpCode < 400) {
      $requestData->status = 'ERROR';
      $requestData->authenticated = 'true';
    }
    else if ($httpCode == 401) {
      $requestData->status = 'ERROR';
      $requestData->authenticated = 'false';
       $this->bidxRedirectLogin($groupDomain);
    }


    return $requestData;
  }



  /**
	 * Injects Bidx Api response as JS variables
   * @Author Altaf Samnani
	 * @param Array $result bidx response as array
	 *
	 * @return String Injects js variables
	 */
  function injectJsVariables( $sessionData, $result ) {

    //Session Response data
    $jsSessionVars = (isset($sessionData->data)) ? json_encode($sessionData->data) :'{}';

    //Api Resposne data
    $jsApiVars = (isset($result)) ? json_encode($result) :'{}';

 

    $scriptJs = " <script>
            var bidxConfig = bidxConfig || {};

            bidxConfig.context =  $jsApiVars ;

            /* Dump response of the session-api */
            bidxConfig.session = $jsSessionVars ;

            bidxConfig.authenticated = {$sessionData->authenticated};
</script>";
    echo $scriptJs;
    //return $scriptJs;
    return;

  }

  /**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Grab the subdomain portion of the URL. If there is no sub-domain, the root
 * domain is passed back. By default, this function *returns* the value as a
 * string. Calling the function with echo = true prints the response directly to
 * the screen.
 *
 * @param bool $echo
 */
function getBidxSubdomain($echo = false) {
  $hostAddress = explode('.', $_SERVER ["HTTP_HOST"]);
  if (is_array($hostAddress)) {
    if (eregi("^www$", $hostAddress [0])) {
      $passBack = 1;
    }
    else {
      $passBack = 0;
    }
    if ($echo == false) {
      return ($hostAddress [$passBack]);
    }
    else {
      echo ($hostAddress [$passBack]);
    }
  }
  else {
    return (false);
  }
}

/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * Bidx Logn redirect for Not Logged in users
 *
 * @param String $username
 * @param String $password
 *
 * @return Loggedin User
 */
function bidxRedirectLogin ($groupDomain) {
  wp_clear_auth_cookie();
  $current_url = 'http://'  . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  $redirect_url =  'http://'  .$groupDomain.'.'.DOMAIN_CURRENT_SITE.'/login?q='.base64_encode($current_url);

  header("Location: $redirect_url");
}

}

?>
