<?php

require_once( BIDX_PLUGIN_DIR . '/../services/session-service.php' );
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

    public static $bidxSession;
    public static $scriptJs;
    public static $staticSession;

    public function __construct ($subDomain)
    {
        if ($subDomain) {
            $this->getSessionAndScript ($subDomain);
            $this->setStaticSession ($subDomain);
        }
    }

    private function getSessionAndScript ($subDomain)
    {
        $is_ajax = isset ($_SERVER['HTTP_X_REQUESTED_WITH']) AND
            strtolower ($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

        if (!$is_ajax) {
            // To check whther its login page or q= redirect already checked session.
            $isWordpress = $this->isWordpressPage ();
            //Check session if its not redirect (is not having q= param)
            if (!$isWordpress) {
                //if (!isset($this::$scriptJs [$subDomain])) { // If Session set dont do anything
                $sessionObj = new SessionService();
                $this::$bidxSession[$subDomain] = $sessionObj->isLoggedIn ();
                //Iterate entities and store it properly ex data->entities->bidxEntrepreneurProfile = 2
                $this->processEntities ($subDomain);
                // }

                $scriptValue = $this->injectJsVariables ($subDomain);
                $this->setScriptJs ($subDomain, $scriptValue);

                //If not Logged in forcefully login to WP
                if (!is_user_logged_in ()) {
                    $this->forceWordpressLogin ($subDomain);
                }
            }
        }
        return;
    }

    /**
     * Process Entities and store it in session variable
     *
     * @param Array $entities bidx response as array
     * @return String Injects js variables
     */
    public function processEntities ($subDomain)
    {
		if ( property_exists( $this::$bidxSession[$subDomain], 'data' ) )
		{
	        $entities = $this::$bidxSession[$subDomain]->data->entities;
	        foreach ($entities as $key => $value) {
	            $bidxEntityType = $value->bidxEntityType;
	            $bidxEntityValue = $value->bidxEntityId;
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

        $this::$scriptJs[$subDomain] = $scriptValue;
    }

    public function getScriptJs ($subDomain)
    {

        return $this::$scriptJs[$subDomain];
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

        //API Response data
        $data = $this->getURIParams ($subDomain, $jsSessionData);
        $jsApiVars = (isset ($data)) ? json_encode ($data) : '{}';

        $scriptJs = "<script>
            var bidxConfig = bidxConfig || {};

            bidxConfig.context =  $jsApiVars ;

            /* Dump response of the session-api */
            bidxConfig.session = $jsSessionVars ;

            bidxConfig.authenticated = {$jsAuthenticated};
</script>";
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
        $hostAddress = explode ('/', $_SERVER ["REQUEST_URI"]);
        $redirect = NULL;
        $data = new STDClass();

        /**
         * Host Address
         * Param0 /member , /group, /profile
         * Param1 2 from /member/2 , 3 from /group/3
         */
        //$this->getWordpressLogin($jsSessionData);

		$msg = array();

        if (is_array ($hostAddress)) {

            //Redirect URL Logic
            switch ($hostAddress[1]) {

                case 'member':
                    $memberId = ( $hostAddress[2] ) ? $hostAddress[2] : $jsSessionData->data->id;
                    if ($memberId) {
                        $data->memberId = $memberId;
                        $data->bidxGroupDomain = $jsSessionData->bidxGroupDomain;
                        $this::$bidxSession[$subDomain]->memberId = $memberId;
                    } else {
                        $redirect = 'login'; //To redirect /member and not loggedin page to /login
                        $msg['error'] = 'Your session expired. Please login again, sorry for any inconvenience and appreciate your patience.';
                    }

                    break;

                case 'company':
                    $companyId = null;
                    if (isset ($hostAddress[2]) && $hostAddress[2] != '#create') {
                        $companyId = $hostAddress[2];
                    }

                    $data->bidxGroupDomain = $jsSessionData->bidxGroupDomain;

                    if ($companyId) {
                        $data->companyId = $companyId;
                        $this::$bidxSession[$subDomain]->companyId = $companyId;
                    }
                    break;

                case 'businessplan':
                    $bpSummaryId = ( $hostAddress[2] ) ? $hostAddress[2] : $jsSessionData->data->wp->entities->bidxBusinessSummary;

                    if ($bpSummaryId) {
                        $data->bidxBusinessSummary = $bpSummaryId;
                        $data->bidxGroupDomain = $jsSessionData->bidxGroupDomain;
                        $this::$bidxSession[$subDomain]->bidxBusinessSummaryId = $bpSummaryId;
                    } else {
                        $redirect = 'login'; //To redirect /member and not loggedin page to /login
                        $msg['error'] = 'Your session expired. Please login again, sorry for any inconvenience and appreciate your patience.';
                    }

                    break;
            }

            $this->redirectUrls ($hostAddress[1], $jsSessionData->authenticated, $redirect, $msg);
            return $data;
        }

        return;
    }

    function redirectToLogin ()
    {
        $http = (is_ssl ()) ? 'https://' : 'http://';
        $redirect_url = $http . $_SERVER['HTTP_HOST'] . '/login';
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
    function redirectUrls ($uriString, $authenticated, $redirect = NULL, $statusMsg = NULL)
    {
        $redirect_url = NULL;
        $urlSep = '?';
        $http = (is_ssl ()) ? 'https://' : 'http://';
        $current_url = $http . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

        //Status Messages
        if (isset ($statusMsg['error'])) {
            $param.= '?emsg=' . base64_encode ($statusMsg ['error']);
            $urlSep = '&';
        }

        if (isset ($statusMsg['success'])) {
            $param.= $urlSep . 'smsg=' . base64_encode ($statusMsg ['success']);
        }

        //Other than login page and no user authenticated redirect him Moved to api service

        switch ($uriString) {
            case 'login' :
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
                }
                break;

            default:
                if ($uriString != 'login' && $authenticated == 'false') {

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

        //Dont check it as its having redirect param q= , it was already checked else it will be indefinite loop
        if (( $hostAddress[1] == 'login' && isset ($params['q']) ) || $this->isWPInternalFunction () || $hostAddress[1] == 'registration' ||
            strstr ($hostAddress[1], 'wp-login.php')) {
            $isWordpress = true;
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
        return preg_match ('/wp-admin/i', $_SERVER["REQUEST_URI"]);
    }

    /**
     * Force Wordpress Login for single sign on
     * @param string $subdomain
     */
    function forceWordpressLogin ($subDomain)
    {

        $sessionData = $this::$bidxSession[$subDomain];

        if ($sessionData != null && property_exists ($sessionData, 'authenticated') &&
            $sessionData->authenticated == 'true') {
            $groupName = $subDomain;
            $roles = $sessionData->data->roles;

            if (in_array ('GroupAdmin', $roles)) {
                $userName = $groupName . 'groupadmin';
            } else if (in_array ('GroupOwner', $roles)) {
                $userName = $groupName . 'groupowner';
            } else {
                $userName = $groupName . 'groupmember';
            }

            if ($user_id = username_exists ($userName)) {   //just do an update
                // userdata will contain all information about the user
                $userdata = get_userdata ($user_id);
                $user = wp_set_current_user ($user_id, $userName);
                // this will actually make the user authenticated as soon as the cookie is in the browser
                wp_set_auth_cookie ($user_id);

                // the wp_login action is used by a lot of plugins, just decide if you need it
                do_action ('wp_login', $userdata->ID);
                // you can redirect the authenticated user to the "logged-in-page", define('MY_PROFILE_PAGE',1); f.e. first
            }
        }
        return;
    }

    /**
     * Authenticate the user using the username and password with Bidx Data.
     *
     * @param String $username
     * @param String $password
     * @return Loggedin User
     */
    function call_bidx_service ($urlservice, $body, $method = 'POST', $is_form_upload = false)
    {

        $authUsername = 'bidx'; // Bidx Auth login
        $authPassword = 'gobidx'; // Bidx Auth password
        $bidxMethod = strtoupper ($method);
        $bidx_get_params = "";
        $cookie_string = "";
        $sendDomain = 'bidx.net';
        $cookieArr = array ();

        /*         * *********1. Retrieve Bidx Cookies and send back to api to check ******* */
        $cookieInfo = $_COOKIE;
        foreach ($_COOKIE as $cookieKey => $cookieValue) {
            if (preg_match ("/^bidx/i", $cookieKey)) {
                $cookieArr[] = new WP_Http_Cookie (array ('name' => $cookieKey, 'value' => urlencode ($cookieValue), 'domain' => $sendDomain));
            }
        }

        /*         * *********2. Set Headers ******************************** */
        //For Authentication
        $headers['Authorization'] = 'Basic ' . base64_encode ("$authUsername:$authPassword");

        // 2.1 Is Form Upload
        if ($is_form_upload) {
            $headers['Content-Type'] = 'multipart/form-data';
        }

        // 2.2 Set the group domain header
        if (isset ($body['domain'])) {
            //Talk with arjan for domain on first page registration it will be blank when it goes live
            $headers['X-Bidx-Group-Domain'] = ($urlservice == 'groups' && $bidxMethod == 'POST') ? 'beta' : $body['domain'];
            //$bidx_get_params.= '&groupDomain=' . $body['domain'];
        }

        /*         * ********* 3. Decide method to use************** */
        if ($bidxMethod == 'GET') {
            $bidx_get_params = ($body) ? '&' . http_build_query ($body) : '';
            $body = NULL;
        }


        /*         * *********** 4. WP Http Request ******************************* */


        $url = API_URL . $urlservice . '?csrf=false' . $bidx_get_params;



        $request = new WP_Http;
        $result = $request->request ($url, array ('method' => $bidxMethod,
          'body' => $body,
          'headers' => $headers,
          'cookies' => $cookieArr
            ));

        /*         * *********** 5. Set Cookies if Exist ************************* */
        $cookies = $result['cookies'];
        if (count ($cookies)) {
            foreach ($cookies as $bidxAuthCookie) {
                $cookieDomain = (DOMAIN_CURRENT_SITE == 'bidx.dev') ? 'bidx.dev' : $bidxAuthCookie->domain;
                setcookie ($bidxAuthCookie->name, $bidxAuthCookie->value, $bidxAuthCookie->expires, $bidxAuthCookie->path, $cookieDomain, FALSE, $bidxAuthCookie->httponly);
            }
        }

        return $result;
    }

    static function clear_bidx_cookies ()
    {

        /*         * *********Retrieve Bidx Cookies and send back to api to check ******* */
        $cookieInfo = $_COOKIE;
        foreach ($_COOKIE as $cookieKey => $cookieValue) {
            if (preg_match ("/^bidx/i", $cookieKey)) {
                setcookie ($cookieKey, ' ', time () - YEAR_IN_SECONDS, ADMIN_COOKIE_PATH, COOKIE_DOMAIN);
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
            if (eregi ("^www$", $hostAddress [0])) {
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

}

?>
