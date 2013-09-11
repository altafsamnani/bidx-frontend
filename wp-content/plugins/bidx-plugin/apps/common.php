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
            $isWordpress = $this->isWordpressPage ();

            if (!$isWordpress) {

                //Start the session to store Bidx Session
                $this->startSession ();//Starting sessin because we want to display in dashboard widget bidx services

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

                $scriptValue = $this->injectJsVariables ($subDomain);
                $this->setScriptJs ($subDomain, $scriptValue);
            }

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
        $time = 60; //Default Time for nonactivity and make a new session call again

        $session_id = (isset ($_COOKIE['session_id'])) ? $_COOKIE['session_id'] : NULL;
        $this->clearSessionFromParam ($session_id);

        //Set Cookie Timeout
        session_set_cookie_params ($time);
        if ($session_id) {
            session_id ($session_id);
        }
        session_start (); //or session_start();
        //if (!$session_id) {
        setcookie ('session_id', session_id (), time () + $time, '/', '.' . COOKIE_DOMAIN);
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
        if (isset ($_GET['rs']) && $_GET['rs'] || $clearSession) {
            /* Clear the Session */
            session_id ($session_id);
            session_start ();
            session_destroy ();
            setcookie ('session_id', ' ', time () - YEAR_IN_SECONDS, ADMIN_COOKIE_PATH, COOKIE_DOMAIN);
        }

        return;
    }

    public function getSessionVariables ($subDomain)
    {
        //Get Previous Session Variables if Set and Not Failed Login
        if (!empty ($_SESSION[$subDomain]) &&
            ((!empty ($_SESSION[$subDomain]->code) && $_SESSION[$subDomain]->code != 'userNotLoggedIn') || $_SESSION[$subDomain]->authenticated)) {
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
        $jsSessionData = $this::$bidxSession[$subDomain];
        $jsSessionVars = (isset ($jsSessionData->data)) ? json_encode ($jsSessionData->data) : '{}';
        $jsAuthenticated = (isset ($jsSessionData->authenticated)) ? $jsSessionData->authenticated : '{}';
        $bidxJsDir = sprintf ('%s/../static/js', BIDX_PLUGIN_URI);


        //API Response data
        $result = $this->getURIParams ($subDomain, $jsSessionData);

        $data = $result['data'];
        $jsApiVars = (isset ($data)) ? json_encode ($data) : '{}';

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

                    $businessSummaryId = ( $hostAddress[2] ) ? $hostAddress[2] : $jsSessionData->data->wp->entities->bidxBusinessSummary;

                    if ($businessSummaryId) {
                        $data->bidxBusinessSummary = $businessSummaryId;
                        $data->bidxGroupDomain = (!empty ($jsSessionData->bidxGroupDomain)) ? $jsSessionData->bidxGroupDomain : NULL;
                        $this::$bidxSession[$subDomain]->bidxBusinessSummaryId = $businessSummaryId;
                    } else {
                        $redirect = 'auth'; //To redirect /member and not loggedin page to /login
                        $statusMsgId = 1;
                    }

                    break;

                case 'business':

                    $bpSummaryId = ( $hostAddress[2] ) ? $hostAddress[2] : $jsSessionData->data->wp->entities->bidxBusinessSummary;

                    if ($bpSummaryId) {
                        $data->bidxBusinessSummary = $bpSummaryId;
                        $data->bidxGroupDomain = (!empty ($jsSessionData->bidxGroupDomain)) ? $jsSessionData->bidxGroupDomain : NULL;
                        $this::$bidxSession[$subDomain]->bidxBusinessSummaryId = $bpSummaryId;
                    } else {
                        $redirect = 'auth'; //To redirect /member and not loggedin page to /login
                        $statusMsgId = 1;
                    }

                    break;
            }


            if ($jsSessionData) {
                $this->redirectUrls ($hostAddress[1], $jsSessionData->authenticated, $redirect, $statusMsgId, $subDomain);
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

                    $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/auth?redirect_to=' . base64_encode ($current_url).'/#auth/login';
                    wp_clear_auth_cookie ();

                    //Clear Session and Static variables
                    session_destroy ();

                    $this::$staticSession = NULL;
                    unset ($this::$bidxSession[$subDomain]);
                }
                break;

            case 'wp-admin' :       // Group admin and wp-admin at that time only
                 if ($authenticated == 'false') {

                    $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . '/auth?redirect_to=' . base64_encode ($current_url);
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
    public function isWordpressPage ()
    {

        $isWordpress = false;
        $hostAddress = explode ('/', $_SERVER ["REQUEST_URI"]);
        $params = $_GET;
        $currentUser = wp_get_current_user ();
        //Dont check it as its having redirect param q= , it was already checked else it will be indefinite loop
        if (( $hostAddress[1] == 'auth' && isset ($params['q']) ) || $hostAddress[1] == 'registration' ||
            strstr ($hostAddress[1], 'wp-login.php') ||
            (isset($currentUser) && preg_match ('/wp-admin/i', $hostAddress[1]) && !in_array('groupadmin', $currentUser->roles))) { //Allow Groupadmin for wp-admin dashboard
            $isWordpress = true;
            //$session_id = (isset ($_COOKIE['session_id'])) ? $_COOKIE['session_id'] : NULL;
            //$this->clearSessionFromParam ($session_id);

        }
        //Login to Wordpress if already session exists

        return $isWordpress;
    }

    /**
     * Check if URI pattern is of wordpress internal function.
     * @todo check of assets and scripts and maybe other functions can be added
     */
    static public function isWPInternalFunction ()
    {
        $currentUser = wp_get_current_user ();
        $serverUri = $_SERVER["REQUEST_URI"];
        $iswpInternalVar = ((isset($currentUser) && preg_match ('/wp-admin/i', $serverUri) && !in_array('groupadmin', $currentUser->roles)) || preg_match ('/wp-login/i', $serverUri));
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

            if (in_array ('GroupAdmin', $roles)) {
                $userName = $groupName . 'groupadmin';
            } else if (in_array ('GroupOwner', $roles)) {
                $userName = $groupName . 'groupowner';
            } else {
                $userName = $groupName . 'groupmember';
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
    static function get_bidx_subdomain ($echo = false)
    {

        $hostAddress = explode ('.', $_SERVER ["HTTP_HOST"]);
        if (is_array ($hostAddress)) {
            if ( strcasecmp( "www", $hostAddress [0]) == 0 ) {
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
            if ($transientStaticData === false) {
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
