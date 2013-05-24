<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

require_once( BIDX_PLUGIN_DIR . '/../services/session-service.php' );
require_once( ABSPATH . WPINC . '/pluggable.php' );

class BidxCommon {

  public static $staticSession;
  public static $scriptJs;

  public function __construct() {

    if ($this::$scriptJs == null) {
      $this->checkSession();
      $this::$scriptJs = $this->injectJsVariables();
    }
  }

  private function checkSession() {
    $is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) AND
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

    if (!$is_ajax) {
      // To check whther its login page or q= redirect already checked session.
      $checkSession = $this->getLoginParams();
      //Check session if its not redirect (is not having q= param)
      if ($checkSession) {
        $sessionObj = new SessionService();
        $this::$staticSession = $sessionObj->isLoggedIn();
      }
    }
    //self::$staticSession = $this->sessionData;
    return;
  }

  public function getScriptJs() {
    return $this::$scriptJs;
  }

  /**
   * Injects Bidx Api response as JS variables
   * @Author Altaf Samnani
   * @param Array $result bidx response as array
   *
   * @return String Injects js variables
   */
  public function injectJsVariables() {

    $jsSessionData = $this::$staticSession;
    $jsSessionVars = (isset($jsSessionData->data)) ? json_encode($jsSessionData->data) : '{}';

    //Api Resposne data
    $data = $this->getURIParams($jsSessionData);
    $jsApiVars = (isset($data)) ? json_encode($data) : '{}';



    $scriptJs = "<script>
            var bidxConfig = bidxConfig || {};

            bidxConfig.context =  $jsApiVars ;

            /* Dump response of the session-api */
            bidxConfig.session = $jsSessionVars ;

            bidxConfig.authenticated = {$jsSessionData->authenticated};
</script>";
    //echo $scriptJs;
    return $scriptJs;
    //eturn $scriptJs;
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
  public function getURIParams($jsSessionData = NULL) {


    $hostAddress = explode('/', $_SERVER ["REQUEST_URI"]);
    $redirect = NULL;
    $data = new STDClass();
    /*     * Host Address
     * Param0 /member , /group, /profile
     * Param1 2 from /member/2 , 3 from /group/3
     *
     */

    if (is_array($hostAddress)) {
       //Redirect URL Logic
      

      switch ($hostAddress[1]) {

        case 'member':
          $memberId = ( $hostAddress[2] ) ? $hostAddress[2] : $jsSessionData->data->id;
          if($memberId) {
          $data->memberId = $memberId;
          $data->bidxGroupDomain = $jsSessionData->bidxGroupDomain;
          $this::$staticSession->memberId = $memberId;
          } else {
            $redirect = 'login';//To redirect /member and not loggedin page to /login
          }

          break;
      }   

      $this->redirectUrls($hostAddress[1], $jsSessionData->authenticated, $redirect);
      return $data;
    }

    return;
  }

  function redirectToLogin() {
    $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/login';
    header("Location: " . $redirect_url);
    exit;
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

  function redirectUrls($uriString, $authenticated, $redirect=NULL) {
    $redirect_url = NULL;
    $current_url = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

    //Other than login page and no user authenticated redirect him Moved to api service

    switch ($uriString) {
      case 'login' :
        if ($authenticated == 'true') {
          $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/member';
        }
        else {
          wp_clear_auth_cookie();
        }
        break;

      case 'member' :
        if ($authenticated == 'false' && $redirect) {
          $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/'.$redirect;
          wp_clear_auth_cookie();
        }

        break;

      default:
        if ($uriString != 'login' && $authenticated == 'false') {

          //$redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/login/?q=' . base64_encode($current_url);
        }
    }

    if ($redirect_url) {
      header("Location: " . $redirect_url);
      exit;
    }

    return;
  }

  static public function getLoginParams() {
    $checkLoginSession = true;
    $hostAddress = explode('/', $_SERVER ["REQUEST_URI"]);

    //Dont check it as its having redirect param q= , it was already checked else it will be indefinite loop
    if (( $hostAddress[1] == 'login' && preg_match("/^[?]q=/i", $hostAddress[2]) ) ||
        strstr($hostAddress[1], 'wp-login.php')) {
      $checkLoginSession = false;
    }

    return $checkLoginSession;
  }

}

?>
