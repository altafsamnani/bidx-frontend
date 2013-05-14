<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

require_once( BIDX_PLUGIN_DIR . '/../services/session-service.php' );

class BidxCommon {

    public $sessionData;
    static public $staticSession;

    public function __construct() {
        
    }

    static public function checkSession() {
        $sessionObj = new SessionService();
        self::$staticSession = $sessionObj->isLoggedIn();
        
        self::injectJsVariables( self::$staticSession );
        //Add JS Variables for Frontend
        //add_action('wp_head', array(&$this, 'injectJsVariables'));

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
    static public function injectJsVariables($jsSessionData ) {

        //$jsSessionData = self::$staticSession;
        //Session Response data
     
        $getParam = 12;
        $memberId = ( $getParam ) ? $getParam : $jsSessionData->data->id;
        
        $data->memberId = $memberId;
        $data->bidxGroupDomain = $sessionData->bidxGroupDomain;
      
        self::$staticSession->memberId = $memberId;

        $jsSessionVars = (isset($jsSessionData->data)) ? json_encode($jsSessionData->data) : '{}';

        //Api Resposne data
        $jsApiVars = (isset($data)) ? json_encode($data) : '{}';


        //bidxConfig.context =  $jsApiVars ;
        $scriptJs = " <head><script>
            var bidxConfig = bidxConfig || {};



            /* Dump response of the session-api */
            bidxConfig.session = $jsSessionVars ;

            bidxConfig.authenticated = {$jsSessionData->authenticated};
</script></head>";
        echo $scriptJs;
        return;
        //eturn $scriptJs;
    }

}

?>
