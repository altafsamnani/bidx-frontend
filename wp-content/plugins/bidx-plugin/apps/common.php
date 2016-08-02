<?php

require_once( BIDX_PLUGIN_DIR . '/../services/wp-service.php' );
require_once( BIDX_PLUGIN_DIR . '/../services/session-service.php' );
require_once( BIDX_PLUGIN_DIR . '/../services/static-data-service.php' );
require_once( ABSPATH . WPINC . '/pluggable.php' );

/**
 * Common functions for all the services
 *
 * @author Altaf Samnani
 * @author Jaap Gorjup
 * @version 1.0
 */
class BidxCommon
{

    public static $bidxSession = array ();
    public static $scriptJs = array ();
    public static $staticSession = array ();
    public static $transientStaticData = array ();
    public static $scriptStaticJs;
    public static $i18nData = array ();

    public function __construct ()
    {
        $this->subDomain = self::get_bidx_subdomain ();
        $this->logger = Logger::getLogger (__CLASS__);

    }

    public function getBidxSessionAndScript ()
    {
        if ($this->subDomain) {
            $this->processSessionAndScript ($this->subDomain);
        }
    }

    public function isSetBidxAuthCookie ()
    {
        $bidxAuthCookie = false;
        $requestUri     =   explode ('?', $_SERVER ["REQUEST_URI"]);
        $hostAddress    =   explode ('/', $requestUri[0]);

        if($hostAddress[1] !== 'setpassword')  // Need to exclude setpassword as we dont want to call SessionService() for the same.
        {
            foreach ($_COOKIE as $cookieKey => $cookieValue) {
                if (preg_match ("/^bidx-auth/i", $cookieKey)) {
                    $bidxAuthCookie = true;
                }
            }
        }

        if (!$bidxAuthCookie && is_user_logged_in ()) {
            wp_logout ();
        }

        return $bidxAuthCookie;
    }

    //http://www.phpro.org/tutorials/Introduction-To-PHP-Sessions.html
    public function processSessionAndScript ($subDomain)
    {
        $is_ajax            =   false;

        $isFacebookReferer  =   false;

        if(isset ($_SERVER['HTTP_X_REQUESTED_WITH']) AND strtolower ($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest' )
        {
            $is_ajax            = true;
        };

        if (isset ($_SERVER['HTTP_REFERER']) AND strstr ($_SERVER['HTTP_REFERER'], 'facebook.com') )
        {
            $isFacebookReferer  =   true; // For express form Android Facebook Browser its needed Damnnnn
        }

        if (!$is_ajax || $isFacebookReferer ) {
            // To check whther its login page or q= redirect already checked session.
            $checkSession = $this->checkSession ();

            if ($checkSession) {

                //Start the session to store Bidx Session
                $this->startSession (); //Starting sessin because we want to display in dashboard widget bidx services
                //If Bidx Cookie set do the following
                if ($this->isSetBidxAuthCookie ()) {
                    //Check Session Variables from Second call, dont need to make session call from second request

                    $sessionVars = $this->getSessionVariables ($subDomain);

                    if (!$sessionVars) { // If Session set dont do anything
                        $sessionObj = new SessionService();
                        $bidxSessionVars = $sessionObj->isLoggedIn ();

                        //Set firsttime/new session variables
                        $sessionVars = $this->setSessionVariables ($subDomain, $bidxSessionVars);
                    }



                    //If not Logged in forcefully login to WP
                    $this->forceWordpressLogin ($subDomain, $sessionVars);
                }

                //Set static variables to access through pages
                $sessionVars = isset ($sessionVars) ? $sessionVars : NULL;
                $this->setStaticVariables ($subDomain, $sessionVars);

                //Iterate entities and store it properly ex data->entities->bidxEntrepreneurProfile = 2
                $this->processEntities ($subDomain);
            }

            $scriptValue = $this->injectJsVariables ($subDomain);
            $this->setScriptJs ($subDomain, $scriptValue);

        }

        return;
    }

    /**
     * Start PHP Session to avoid extra session calls
     *
     * @return Starts php session and execute the same session if session_id cookie exists
     */
    public function startSession ()
    {
        $time = 1800; //Default Time for nonactivity and make a new session call again

        //$session_id = (isset ($_COOKIE['session_id'])) ? $_COOKIE['session_id'] : NULL;
        $session_id = NULL;
        $this->clearSessionFromParam ($session_id);

        //Set Cookie Timeout
        // If commenting doamin bidx.net below plz refer BIDX-3580 first, its needed because of switching portals
        session_set_cookie_params (
        		$time
        		,'/'
        		,'bidx.net'
        );
//        if ($session_id) {
//            session_id ($session_id);
//        }
        session_start (); //or session_start();

       /* if (!$session_id)
        {
            setcookie ('session_id', session_id (), time () + $time, '/', '.bidx.net' );
        }*/
    }

    /**
     * Clear the full session, EXCEPT for a possible redirect setting which is needed after login.
     */
    static function clearWpBidxSession ()
    {
        session_start ();
        $redirect = (isset($_SESSION['returnAfterLogin'])) ? $_SESSION['returnAfterLogin'] : '';
        session_destroy ();
        if( isset($redirect) ){
            session_start ();
            $_SESSION['returnAfterLogin'] = $redirect;
        }
    }

    /**
     * Clear Session From GET param rs
     * @param $session_id Wordpress php session id to be cleared
     *
     * @return Starts php session and execute the same session if session_id cookie exists
     */
    function clearSessionFromParam ($session_id, $clearSession = false)
    {
        if (((isset ($_GET['rs']) && $_GET['rs']) || $clearSession )) {
            // This clears the full session, except for any post-login redirect setting.
            $this::clearWpBidxSession();
        }

        return;
    }

    public function getSessionVariables ($subDomain)
    {
        //Get Previous Session Variables if Set and Not Failed Login
        $authenticated = (isset ($_SESSION[$subDomain]->authenticated)) ? $_SESSION[$subDomain]->authenticated : 'false';
        if (!empty ($_SESSION[$subDomain]) &&
            ((!empty ($_SESSION[$subDomain]->code) && $_SESSION[$subDomain]->code != 'userNotLoggedIn') || $authenticated )) {
            $sessionVars = $_SESSION[$subDomain];

        } else {
            // This clears the full session, except for any post-login redirect setting.
            $this::clearWpBidxSession();
            $sessionVars = false;
        }

        return $sessionVars;
    }

    /**
     * Process Entities and store it in session variable
     *
     * @param Array $entities bidx response as array
     * @return String Injects js variables
     */
    public function setSessionVariables ($subDomain, $bidxSessionVars)
    {
        if (!empty ($bidxSessionVars)) {
            $_SESSION[$subDomain] = $bidxSessionVars;
            return $bidxSessionVars;
        }
    }



    /**
     * Process Entities and store it in session variable
     *
     * @param Array $entities bidx response as array
     * @return String Injects js variables
     */
    public function setStaticVariables ($subDomain, $sessionVars)
    {
        if (empty ($sessionVars)) {
        	$sessionVars = new stdClass();
            $sessionVars->data = NULL;
            $sessionVars->authenticated = 'false';
        }

        $this::$bidxSession[$subDomain] = $sessionVars;
        $this::$staticSession = $sessionVars;


    }

    /**
     * Process Entities and store it in session variable
     *
     * @param Array $entities bidx response as array
     * @return String Injects js variables
     */
    public function processEntities ($subDomain)
    {
        if (!empty ($this::$bidxSession[$subDomain]->data)) {
            $entities = $this::$bidxSession[$subDomain]->data->entities;

            foreach ($entities as $key => $value) {

                // New API has wrapped all it's data into a 'bidxMeta' block
                // Below is for keeping it backwards/forwards compatible
                //
                $meta = isset ($value->bidxMeta) ? $value->bidxMeta : $value;

                $bidxEntityType = $meta->bidxEntityType;
                $bidxEntityValue = $meta->bidxEntityId;

                //Creat empty object to store values
                ( !isset($this::$bidxSession[$subDomain]->data->wp ) ) ? $this::$bidxSession[$subDomain]->data->wp = new stdClass() : '';

                (!isset($this::$bidxSession[$subDomain]->data->wp->entities)) ? $this::$bidxSession[$subDomain]->data->wp->entities = new stdClass() : '';


                if($bidxEntityType == 'bidxBusinessSummary') {
                    $this::$bidxSession[$subDomain]->data->wp->entities->bidxBusinessSummary[$bidxEntityValue] = $bidxEntityValue;
                } else {
                    $this::$bidxSession[$subDomain]->data->wp->entities->$bidxEntityType = $bidxEntityValue;
                }
            }
        }
        return;
    }

    public function setStaticSession ($subDomain)
    {

        $this::$staticSession = $this::$bidxSession[$subDomain];
    }

    public function setScriptJs ($subDomain, $scriptValue)
    {
        return $this::$scriptJs[$subDomain] = $scriptValue;
    }

    public function getScriptJs ()
    {
        return (!empty ($this::$scriptJs)) ? $this::$scriptJs[$this->subDomain] : '';
    }



    /**
     * Injects Bidx Api response as JS variables
     *
     * @param Array $result bidx response as array
     * @return String Injects js variables
     */
    public function injectJsVariables ($subDomain)
    {
        global $sitepress;
        $iclLang            = '';
        $jsSessionData      = (isset($this::$bidxSession[$subDomain])) ?  $this::$bidxSession[$subDomain] : NULL;
        $jsSessionVars      = (isset ($jsSessionData->data)) ? json_encode ($jsSessionData->data) : '{}';
        $jsAuthenticated    = (isset ($jsSessionData->authenticated)) ? $jsSessionData->authenticated : 'false';
        $bidxJsDir          = sprintf ('%s/../static/js', BIDX_PLUGIN_URI);
        //API Response data
        $result             = ($jsSessionData) ? $this->getURIParams ($subDomain, $jsSessionData) : NULL;
        //$data = $result['data'];
        $jsApiVars          = (isset ($result['data'])) ? json_encode ($result['data']) : '{}';
        // milliseconds from 1 jan 1970 GMT
        $now                = time () * 1000;

        /*

        $currentLanguage = $sitepress->get_current_language();

        echo "<pre>";
        print_r($currentLanguage);
        echo "</pre>";exit;
        Script bidxConfig.currentLanguage  = '{$langCountry[0]}';
        */
        include_once( ABSPATH . 'wp-admin/includes/plugin.php' );

        if ( !is_plugin_active( 'sitepress-multilingual-cms/sitepress.php') && !isset( $sitepress) )
        {
            $locale                             =   '"' . get_locale().'"';
            $staticDataObj                      =   new StaticDataService();
            $customLanguages                    =   $staticDataObj->getLanguageCodes( );

            $iclVarsLang['current_language']    =   substr(get_locale(),0,2);
            $iclLang                            =   'var icl_single    = '.json_encode( $iclVarsLang ).';';

            if( count($customLanguages[$locale]))
            {
                $iclLang                        =   'var icl_single   = { "current_language":' .$customLanguages[$locale]['code']. '}';
            }
        }

        $scriptJs           = "<script>
                                    var bidxConfig              = bidxConfig || {};
                                    window.bidx                 = window.bidx || {};
                                    bidx.data                   = bidx.data || {};
                                    bidx.i18n                   = bidx.i18n || {};
                                    bidxConfig.context          =  $jsApiVars ;

                                    bidxConfig.session          = $jsSessionVars ; /* Dump response of the session-api */
                                    bidxConfig.now              = $now;
                                    bidxConfig.groupName        = '{$subDomain}';
                                    bidxConfig.authenticated    = {$jsAuthenticated};
                                    $iclLang
                                </script>
                            ";
        return $scriptJs;
    }

    /**
     * Grab the subdomain portion of the URL. If there is no sub-domain, the root
     * domain is passed back. By default, this function *returns* the value as a
     * string. Calling the function with echo = true prints the response directly to the screen.
     *
     * @param string $subDomain
     * @param string $jsSessionData
     */
    public function getURIParams ($subDomain, $jsSessionData = NULL)
    {
    /*    include_once( WP_PLUGIN_DIR . '/sitepress-multilingual-cms/inc/wpml-api.php' ); */

        $requestUri                                                 =   explode ('?', $_SERVER ["REQUEST_URI"]);
        $hostAddress                                                =   explode ('/', $requestUri[0]);
        $module                                                     =   $hostAddress[1];
        $id                                                         =   $hostAddress[2] ;
        $redirect                                                   =   NULL;
        $data                                                       =   new STDClass();
        $statusMsgId                                                =   NULL;
        $this::$bidxSession[$subDomain]->companyId                  =   NULL;
        $this::$bidxSession[$subDomain]->requestedBusinessSummaryId =   NULL;
        $this::$bidxSession[$subDomain]->external                   =   false;
        $eMsgId                                                     =   false;

        if( strlen ( $hostAddress[1] ) == 2 )
        {
            $module = $hostAddress[2];
            $id     = $hostAddress[3];
        }

        /**
         * Host Address
         * Param0 /member , /group, /profile
         * Param1 2 from /member/2 , 3 from /group/3
         */
        //$this->getWordpressLogin($jsSessionData);

        if (is_array ($hostAddress)) {

            //Redirect URL Logic
            switch ($module) {

                case 'expressform':
                    $memberId           = (empty ($jsSessionData->data)) ? NULL : $jsSessionData->data->id;
                    $businessSummaryId  = ( $id ) ? $id : NULL;
                    $isActivated        = get_option('bidx-expressform');
                    $this::$bidxSession[$subDomain]->external = ($isActivated) ? true : false;

                    if ( $businessSummaryId )
                    {
                        $data->businessSummaryId = $businessSummaryId;
                        $this::$bidxSession[$subDomain]->requestedBusinessSummaryId = $businessSummaryId;
                    }

                    if ( $memberId )
                    {
                        $data->memberId = $memberId;
                        $data->bidxGroupDomain = $jsSessionData->bidxGroupDomain;
                        $this::$bidxSession[$subDomain]->memberId = $memberId;                        
                    } 
                    /*else
                    {

                        $redirect = 'auth'; //To redirect /member and not loggedin page to /login
                        $statusMsgId = 1;
                    }*/

                    $this::$bidxSession[$subDomain]->expressForm = $isActivated;



                    break;

                case 'member':
                    $sessionMemberId = (empty ($jsSessionData->data)) ? NULL : $jsSessionData->data->id;
                    $memberId = ( !empty ( $id ) ) ? $id : $sessionMemberId;

                    if ($memberId) 
                    {
                        $data->memberId = $memberId;
                        $data->bidxGroupDomain = $jsSessionData->bidxGroupDomain;
                        $this::$bidxSession[$subDomain]->memberId = $memberId;
                        $this::$bidxSession[$subDomain]->external = ($_GET['external']) ? $_GET['external'] : false;
                    } 
                    else 
                    {
                        $redirect       = 'auth'; //To redirect /member and not loggedin page to /login
                        
                        if($_GET['external'])
                        {
                            $eMsgId         =   $_GET['external'];
                        }
                        else
                        {
                            $statusMsgId    = 1;
                        }
                    }

                    break;

                case 'company':

                    $companyId = NULL;
                    if (!empty ($id)) {
                        $companyId = $id;
                    }

                    $data->bidxGroupDomain = $jsSessionData->bidxGroupDomain;

                    if ($companyId) {
                        $data->companyId = $companyId;
                        $this::$bidxSession[$subDomain]->companyId = $companyId;
                    }
                    break;

                case 'businesssummary':

                    $businessSummaryId = ( $id ) ? $id : NULL;

                    if ($businessSummaryId) 
                    {
                        $data->businessSummaryId = $businessSummaryId;

                        $this::$bidxSession[$subDomain]->requestedBusinessSummaryId = $businessSummaryId;

                        if( !empty ($jsSessionData->data->id ) )
                        {
                            $this::$bidxSession[$subDomain]->memberId = $jsSessionData->data->id;
                        }            
                    }

                    break;

                case 'competition':
                    $competitionId = ( $id ) ? $id : NULL;

                    if ($competitionId) {
                        $data->competitionId = $competitionId;
                        $this::$bidxSession[$subDomain]->competitionId = $competitionId;
                    }

                break;

                case 'auth':
                case 'join':
                case 'login':
                    // Store REFERER for later use in function #redirectUrls when the homepage is loaded.
                    // To ensure excessive (Backbone) redirects do not change this into a different page,
                    // only change it if not already set. Once the homepage is loaded, the session value
                    // will be cleared, and a redirect might be triggered.

                    // We cannot (easily) set this in the array $this::$bidxSession[$subDomain] as then
                    // it's not (easily) preserved it in clearWpBidxSession.

                    if( empty( $_SESSION['returnAfterLogin'] ) )
                    {
                        $referrer = $_SERVER[ "HTTP_REFERER" ];
                        if( preg_match("(/join|/auth|/login)", $referrer) !== 1 )
                        {
                            $_SESSION['returnAfterLogin'] = $referrer;
                        }
                    }
                    break;

            }

            if ($jsSessionData) {
                $authenticated = (isset ($jsSessionData->authenticated)) ? $jsSessionData->authenticated : 'false';
                $this->redirectUrls ($module, $authenticated, $redirect, $statusMsgId, $eMsgId, $subDomain);
            }

            $return['data'] = $data;

            return $return;
        }

        return;
    }

/*    function redirectToLogin ()
    {
        $http = (is_ssl ()) ? 'https://' : 'http://';
        $redirect_url = $http . $_SERVER['HTTP_HOST'] . '/auth';
        header ("Location: " . $redirect_url);
        exit;
    }*/

    /**
     * Bidx Logn redirect for Not Logged in users
     *
     * @param String $username
     * @param String $password
     * @return Loggedin User
     */
    function redirectUrls ($uriString, $authenticated, $redirect = NULL, $statusMsgId = NULL, $eMsgId = NULL, $subDomain)
    {
        $redirect_url   =   NULL;
        $urlSep         =   '?';
        $http           =   (is_ssl ()) ? 'https://' : 'http://';
        $requestUri     =   explode ('?', $_SERVER ["REQUEST_URI"]);
        $hostAddress    =   explode ('/', $requestUri[0]);
        $current_url    =   $http . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        $param          =   '';
        $langUrl        =   '';

        if( strlen ( $hostAddress[1] ) == 2 )
        {
            $langUrl = '/'. $hostAddress[1];
        }

        //Status Messages
        if ($statusMsgId) 
        {
            $param.= '?smsg=' . $statusMsgId;
            $urlSep = '&';
        }

        if ($eMsgId) 
        {
            $param.= $urlSep . 'emsg=' . $eMsgId;
            $urlSep = '&';
        }

        //Other than login page and no user authenticated redirect him Moved to api service

        switch ($uriString) {

            case 'auth' :
                if ($authenticated == 'true') {
                    $redirect_url = $http . $_SERVER['HTTP_HOST'] .$langUrl. '/member' . $param;
                } else {
                    wp_clear_auth_cookie ();
                }
                break;

            case 'member' :

                if ($authenticated == 'false' && $redirect) 
                {
                    $member_url     =   $http . $_SERVER['HTTP_HOST'] . $requestUri[0];
                    //$redirect_url = $http . $_SERVER['HTTP_HOST'] .$langUrl . '/' . $redirect . $param;
                    $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] .$langUrl. '/'. $redirect. $param. $urlSep.'redirect_to=' . base64_encode ($member_url) . '/#auth/login';

                    wp_clear_auth_cookie ();

                    //Clear Session and Static variables (except for any redirect setting)
                    $this::clearWpBidxSession();

                    $this::$staticSession = NULL;
                    unset ($this::$bidxSession[$subDomain]);
                }

                break;

            case 'forcelogin' :

                // Forces a login, even when already authenticated. This is used when the backend API
                // handles a shortlink from a notification email, and then discovers that the user
                // following that link is actually not the user for whom the link was intended.

                // 2015-02-03: Somehow the logic from 'mail' below does not really log out the user.
                // Using bidx_signout() shows a "Please wait", and does not pick up the "redirect_to" URL.

                // If Apache redirected before this is handled (like to redirect from HTTP to HTTPS) then
                // the "url" parameter might have been percent-encoded twice, leaving $_GET['url'] with a
                // (single) encoded value. Hence we're calling urldecode(...) just in case, though that
                // will cause issues if the bare URL actually includes percent characters. (See also
                // http://serverfault.com/questions/331899/apache-mod-rewrite-double-encodes-query-string)
 
                $getUrl         =   urldecode( $_GET['url'] );

                /* Why this is needed , Because after login wordpress needs one page redirection to set the cookies and then again redirect back from there through returnAfterLogin */

                if( preg_match ('/wp-content/i', $getUrl ) 
                    || preg_match ('/wp-admin/i', $getUrl ) 
                    || preg_match ('/wp-login/i', $getUrl) )
                {
                    $redirect_url   =   $getUrl ;
    
                     if( $authenticated != 'true' )
                     { 
          
                         $redirect_url                 = $http . $_SERVER['HTTP_HOST'] .$langUrl. '/auth?redirect_to='.base64_encode (urldecode('/')).'#auth/login';
                         $_SESSION['returnAfterLogin'] = $getUrl;
                         wp_clear_auth_cookie ( );

                        //Clear Session and Static variables (except for any redirect setting)
                        $this::clearWpBidxSession();

                        $this::$staticSession = NULL;
                        unset ($this::$bidxSession[$subDomain]);
                    }

                } 
                else
                {
                    $redirect_url   =   $$http . $_SERVER['HTTP_HOST'] .$langUrl. '/auth?redirect_to=' . base64_encode ( urldecode($_GET['url']) ) . '#auth/login';;                

                    clear_bidx_cookies ();
                    $params['domain'] = get_bidx_subdomain ();
                    call_bidx_service ('session', $params, 'DELETE');
                    wp_clear_auth_cookie ();

                    // This clears the full session, except for any post-login redirect setting, so clear that too.
                    $this::clearWpBidxSession();
                    unset( $_SESSION['returnAfterLogin'] );
                }

                break;

            case 'expressform':
            $expressform    =   $this::$bidxSession[$subDomain]->expressForm;

            if ( $authenticated == 'false' )
            {
                if ( $expressform == 'fb'  // || $expressform == 'bidx' 
                    )
                {
                    $redirect_url = $http. $_SERVER['HTTP_HOST'] .$langUrl. '/auth?redirect_to=' . base64_encode ($current_url);

                    if( $expressform == 'fb')
                    {
                        $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] .'/bidx-soca/bidxauth?id=facebook&path.success='.$langUrl.'/expressform';

                        $redirect_url = str_replace( 'local', 'test', $redirect_url);                        
                    }
            

                    wp_clear_auth_cookie ();

                    //Clear Session and Static variables (except for any redirect setting)
                    $this::clearWpBidxSession();

                    $this::$staticSession = NULL;
                    unset ($this::$bidxSession[$subDomain]);
                }
            
            }
            break;

            case 'mail' :
                if ($authenticated == 'false') {

                    $redirect_url = $http . $_SERVER['HTTP_HOST'] .$langUrl. '/auth?redirect_to=' . base64_encode ($current_url) . '/#auth/login';
                    wp_clear_auth_cookie ();

                    //Clear Session and Static variables (except for any redirect setting)
                    $this::clearWpBidxSession();

                    $this::$staticSession = NULL;
                    unset ($this::$bidxSession[$subDomain]);
                }
                break;

           /* case 'wp-admin' :       // Group admin and wp-admin at that time only
                if ($authenticated == 'false') {

                    $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/auth?redirect_to=' . base64_encode ($current_url) . '/#auth/login';
                    ;
                    wp_clear_auth_cookie ();

                    //Clear Session and Static variables
                    session_destroy ();

                    $this::$staticSession = NULL;
                    unset ($this::$bidxSession[$subDomain]);
                }
                break;*/

            case '' :
                // Only on the homepage, and if authenticated and still some redirect is pending: redirect.
                session_start();
                $returnTo = $_SESSION['returnAfterLogin'];
                if( $authenticated == 'true' && !empty($returnTo) )
                {
                    $redirect_url = $returnTo;
                }
                unset( $_SESSION['returnAfterLogin'] );
                break;

            default:
                if ($uriString != 'auth' && $authenticated == 'false') {

                    //$redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/login/?q=' . base64_encode($current_url);
                }
        }

        if ($redirect_url) 
        {

            header ("Location: " . $redirect_url);
            exit;
        }

        return;
    }

    /**
     *
     * @return boolean
     */
    public function checkSession ()
    {

        $isCheck = true;
        $hostAddress = explode ('/', $_SERVER ["REQUEST_URI"]);
        $params = $_GET;
        $currentUser = wp_get_current_user ();
        $currentRoles = $currentUser->roles;

        //Dont check it as its having redirect param q= , it was already checked else it will be indefinite loop
        if (( $hostAddress[1] == 'auth' && isset ($params['q']) )
            //$hostAddress[1]   == 'registration'                   ||
            || (isset($hostAddress[2]) && strstr ($hostAddress[2], 'admin-ajax.php'))
            || strstr ($hostAddress[1], 'wp-login.php')
            || (is_super_admin() && preg_match ('/wp-admin/i', $hostAddress[1]) )
            || in_array('administrator', $currentRoles)
            ) { //Allow Groupadmin for wp-admin dashboard
            $isCheck = false;
            //$session_id = (isset ($_COOKIE['session_id'])) ? $_COOKIE['session_id'] : NULL;
            //$this->clearSessionFromParam ($session_id);
        }
        //Login to Wordpress if already session exists

        return $isCheck;
    }

    /**
     * Check if URI pattern is of wordpress internal function.
     * @todo check of assets and scripts and maybe other functions can be added
     */
    static public function isWPInternalFunction ()
    {

        $serverUri          =   $_SERVER[ "REQUEST_URI" ];
        $currentUser        =   wp_get_current_user ();
        $currentRoles       =   $currentUser->roles;

        $iswpInternalVar    =   (   preg_match ( '/wp-login/i', $serverUri )
                                ||  preg_match ( '/admin-ajax/i', $serverUri )
                                ||  in_array( 'administrator', $currentRoles )
                                ||  ( is_super_admin( ) && preg_match ('/wp-admin/i', $serverUri ) )
                                );

        return $iswpInternalVar;
    }

    /**
     * Force Wordpress Login for single sign on
     * @param string $subdomain
     */
    function forceWordpressLogin ($subDomain, $sessionData)
    {
        if ($sessionData != null && !empty ($sessionData->authenticated) && $sessionData->authenticated == 'true') {

            $groupName = $subDomain;
            $roles = $sessionData->data->roles;
            $currentUser = wp_get_current_user ();
            $bidxLoginPriority = explode('|',BIDX_LOGIN_PRIORITY);

            if (in_array ($bidxLoginPriority[0], $roles)) {
                $userName = 'admin';
            }
            else if (in_array ($bidxLoginPriority[1], $roles)) {
                $userName = $groupName . WP_OWNER_ROLE;
            }
            else if (in_array ($bidxLoginPriority[2], $roles)) {
                $userName = $groupName . WP_ADMIN_ROLE;
            }
            else {
                $userName = $groupName . WP_MEMBER_ROLE;
            }

            //If currently Logged in dont do anything
            if ($currentUser && isset ($currentUser->user_login) && $userName == $currentUser->user_login) {

            } else if ($user_id = username_exists ($userName)) {   //just do an update
                // userdata will contain all information about the user
                $userdata = get_userdata ($user_id);
                $user = wp_set_current_user ($user_id, $userName);
                // this will actually make the user authenticated as soon as the cookie is in the browser
                wp_set_auth_cookie ($user_id);

                // the wp_login action is used by a lot of plugins, just decide if you need it
                do_action ('wp_login', $userdata->ID);
                // you can redirect the authenticated user to the "logged-in-page", define('MY_PROFILE_PAGE',1); f.e. first
                return;
            }
        }
    }

    /**
     * Grab the subdomain portion of the URL. If there is no sub-domain, the root
     * domain is passed back. By default, this function *returns* the value as a
     * string. Calling the function with echo = true prints the response directly to
     * the screen.
     *
     * @param bool $echo
     */
    static function get_bidx_subdomain ($echo = false, $url = NULL)
    {
		if ( defined( 'ORIGINAL_DOMAIN' ) ) {

			$httpHost = ORIGINAL_DOMAIN;
    	} else {

        	$httpHost = ($url) ? str_replace(array("http://", "https://"),"",$url) : $_SERVER ["HTTP_HOST"];
    	}

        $hostAddress = explode ('.', $httpHost );
        if (is_array ($hostAddress)) {

            $domain = $hostAddress [0];

            if ($echo == false) {
                return $domain;
            } else {
                echo $domain;
            }
        } else {
            return ( false );
        }
    }

    /**
     * Builds an http query string.
     * @param array $query  // of key value pairs to be used in the query
     * @return string       // http query string.
     * */
    static function buildHTTPQuery ($query)
    {

        $query_array = array ();
        foreach ($query as $key => $key_value) {
            $query_array[] = $key . '=' . urlencode ($key_value);
        }
        return implode ('&', $query_array);
    }

    /**
     * Set Site Transient
     * @param $session_id Wordpress php session id to be cleared
     *
     * @return Starts php session and execute the same session if session_id cookie exists
     * @see localeTextdomainInit() Function in common.php
     * @example http://matty.co.za/2012/01/wordpress-transients-api/ Use of Transient api
     * @example http://wpengineer.com/2237/whats-the-difference-between-__-_e-_x-and-_ex/ Use of x
     */
    public function getLocaleTransient ($i18n = array (), $static = true, $i18nGlobal = true)
    {

        $transientStaticData = NULL;
        /* 1. Static Locale Data */
        if ($static)
        {
            $siteLocale     = get_locale ();
            $staticDataObj  = new StaticDataService();
            $transientKey   = 'static' . $siteLocale; // Transient key for Static Data
            $transientStaticData = get_transient ($transientKey);

            /* If no value then set the site local transient */
            if ($transientStaticData == false)
            {
                $resultStaticData = $staticDataObj->getStaticData (NULL);
                $staticDataVars = $resultStaticData->data;
                $transientStaticData = $staticDataObj->getMultilingualStaticData ($staticDataVars);
                set_transient ($transientKey, $transientStaticData, 60 * 5); //Second*Min*Hour
            }
        }

        /* 2. I18n Global/App Locale Data */
        $i18PluginArr = array ();

        $i18AppsArr = array ();

        if ($i18nGlobal)
        {
            $i18PluginArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/{i18n.xml}', GLOB_BRACE);
        }

        if (!empty ($i18n))
        {
            $moduleNameArr  =   implode (',', $i18n);

            $i18AppsArr     =   glob (WP_PLUGIN_DIR . '/bidx-plugin/{apps,admin}/*{' . $moduleNameArr . '}/{i18n.xml}', GLOB_BRACE);
        }

        $fileArr = array_merge ($i18AppsArr, $i18PluginArr);

        foreach ($fileArr as $fileName)
        {

            $dirArr     = (preg_match ("/(apps|admin)\/(.*)\/i18n.xml/i", $fileName, $matches));

            $appName    = (isset ($matches[2])) ? $matches[2] : '__global';

            $document   = simplexml_load_file ($fileName);

            $items      = $document->xpath ('//Item');

            $count      = 0;

            $transientI18nData[$appName] = array ();

            foreach ($items as $xmlObj)
            {
                $transientI18nData[$appName][$count] = new stdClass();

                $arr = $xmlObj->attributes ();

                $xmlLabel = $xmlObj->__toString ();

                if ($appName == '__global')
                {
                    $label = __ ($xmlLabel, 'i18n');
                } else {
                    $label = _x ($xmlLabel, $appName, 'i18n');
                }

                $transientI18nData[$appName][$count]->value = $arr['value']->__toString ();

                $transientI18nData[$appName][$count]->label =  utf8_encode ( $label );

                $count++;
            }
        }

        /* Messages
        $filename = BIDX_PLUGIN_DIR . '/../pages/message.xml';
        $countMessage = 0;

        $document = simplexml_load_file ($filename);
        $messages = $document->xpath ('//message');

        foreach ($messages as $message)
        {

            $templateLibrary = new TemplateLibrary();
            $body = $templateLibrary->replaceMessageTokens ($message->content);
            $subject = $templateLibrary->replaceMessageTokens ($message->subject);

            if ( !isset($transientI18nData['templates'][$countMessage]) ) {
            	$transientI18nData['templates'][$countMessage] = new stdClass();
            }
            $transientI18nData['templates'][$countMessage] = new stdClass();
            $transientI18nData['templates'][$countMessage]->value = $message->name.'subject';
            $transientI18nData['templates'][$countMessage]->label = $subject;
            $countMessage++;
            if ( !isset($transientI18nData['templates'][$countMessage]) ) {
            	$transientI18nData['templates'][$countMessage] = new stdClass();
            }
            $transientI18nData['templates'][$countMessage] = new stdClass();
            $transientI18nData['templates'][$countMessage]->value = $message->name.'body';
            $transientI18nData['templates'][$countMessage]->label = $body;

            $countMessage++;
        }
        */

        (isset ($transientI18nData['__global'])) ? $returnData['__global'] = $transientI18nData['__global'] : '';
        ($transientStaticData) ? $returnData['static'] = $transientStaticData : '';

        //unset( $transientI18nData['global'] );
        $returnData['i18n'] = $transientI18nData;

        $this::setI18nData ($returnData);

        return $returnData;
    }

    public function setI18nData ($returnData)
    {

        $this::$i18nData = $returnData;

        return;
    }

    static function getI18nData ()
    {

        return self::$i18nData;
    }

}

?>
