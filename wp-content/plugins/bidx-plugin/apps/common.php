<?php

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
        foreach ($_COOKIE as $cookieKey => $cookieValue) {
            if (preg_match ("/^bidx-auth/i", $cookieKey)) {
                $bidxAuthCookie = true;
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
        $is_ajax = isset ($_SERVER['HTTP_X_REQUESTED_WITH']) AND
            strtolower ($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

        if (!$is_ajax) {
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

                //Check Is competition running then set cookie
                $this->isCompetitionRunning();
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
        session_set_cookie_params ($time,'/','bidx.net');
//        if ($session_id) {
//            session_id ($session_id);
//        }
        session_start (); //or session_start();

        //if (!$session_id) {
        //setcookie ('session_id', session_id (), time () + $time, '/', 'bidx.net' );
        //}
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
            /* Clear the Session */
            //session_id ($session_id);
            session_start ();
            session_destroy ();
            //setcookie ('session_id', ' ', time () - YEAR_IN_SECONDS, '/', 'bidx.net');
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
            session_unset ();
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
     * Check is there competition and if exists then set cookie so we can call logout for skipso
     *
     * @param Array $entities bidx response as array
     * @return String Injects js variables
     */
    public function isCompetitionRunning ( )
    {
        $isCompetition  = get_option ('skipso-competition');
        
        if ($isCompetition && !isset($_COOKIE['bidx-skipso-competition'])) {
            setcookie('bidx-skipso-competition', 1, time()+3600*24*100, COOKIEPATH, COOKIE_DOMAIN, false);
        }
        return;
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
            $sessionVars->data = NULL;
            $sessionVars->authenticated = 'false';
        }

        $this::$bidxSession[$subDomain] = $sessionVars;
        $this::$staticSession = $sessionVars;

        $isCompetitionRunning = get_option ('skipso-competition');


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
                $this::$bidxSession[$subDomain]->data->wp->entities->$bidxEntityType = $bidxEntityValue;
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
        $jsSessionData = (isset($this::$bidxSession[$subDomain])) ?  $this::$bidxSession[$subDomain] : NULL;
        $jsSessionVars = (isset ($jsSessionData->data)) ? json_encode ($jsSessionData->data) : '{}';
        $jsAuthenticated = (isset ($jsSessionData->authenticated)) ? $jsSessionData->authenticated : 'false';
        $bidxJsDir = sprintf ('%s/../static/js', BIDX_PLUGIN_URI);


        //API Response data
        $result = ($jsSessionData) ? $this->getURIParams ($subDomain, $jsSessionData) : NULL;

        //$data = $result['data'];
        $jsApiVars = (isset ($result['data'])) ? json_encode ($result['data']) : '{}';

        // milliseconds from 1 jan 1970 GMT
        //
        $now = time () * 1000;

        $scriptJs = "<script>
            var bidxConfig  = bidxConfig || {};

            window.bidx     = window.bidx || {};
            bidx.data       = bidx.data || {};
            bidx.i18n       = bidx.i18n || {};

            bidxConfig.context =  $jsApiVars ;

            /* Dump response of the session-api */
            bidxConfig.session = $jsSessionVars ;

            bidxConfig.now = $now;
            bidxConfig.groupName = '{$subDomain}';

            bidxConfig.authenticated = {$jsAuthenticated};
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
        $requestUri = explode ('?', $_SERVER ["REQUEST_URI"]);
        $hostAddress = explode ('/', $requestUri[0]);
        $redirect = NULL;
        $data = new STDClass();
        $statusMsgId = NULL;
        /**
         * Host Address
         * Param0 /member , /group, /profile
         * Param1 2 from /member/2 , 3 from /group/3
         */
        //$this->getWordpressLogin($jsSessionData);

        if (is_array ($hostAddress)) {

            //Redirect URL Logic
            switch ($hostAddress[1]) {

                case 'member':
                    $sessionMemberId = (empty ($jsSessionData->data)) ? NULL : $jsSessionData->data->id;
                    $memberId = ( isset ($hostAddress[2]) && $hostAddress[2]) ? $hostAddress[2] : $sessionMemberId;

                    if ($memberId) {
                        $data->memberId = $memberId;
                        $data->bidxGroupDomain = $jsSessionData->bidxGroupDomain;
                        $this::$bidxSession[$subDomain]->memberId = $memberId;
                    } else {

                        $redirect = 'auth'; //To redirect /member and not loggedin page to /login
                        $statusMsgId = 1;
                    }

                    break;

                case 'company':

                    $companyId = null;
                    if (!empty ($hostAddress[2])) {
                        $companyId = $hostAddress[2];
                    }

                    $data->bidxGroupDomain = $jsSessionData->bidxGroupDomain;

                    if ($companyId) {
                        $data->companyId = $companyId;
                        $this::$bidxSession[$subDomain]->companyId = $companyId;
                    }
                    break;

                case 'businesssummary':

                    $businessSummaryId = ( $hostAddress[2] )
                        ? $hostAddress[2]
                        : null;

                    if ($businessSummaryId) {
                        $data->businessSummaryId = $businessSummaryId;
                        $this::$bidxSession[$subDomain]->requestedBusinessSummaryId = $businessSummaryId;
                    }

                    break;
            }

            if ($jsSessionData) {
                $authenticated = (isset ($jsSessionData->authenticated)) ? $jsSessionData->authenticated : 'false';
                $this->redirectUrls ($hostAddress[1], $authenticated, $redirect, $statusMsgId, $subDomain);
            }

            $return['data'] = $data;

            return $return;
        }

        return;
    }

    function redirectToLogin ()
    {
        $http = (is_ssl ()) ? 'https://' : 'http://';
        $redirect_url = $http . $_SERVER['HTTP_HOST'] . '/auth';
        header ("Location: " . $redirect_url);
        exit;
    }

    /**
     * Bidx Logn redirect for Not Logged in users
     *
     * @param String $username
     * @param String $password
     * @return Loggedin User
     */
    function redirectUrls ($uriString, $authenticated, $redirect = NULL, $statusMsgId = NULL, $subDomain)
    {
        $redirect_url = NULL;
        $urlSep = '?';
        $http = (is_ssl ()) ? 'https://' : 'http://';
        $current_url = $http . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        $param = '';
        //Status Messages
        if ($statusMsgId) {
            $param.= '?smsg=' . $statusMsgId;
            $urlSep = '&';
        }

        //Other than login page and no user authenticated redirect him Moved to api service

        switch ($uriString) {

            case 'auth' :
                if ($authenticated == 'true') {
                    $redirect_url = $http . $_SERVER['HTTP_HOST'] . '/member' . $param;
                } else {
                    wp_clear_auth_cookie ();
                }
                break;

            case 'member' :

                if ($authenticated == 'false' && $redirect) {
                    $redirect_url = $http . $_SERVER['HTTP_HOST'] . '/' . $redirect . $param;
                    wp_clear_auth_cookie ();

                    //Clear Session and Static variables
                    session_destroy ();

                    $this::$staticSession = NULL;
                    unset ($this::$bidxSession[$subDomain]);
                }

                break;

            case 'mail' :
                if ($authenticated == 'false') {

                    $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/auth?redirect_to=' . base64_encode ($current_url) . '/#auth/login';
                    wp_clear_auth_cookie ();

                    //Clear Session and Static variables
                    session_destroy ();

                    $this::$staticSession = NULL;
                    unset ($this::$bidxSession[$subDomain]);
                }
                break;

            case 'wp-admin' :       // Group admin and wp-admin at that time only
                if ($authenticated == 'false') {

                    $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/auth?redirect_to=' . base64_encode ($current_url) . '/#auth/login';
                    ;
                    wp_clear_auth_cookie ();

                    //Clear Session and Static variables
                    session_destroy ();

                    $this::$staticSession = NULL;
                    unset ($this::$bidxSession[$subDomain]);
                }
                break;


            default:
                if ($uriString != 'auth' && $authenticated == 'false') {

                    //$redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/login/?q=' . base64_encode($current_url);
                }
        }

        if ($redirect_url) {
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
            || is_super_admin()
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
        $serverUri = $_SERVER["REQUEST_URI"];
        $currentUser = wp_get_current_user ();
        $currentRoles = $currentUser->roles;
        $iswpInternalVar = ((is_super_admin())
                            || preg_match ('/wp-login/i', $serverUri)
                            || preg_match ('/admin-ajax/i', $serverUri)
                            || in_array('administrator', $currentRoles) );
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
                $userName = $groupName . WP_OWNER_ROLE;
            }else if (in_array ($bidxLoginPriority[1], $roles)) {
                $userName = $groupName . WP_ADMIN_ROLE;
            } else {
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
        $httpHost = ($url) ? str_replace(array("http://", "https://"),"",$url) : $_SERVER ["HTTP_HOST"];
        $hostAddress = explode ('.', $httpHost );
        if (is_array ($hostAddress)) {
            if (strcasecmp ("www", $hostAddress [0]) == 0) {
                $passBack = 1;
            } else {
                $passBack = 0;
            }
            if ($echo == false) {
                return ( $hostAddress [$passBack] );
            } else {
                echo ( $hostAddress [$passBack] );
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
        if ($static) {
            $siteLocale = get_locale ();
            $staticDataObj = new StaticDataService();
            $transientKey = 'static' . $siteLocale; // Transient key for Static Data
            $transientStaticData = get_transient ($transientKey);

            /* If no value then set the site local transient */
            if ($transientStaticData == false) {
                $resultStaticData = $staticDataObj->getStaticData (NULL);
                $staticDataVars = $resultStaticData->data;
                $transientStaticData = $staticDataObj->getMultilingualStaticData ($staticDataVars);
                set_transient ($transientKey, $transientStaticData, 60 * 5); //Second*Min*Hour
            }
        }

        /* 2. I18n Global/App Locale Data */
        $i18PluginArr = array ();
        $i18AppsArr = array ();

        if ($i18nGlobal) {
            $i18PluginArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/{i18n.xml}', GLOB_BRACE);
        }

        if (!empty ($i18n)) {
            $moduleNameArr = implode (',', $i18n);
            $i18AppsArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/apps/*{' . $moduleNameArr . '}/{i18n.xml}', GLOB_BRACE);
        }

        $fileArr = array_merge ($i18AppsArr, $i18PluginArr);

        foreach ($fileArr as $fileName) {

            $dirArr = (preg_match ("/apps\/(.*)\/i18n.xml/i", $fileName, $matches));
            $appName = (isset ($matches[1])) ? $matches[1] : '__global';
            $document = simplexml_load_file ($fileName);
            $items = $document->xpath ('//Item');
            $count = 0;
            $transientI18nData[$appName] = array ();
            foreach ($items as $xmlObj) {

                $transientI18nData[$appName][$count] = new stdClass();

                $arr = $xmlObj->attributes ();
                $xmlLabel = $xmlObj->__toString ();

                if ($appName == '__global') {
                    $label = __ ($xmlLabel, 'i18n');
                } else {
                    $label = _x ($xmlLabel, $appName, 'i18n');
                }

                $transientI18nData[$appName][$count]->value = $arr['value']->__toString ();


                $transientI18nData[$appName][$count]->label = $label;

                $count++;
            }
        }

        /* Messages */
        $filename = BIDX_PLUGIN_DIR . '/../pages/message.xml';
        $countMessage = 0;
        //try /catch / log ignore
        $document = simplexml_load_file ($filename);
        $messages = $document->xpath ('//message');

        foreach ($messages as $message) {

            $templateLibrary = new TemplateLibrary();
            $body = $templateLibrary->replaceMessageTokens ($message->content);
            $subject = $templateLibrary->replaceMessageTokens ($message->subject);

            $transientI18nData['templates'][$countMessage]->value = $message->name.'subject';
            $transientI18nData['templates'][$countMessage]->label = $subject;
            $countMessage++;
            $transientI18nData['templates'][$countMessage]->value = $message->name.'body';
            $transientI18nData['templates'][$countMessage]->label = $body;

            $countMessage++;
        }

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
