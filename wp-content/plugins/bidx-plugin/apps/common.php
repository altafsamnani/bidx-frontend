<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

require_once( BIDX_PLUGIN_DIR . '/../services/session-service.php' );

class BidxCommon {

  static public $staticSession;

  public function __construct() {
    
  }

  static public function checkSession() {
    $is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) AND
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

    if (!$is_ajax) {

      $sessionObj = new SessionService();
      self::$staticSession = $sessionObj->isLoggedIn();

      self::injectJsVariables(self::$staticSession);
      //Add JS Variables for Frontend
      //add_action('wp_head', array(&$this, 'injectJsVariables'));
    }
    //self::$staticSession = $this->sessionData;
    return;
  }

  /**
   * Injects Bidx Api response as JS variables
   * @Author Altaf Samnani
   * @param Array $result bidx response as array
   *
   * @return String Injects js variables
   */
  static public function injectJsVariables($jsSessionData) {

    
    $jsSessionVars = (isset($jsSessionData->data)) ? json_encode($jsSessionData->data) : '{}';

    //Api Resposne data
    $data = self::getURIParams($jsSessionData);
    $jsApiVars = (isset($data)) ? json_encode($data) : '{}';



    $scriptJs = " <head><script>
            var bidxConfig = bidxConfig || {};

            bidxConfig.context =  $jsApiVars ;

            /* Dump response of the session-api */
            bidxConfig.session = $jsSessionVars ;

            bidxConfig.authenticated = {$jsSessionData->authenticated};
</script></head>";
    echo $scriptJs;
    return;
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
static public function getURIParams($jsSessionData) {
  
 
  $hostAddress = explode('/', $_SERVER ["REQUEST_URI"]);

  /**Host Address
   * Param0 /member , /group, /profile
   * Param1 2 from /member/2 , 3 from /group/3
   *
   */
  if (is_array($hostAddress)) {

    switch ($hostAddress[1]) {

    case 'member':
       $memberId = ( $hostAddress[2] ) ? $hostAddress[2] : $jsSessionData->data->id;
       $data->memberId = $memberId;
       $data->bidxGroupDomain = $jsSessionData->bidxGroupDomain;
       self::$staticSession->memberId = $memberId;
       break;
    }
      return $data;
  }
  else {
    return ;
  }
}

}

?>
