<?php

/**
 * API bridge abstract class for handling bidX API interaction
 *
 * @author Altaf Samnani
 * @version 1.0
 */
abstract class APIbridge
{

    private $logger;


    public  $isRedirectCheck = true;

    /**
     * Logger is instantiated in the constructor.
     */
    public function __construct ()
    {
        $this->logger = Logger::getLogger (__CLASS__);
    }

    /**
     * Calls the bidx service and get the response
     *
     * @param string $urlService Name of service
     * @param array $body Parameters to be sended
     * @param string $method Type of Method [GET|POST|PUT|DELETE]
     * @param boolean $isFormUpload  is it form upload
     * @return array $requestData response from Bidx API
     */
    public function callBidxAPI ($urlService, $body, $method = 'POST', $isFormUpload = false, $do_not_reuse = false)
    {

        $bidxMethod     = strtoupper ($method);
        $bidxGetParams  = "";
        $sendDomain     = DOMAIN_CURRENT_SITE;
        $cookieHeader   = '';
        $cookieArr      = array ();
        $headers        = array ();
        $bidxWPerror    = NULL;
        $groupDomain    = $this->getBidxSubdomain ();

        // 1. Retrieve Bidx Cookies and send back to api to check
        if ($do_not_reuse) {
        	$cookieArr[] = array();
        } else {
	        $cookieInfo = $_COOKIE;
	        foreach ($_COOKIE as $cookieKey => $cookieValue)
	        {
	            if (preg_match ("/^".BIDX_ALLOWED_COOKIES."/i", $cookieKey))
	            {
	                $cookieArr[] = new WP_Http_Cookie (array ('name' => $cookieKey, 'value' => urlencode ($cookieValue), 'domain' => $sendDomain));
	                //$cookieHeader = $cookieKey . '=' . $cookieValue. '; ';
	            }
	        }
        }

//        if(!empty( $cookieHeader))
//        {
//            $cookies_header     = substr( $cookies_header, 0, -2 );
//            $headers['cookie']  = $cookies_header;
//        }
        // 2. Set Headers
        // 2.1 Is Form Upload
        if ($isFormUpload)
        {
            $headers['Content-Type'] = 'multipart/form-data';
        }

        // 2.2 Set the group domain header
        if ($groupDomain)
        {
            $headers['X-Bidx-Group-Domain'] = $groupDomain;
        }

        // 3. Decide method to use
        if ($bidxMethod == 'GET')
        {
            $bidxGetParams = ($body) ? '?' . http_build_query ($body) : '';
            $body = NULL;
        }

        // 4. WP Http Request
        $url = API_URL . $urlService . $bidxGetParams;

        $this->logger->trace (sprintf ('Calling API URL: %s Method: %s Body: %s Headers: %s Cookies: %s', $url, $method, $body, var_export ($headers, true), var_export ($cookieArr, true)));

        //$request = new WP_Http;
        $result = wp_remote_request ($url, array ('method' => $bidxMethod,
          'body' => $body,
          'headers' => $headers,
          'cookies' => $cookieArr,
          'timeout' => apply_filters ('http_request_timeout', 60)
        ));

        $this->logger->trace (sprintf ('Response for API URL: %s Response: %s', $url, var_export ($result, true)));

        // 5. Set Cookies if Exist
        if (is_array ($result))
        {
            if (isset ($result['cookies']) && count ($result['cookies']))
            {
                $cookies = $result['cookies'];
                foreach ($cookies as $bidxAuthCookie)
                {
                    if (!empty ($bidxAuthCookie->name) && $bidxAuthCookie->name && preg_match ("/^".BIDX_ALLOWED_COOKIES."/i", $bidxAuthCookie->name))
                    {

                        ob_start (); // To avoid error headers already sent in apibridge setcookie
                        setrawcookie ($bidxAuthCookie->name, urlencode($bidxAuthCookie->value), $bidxAuthCookie->expires, $bidxAuthCookie->path, $sendDomain, FALSE, $bidxAuthCookie->httponly);
                        ob_end_flush ();
                    }
                }
            }
        } else
        { // Wp Request timeout
            $bidxWPerror = $result;
            $result = array ();
            $result['response']['code'] = 'timeout';
        }
        $requestData = $this->processResponse ($urlService, $result, $groupDomain, $bidxWPerror);
        // Now start outputting to avoid headers already sent error for setcookie

        return $requestData;
    }

    /**
     * Process Bidx Api Response
     *
     * FIXME in case of stdClass the magic methods must be added ??
     *
     * @param string $urlService  Name of service
     * @param array $requestData response from Bidx API
     * @return array $requestData response from Bidx API
     */
    public function processResponse ($urlService, $result, $groupDomain, $bidxWPerror = NULL)
    {

        $this->logger->debug ($result);

        $requestData = (isset ($result['body'])) ? json_decode ($result['body']) : new stdClass();

        $httpCode = $result['response']['code'];
        $redirectUrl = NULL;

        // Add Domain
        $requestData->bidxGroupDomain = $groupDomain;

        /* Return if Super admin, so that after previewing the app page admin doest gets logs out */
        /*if (is_super_admin ()) {

            $requestData->status = 'ERROR';
            $requestData->authenticated = 'false';
            $requestData->text = 'I am super admin, you idiot';
            return $requestData;
        }*/

        // Check the Http response and decide the status of request whether its error or ok

        if ($httpCode >= 200 && $httpCode < 300)
        {
            //Keep the real status
            //$requestData->status = 'OK';
            $requestData->authenticated = 'true';
        }
        else if ($httpCode >= 300 && $httpCode < 400)
        {
            $requestData->status = 'ERROR';
            $requestData->authenticated = 'true';
        }
        else if ($httpCode == 401)
        {
            $requestData->status = 'ERROR';
            $requestData->authenticated = 'false';
            //$this->bidxRedirectLogin($groupDomain);
            wp_clear_auth_cookie ();
            $this->clear_wp_bidx_session ();
            $this->clear_bidx_cookies();
            $this->logger->trace (sprintf ('Authentication Failed for URL: %s ', $urlService));

            if ($urlService != 'session' && $this->isRedirectCheck) {

                $statusText = ($requestData->code == 'illegalRequest') ? $requestData->text : NULL;

                $this->bidxRedirectLogin ($groupDomain, $statusText);
            }
        }
        else if ($httpCode == 500)
        {
        	//registering as an incorrect response to avoid caching
        	$requestData->status = 'ERROR';
        }
        else if ($httpCode == 'timeout')
        {
            $requestData->status = 'ERROR';
            $errors = $bidxWPerror->get_error_messages ();
            $error = implode (', ', $errors);
            $requestData->text .= $error;
            $this->clear_wp_bidx_session ();
        }
        return $requestData;
    }

    function clear_wp_bidx_session ()
    {
        // This clears the full session, except for any post-login redirect setting.
        BidxCommon::clearWpBidxSession();
    }

    function clear_bidx_cookies ()
    {

        /***********Retrieve Bidx Cookies and send back to api to check ******* */
        $cookieInfo = $_COOKIE;
        foreach ($_COOKIE as $cookieKey => $cookieValue)
        {
            if (preg_match ("/^".BIDX_ALLOWED_COOKIES."/i", $cookieKey))
            {
                setcookie ($cookieKey, ' ', time () - YEAR_IN_SECONDS, '/', DOMAIN_CURRENT_SITE);
            }
        }
    }

    /**
     * Grab the subdomain portion of the URL. If there is no sub-domain, the root
     * domain is passed back. By default, this function *returns* the value as a
     * string.
     *
     * @param bool $echo optional parameter prints the response directly to
     * the screen.
     */
    function getBidxSubdomain ($echo = false, $url = false)
    {


    	if ( defined( 'ORIGINAL_DOMAIN' ) ) {

    		$httpHost = ORIGINAL_DOMAIN;
    	} else {

    		$httpHost = ($url) ? str_replace(array("http://", "https://"),"",$url) : $_SERVER ["HTTP_HOST"];
    	}

        $hostAddress = explode ('.', $httpHost);

        if (is_array ($hostAddress))
        {
            if ($echo == false)
            {
                return ( $hostAddress [0] );
            }
            else
            {
                echo ( $hostAddress [0] );
            }
        }
        else
        {
            return ( false );
        }
    }

    /**
     * Bidx login redirect for Not Logged in users
     *
     * @param String $username
     * @param String $password
     * @return Loggedin User
     */
    function bidxRedirectLogin ($groupDomain,$statusText)
    {
        $requestUri = $_SERVER['REQUEST_URI'];
        $uri        = explode('/', $requestUri);
        $lang       = '';

        if ( strlen($uri[1]) == 2 )   // /fr /es
        {
            $lang = '/'.$uri[1];
        }

        $http           = (is_ssl ()) ? 'https://' : 'http://';
        $current_url    = $http . $_SERVER['HTTP_HOST'] . $requestUri ;

        //If its illegal request like group is not backend that it sends back group missing with illegal request, so to know that error using edmsg
        //To genuine session expire using emsg=1
        $statusText     = ($statusText) ? '&edmsg='.base64_encode($statusText) : '&emsg=1';

        $redirect_url   = $http . $groupDomain . '.' . DOMAIN_CURRENT_SITE . $lang. '/auth?q=' . base64_encode ($current_url) .$statusText ;

        header ("Location: " . $redirect_url);

        exit;
    }

    /**
     * Access to logger
     */
    public function getLogger ()
    {
        return $this->logger;
    }

}

?>
