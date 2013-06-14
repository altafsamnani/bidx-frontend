<?php

/**
 * API bridge abstract class for handling bidX API interaction
 *
 * @author Altaf Samnani
 * @version 1.0
 */
abstract class APIbridge
{

    static $data_re_use = array ();
    // Bidx Auth login
    private $authUsername = 'bidx';
    // Bidx Auth password
    private $authPassword = 'gobidx';
    private $logger;
    public $isRedirectCheck = true;

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

        $bidxMethod = strtoupper ($method);
        $bidx_get_params = "";
        $cookie_string = "";
        $sendDomain = 'bidx.net';
        $cookieArr = array ();
        $bidxWPerror = NULL;
        $groupDomain = $this->getBidxSubdomain ();

        // 1. Retrieve Bidx Cookies and send back to api to check
        $cookieInfo = $_COOKIE;
        foreach ($_COOKIE as $cookieKey => $cookieValue) {
            if (preg_match ("/^bidx/i", $cookieKey)) {
                $cookieArr[] = new WP_Http_Cookie (array ('name' => $cookieKey, 'value' => urlencode ($cookieValue), 'domain' => $sendDomain));
            }
        }

        // 2. Set Headers
        // 2.1 For Authentication
        $headers['Authorization'] = 'Basic ' . base64_encode ("$this->authUsername:$this->authPassword");

        // 2.1 Is Form Upload
        if ($isFormUpload) {
            $headers['Content-Type'] = 'multipart/form-data';
        }

        // 2.2 Set the group domain header
        if ($groupDomain) {
            //Talk with arjan for domain on first page registration it will be blank when it goes live
            $noDomain = ( DOMAIN_CURRENT_SITE == 'bidx.net' ) ? 'www' : 'beta';
            $headers['X-Bidx-Group-Domain'] = ( $urlService == 'groups' && $bidxMethod == 'POST' ) ? $noDomain : $groupDomain;
            //$bidx_get_params.= '&bidxGroupDomain=' . $body['domain'];
        }

        // 3. Decide method to use
        if ($bidxMethod == 'GET') {
            $bidx_get_params = ($body) ? '&' . http_build_query ($body) : '';
            $body = NULL;
        }

        // 4. WP Http Request
        $url = API_URL . $urlService . '?csrf=false' . $bidx_get_params;

        $this->logger->trace (sprintf ('Calling API URL: %s Method: %s Body: %s Headers: %s Cookies: %s', $url, $method, $body, var_export ($headers, true), var_export ($cookieArr, true)));

        //$request = new WP_Http;
        $result = wp_remote_request ($url, array ('method' => $bidxMethod,
          'body' => $body,
          'headers' => $headers,
          'cookies' => $cookieArr
            ));

        $this->logger->trace (sprintf ('Response for API URL: %s Response: %s', $url, var_export ($result, true)));

        // 5. Set Cookies if Exist
        if (is_array ($result)) {
            
            if (isset($result['cookies']) && count ($result['cookies'])) {
                $cookies = $result['cookies'];
                foreach ($cookies as $bidxAuthCookie) {
                    if(isset($bidxAuthCookie->name)) {
                    $cookieDomain = ( DOMAIN_CURRENT_SITE == 'bidx.dev' ) ? 'bidx.dev' : $bidxAuthCookie->domain;
                    setcookie ($bidxAuthCookie->name, $bidxAuthCookie->value, $bidxAuthCookie->expires, $bidxAuthCookie->path, $cookieDomain, FALSE, $bidxAuthCookie->httponly);
                    }
                }
            }
        } else { // Wp Request timeout
            $bidxWPerror = $result;
            $result = array ();
            $result['response']['code'] = 'timeout';
        }
        $requestData = $this->processResponse ($urlService, $result, $groupDomain, $bidxWPerror);

        return $requestData;
    }

    /**
     * Process Bidx Api Response
     *
     * @param string $urlService  Name of service
     * @param array $requestData response from Bidx API
     * @return array $requestData response from Bidx API
     */
    public function processResponse ($urlService, $result, $groupDomain, $bidxWPerror = NULL)
    {

        $this->logger->debug ($result);

        if (isset ($result['body'])) {
            $requestData = json_decode ($result['body']);

            $httpCode = $result['response']['code'];
            $redirectUrl = NULL;

            // Add Domain
            $requestData->bidxGroupDomain = $groupDomain;

            // Check the Http response and decide the status of request whether its error or ok
            if ($httpCode >= 200 && $httpCode < 300) {
                //Keep the real status
                //$requestData->status = 'OK';
                $requestData->authenticated = 'true';
            } else if ($httpCode >= 300 && $httpCode < 400) {
                $requestData->status = 'ERROR';
                $requestData->authenticated = 'true';
            } else if ($httpCode == 401) {
                $requestData->status = 'ERROR';
                $requestData->authenticated = 'false';
                //$this->bidxRedirectLogin($groupDomain);
                do_action ('clear_auth_cookie');
                $this->logger->trace (sprintf ('Authentication Failed for URL: %s ', $urlService));

                if ($urlService != 'session' && $this->isRedirectCheck) {
                    $this->bidxRedirectLogin ($groupDomain);
                }
            } else if ($httpCode == 'timeout') {
                $requestData->status = 'ERROR';
                $errors = $bidxWPerror->get_error_messages ();
                foreach ($errors as $error) {
                    echo $error; //this is just an example and generally not a good idea, you should implement means of processing the errors further down the track and using WP's error/message hooks to display them
                }
                $requestData->text .= $error;
            }
            return $requestData;
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
    function getBidxSubdomain ($echo = false)
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
     * Bidx login redirect for Not Logged in users
     *
     * @param String $username
     * @param String $password
     * @return Loggedin User
     */
    function bidxRedirectLogin ($groupDomain)
    {
        //wp_clear_auth_cookie();
        $http = (is_ssl ()) ? 'https://' : 'http://';
        $current_url = $http . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

        $redirect_url = $http . $groupDomain . '.' . DOMAIN_CURRENT_SITE . '/login?q=' . base64_encode ($current_url) . '&emsg=' . base64_encode ('Your session expired. Please login again, sorry for any inconvenience and appreciate your patience.');

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
