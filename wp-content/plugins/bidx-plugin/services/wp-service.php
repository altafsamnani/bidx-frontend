<?php
/*  Author: Altaf Samnani
 */

//backwords compatability with php < 5 for htmlspecialchars_decode
if (!function_exists ('htmlspecialchars_decode')) {

    function htmlspecialchars_decode ($text)
    {
        return strtr ($text, array_flip (get_html_translation_table (HTML_SPECIALCHARS)));
    }

}
/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * Check the Bidx Session
 *
 * @param String $username
 * @param String $password
 * @url http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_mailer&protocol=get&type=session&groupDomain=sampoerna&activate=334343
 *
 * @return Loggedin User
 */

add_action ('wp_ajax_bidx_mailer', 'bidx_mailer');
add_action ('wp_ajax_nopriv_bidx_mailer', 'bidx_mailer');

function bidx_mailer ()
{
    $pre_data = bidx_wordpress_pre_action ('mailer');
    $params = $pre_data['params'];

    $result = call_bidx_service ($params['type'], $params['data'], $params['protocol']);

    echo "Write  your code here";
    echo "<pre>";
    print_r ($result);
    echo "</pre>";
    exit;

    $requestData = bidx_wordpress_post_action ('mailer', $result, $params['data']);



    return;
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

function bidx_redirect_login ($groupDomain)
{
    wp_clear_auth_cookie ();

    $requestUri = $_SERVER['REQUEST_URI'];
    $uri        = explode('/', $requestUri);
    $lang       = '';

    if ( strlen($uri[1]) == 2 )   // /fr /es
    {
        $lang = '/'.$uri[1];
    }

    $http = (is_ssl ()) ? 'https://' : 'http://';
    $current_url = $http . $_SERVER['HTTP_HOST'] . $requestUri;
    $redirect_url = $http . $groupDomain . '.' . DOMAIN_CURRENT_SITE . $lang . '/auth?q=' . base64_encode ($current_url) . '&emsg=1';

    header ("Location: $redirect_url");
}

/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * Check the Bidx Session
 *
 * @param String $username
 * @param String $password
 *
 * @return Loggedin User
 */

/*function bidx_login_session ()
{

    $body['domain'] = get_bidx_subdomain ();

    $get_redirect = ($_GET['q']) ? $_GET['q'] : NULL;

    //Assumed if redirect in Get means session is already checked and is asking for uname/pass and then redirect
    if ($get_redirect == NULL) {

        $result = call_bidx_service ('session', $body, $method = 'GET');

        $requestData = bidx_wordpress_post_action ('sessionactive', $result, $body);

        // If Bidx Session and Wp Session is there then redirect else clear the wp cache
        if ($requestData->redirect && is_user_logged_in ()) {
            wp_redirect ($requestData->redirect);
        } else {
            bidx_signout ();
            wp_clear_auth_cookie ();
        }
    }

    return;
}*/

/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * Authenticate the user using the username and password with Bidx Data.
 *
 * @param String $username
 * @param String $password
 *
 * @return Loggedin User
 */

function call_bidx_service ($urlservice, $body, $method = 'POST', $formType = false)
{
    $logger          = Logger::getLogger ("Bidx Service Login");
    $bidxMethod      = strtoupper ($method);
    $bidxGetParams   = "";
    $sendDomain      = DOMAIN_CURRENT_SITE;
    $cookieArr       = array ();
    $headers         = array ();
    $cookieHeader    = '';
    $cookieInfo      = $_COOKIE;

    /*****1. Retrieve Bidx Cookies and send back to api to check ******/
    foreach ($_COOKIE as $cookieKey => $cookieValue)
    {
        if (preg_match ("/^".BIDX_ALLOWED_COOKIES."/i", $cookieKey))
        {
            $cookieArr[]  = new WP_Http_Cookie (array ('name' => $cookieKey, 'value' => urlencode ($cookieValue), 'domain' => $sendDomain));
           // $cookieHeader = $cookieKey . '=' . $cookieValue. '; ';

        }
    }

//    if(!empty( $cookieHeader))
//    {
//        $cookies_header     = substr( $cookies_header, 0, -2 );
//        $headers['cookie']  = $cookies_header;
//    }

    /***********2. Set Headers ********************/
    // 2.1 Set the group domain header
    if (isset ($body['domain'])) {
        $headers['X-Bidx-Group-Domain'] = $body['domain'];
    }

    // 2.2 Is Form Upload
    switch ($formType) {
        case 'upload':
            $headers['Content-Type'] = 'multipart/form-data';
            break;
        case 'json':
            $headers['Content-Type'] = 'application/json';
            $body = $body['data'];
            break;
        default:
            break;
    }

    /*********** 3. Decide method to use************/
    if ($bidxMethod == 'GET') {
        $bidxGetParams = ($body) ? '&' . http_build_query ($body) : '';
        $body = NULL;
    }


    /************* 4. WP Http Request **************/
    $url = API_URL . $urlservice . '?csrf=false' . $bidxGetParams;

    $logger->trace (sprintf ('Calling API URL: %s Method: %s Body: %s Headers: %s Cookies: %s', $url, $bidxMethod, var_export ($body, true), var_export ($headers, true), var_export ($cookieArr, true)));


    $request = new WP_Http;
    $result = $request->request ($url, array ('method' => $bidxMethod,
      'body' => $body,
      'headers' => $headers,
      'cookies' => $cookieArr,
      'timeout' => apply_filters ('http_request_timeout', 60)
    ));
    $logger->trace (sprintf ('Response for API URL: %s Response: %s', $url, var_export ($result, true)));

    /************* 5. Set Cookies if Exist **************************/
    if (is_array ($result)) {
        if (isset ($result['cookies']) && count ($result['cookies'])) {
            $cookies = $result['cookies'];
            foreach ($cookies as $bidxAuthCookie)
            {
                if (preg_match ("/^".BIDX_ALLOWED_COOKIES."/i", $bidxAuthCookie->name))
                {
                    setrawcookie ($bidxAuthCookie->name, urlencode($bidxAuthCookie->value), $bidxAuthCookie->expires, $bidxAuthCookie->path, $sendDomain, FALSE, $bidxAuthCookie->httponly);
                    $_COOKIE[$bidxAuthCookie->name] = urlencode($bidxAuthCookie->value);

                    $competitionCookieVals = array('expires'  => $bidxAuthCookie->expires,
                                                   'path'     => $bidxAuthCookie->path,
                                                   'domain'   => $sendDomain,
                                                   'httpOnly' => $bidxAuthCookie->httponly);
                }
            }

            if($urlservice == 'session' && $bidxMethod == 'POST') {
                bidx_skipso_competition ( $competitionCookieVals );
            }
        }
    } else { // Wp Request timeout
        $bidxWPerror = $result;
        $result = array ();
        $result['error'] = $bidxWPerror;
        $result['response']['code'] = 'timeout';
    }

    return $result;
}

/**
 * Check is there competition and if exists then set cookie so we can call logout for skipso
 *
 * @param Array $entities bidx response as array
 * @return String Injects js variables
 */
function bidx_skipso_competition ( $competitionCookieVals )
{
    if (!isset ($_COOKIE['bidx-skipso-competition'])) {
        $isCompetition = get_option ('skipso-competition');
        $cookieName    = 'bidx-skipso-competition';
        $cookieVal     = 1;
        if ($isCompetition) {
            setcookie ($cookieName, $cookieVal, $competitionCookieVals['expires'], $competitionCookieVals['path'], $competitionCookieVals['domain'], FALSE, $competitionCookieVals['httpOnly']);
            $_COOKIE[$cookieName] = $cookieVal;
        }
    }

    return;
}

/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * Authenticate the user using the username and password with Bidx Data.
 *
 * @param String $username
 * @param String $password
 *
 * @return Loggedin User
 */
//add_action ('wp_authenticate', 'ajax_submit_signin');
add_action ('wp_ajax_nopriv_bidx_signin', 'ajax_submit_signin');

function ajax_submit_signin ()
{
    //require_once('./wp-includes/registration.php');

    global $error;

    //Get the group name from  Subdomain
    $groupName = get_bidx_subdomain ();
    $username = (isset ($_POST['log'])) ? $_POST['log'] : NULL;
    $password = (isset ($_POST['pwd'])) ? $_POST['pwd'] : NULL;

    if ($username && $password) {
        $body = array (
          'username' => $username,
          'password' => $password,
          'domain' => $groupName
        );

        //Check if Username and password and User logged in is
        if ($username && $password) {
            // Check external bidx check for username and password credentials
            $url = 'session';
            //$url = 'http://test.bidx.net/api/v1/session?csrf=false&groupKey='.$groupName;
            //Flush Bidx Sessions/Cookies before login
            clear_bidx_cookies ();
            //wp_clear_auth_cookie ();
            clear_wp_bidx_session ();

            $result = call_bidx_service ($url, $body);



            // Clear all cookie and session before we process
            //3 Check validation error and include redirect logic
            $requestData = bidx_wordpress_post_action ($url, $result, $body);

            $is_ajax = isset ($_SERVER['HTTP_X_REQUESTED_WITH']) AND
                strtolower ($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

            if ($is_ajax) {
                $jsonData = json_encode ($requestData);
                echo $jsonData;
                die (); // stop executing script
            } else {

                if ($requestData->status == 'ERROR') {
                    $error = "<strong>ERROR:</STRONG>" . $requestData->text;
                } else {

                    $text = ($requestData->redirect) ? wp_redirect ($requestData->redirect) : 'Something wrong happened';
                    $error = "<strong>ERROR:</STRONG>" . $text;
                }
            }
        }
    }
}

/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * Logged out the user from Bidx too
 *
 * @param String $username
 * @param String $password
 *
 * @url Frontend http://sampoerna.local.bidx.net/wp-admin/admin-ajax.php?action=bidx_signout&provider=skipso
  Backend  http://sampoerna.local.bidx.net/wp-admin/admin-ajax.php?action=bidx_signout&provider=skipso
  Judge    http://sampoerna.local.bidx.net/wp-admin/admin-ajax.php?action=bidx_signout&provider=skipso
 *
 * @return Loggedin User
 */
add_action ('wp_logout', 'bidx_signout');
add_action ('wp_ajax_bidx_signout', 'bidx_signout');
add_action ('wp_ajax_nopriv_bidx_signout', 'bidx_signout');

function bidx_signout ()
{
    $provider = (isset ($_GET['provider'])) ? $_GET['provider'] : NULL;

    //Logout Bidx Session too
    $sessionData = BidxCommon::$staticSession;
    $skipsoUrl = NULL;

    $current_user = wp_get_current_user ();
    if( !empty ( $currentUser->roles ) )
    {
        if (in_array (WP_OWNER_ROLE, $currentUser->roles) || in_array (WP_ADMIN_ROLE, $currentUser->roles)) {
            $skipsoUrl = 'skipso-backend-logout';
        }
    }

    clear_bidx_cookies ();
    $params['domain'] = get_bidx_subdomain ();
    call_bidx_service ('session', $params, 'DELETE');
    wp_clear_auth_cookie ();
    clear_wp_bidx_session ();

    if ($provider || isset ($_COOKIE['bidx-skipso-competition'])) {
        callProviderLogoutURL ();
    }
}

function callProviderLogoutURL ()
{
    $logoutSiteOption    = 'skipso-frontend-logout';
    $logoutBackendOption = 'skipso-backend-logout';
    $logoutPrivateOption = 'skipso-judge-logout';

    $frontendLogout = get_option ($logoutSiteOption);
    $backendLogout  = get_option ($logoutBackendOption);
    $privateLogout  = get_option ($logoutPrivateOption);

    $frontendLogout = (!$frontendLogout) ? get_site_option ($logoutSiteOption) : $frontendLogout;
    $backendLogout  = (!$backendLogout) ? get_site_option ($logoutBackendOption) : $backendLogout;
    $privateLogout  = (!$privateLogout) ? get_site_option ($logoutPrivateOption) : $privateLogout;

    echo '
        <script type="text/javascript" src="/wp-includes/js/jquery/jquery.js?ver=1.10.2"></script>
        <script type="text/javascript" src="/wp-content/themes/bidx-group-template/assets/noty/jquery.noty.js?ver=2.0.3"></script>
        <script type="text/javascript" src="/wp-content/themes/bidx-group-template/assets/noty/layouts/top.js?ver=2.0.3"></script>
        <script type="text/javascript" src="/wp-content/themes/bidx-group-template/assets/noty/layouts/center.js?ver=2.0.3"></script>
        <script type="text/javascript" src="/wp-content/themes/bidx-group-template/assets/noty/themes/default.js?ver=2.0.3"></script>
        ';
    echo '<iframe id="frontendLogout" src="' . $frontendLogout . '" width="0" height="0"></iframe>';
    echo '<iframe id="backendLogout" src="' . $backendLogout . '" width="0" height="0"></iframe>';
    echo '<iframe id="privateLogout" src="' . $privateLogout . '" width="0" height="0"></iframe>';
    echo '<script type="text/javascript">
            var loadCounter = 0;
            jQuery(function() {
              var n = noty({ type: "success",text:"Please wait while we log you out"} );
              var loadIFrame = function(skipsoType) {
                loadCounter = loadCounter + 1;
                /* Redirect once all three logout iframes are loaded */
                if(loadCounter == 3) {
                  window.location.replace("' . home_url () . '");
                }
              }
              jQuery("#frontendLogout").load(function(){
                 loadIFrame("front");
              })
              jQuery("#backendLogout").load(function(){
                 loadIFrame("backend");
              })
              jQuery("#privateLogout").load(function(){
                 loadIFrame("private");
              })
            });
        </script>';
    exit;
}

function clear_bidx_cookies ()
{

    /*     * *********Retrieve Bidx Cookies and send back to api to check ******* */
    $cookieInfo = $_COOKIE;
    foreach ($_COOKIE as $cookieKey => $cookieValue) {
        if (preg_match ("/^".BIDX_ALLOWED_COOKIES."/i", $cookieKey))
        {
            setcookie ($cookieKey, ' ', time () - YEAR_IN_SECONDS, '/', DOMAIN_CURRENT_SITE);
        }
    }
}

/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * String Translate API for Frontend
 * ********* i18n **************
 *  1) For all data
 *  http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_translation&type=i18n&print=true
 *  2) For App i18n.xml data
 *  http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_translation&type=i18n&context=company&print=true
 *  3) For Global i18.xml data
 *  http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_translation&type=i18n&context=__global&print=true
 *
 * ********* Static **************
 *  1) For all data
 *  http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_translation&type=static&print=true
 *  2) For Particular category data
 *  http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_translation&type=static&statictype=documentType&print=true
 *
 *
 */

add_action ('wp_ajax_bidx_translation', 'get_string_translation');
add_action ('wp_ajax_nopriv_bidx_translation', 'get_string_translation');

function get_string_translation ()
{
    $type = (isset ($_GET['type'])) ? $_GET['type'] : NULL;
    $print = (isset ($_GET['print'])) ? $_GET['print'] : NULL;
    switch ($type) {

        case 'i18n' :

            $context = (isset ($_GET['context'])) ? $_GET['context'] : NULL;

            $translatedArr = array ();
            if ($context == '__global') {
                $fileArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/{i18n.xml}', GLOB_BRACE);
            } else {
                if ($context) {
                    $fileArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/apps/*{' . $context . '}/{i18n.xml}', GLOB_BRACE);
                } else {
                    $i18PluginArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/apps/*{' . $context . '}/{i18n.xml}', GLOB_BRACE);
                    $i18GlobalArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/{i18n.xml}', GLOB_BRACE);
                    $fileArr = array_merge ($i18GlobalArr, $i18PluginArr);
                }
            }

            foreach ($fileArr as $fileName) {


                $dirArr = (preg_match ("/apps\/(.*)\/i18n.xml/i", $fileName, $matches));
                $body['app'] = (isset ($matches[1])) ? $matches[1] : '__global';

                $document = simplexml_load_file ($fileName);
                $items = $document->xpath ('//Item');

                $translatedArr[$body['app']] = other_wordpress_post_action ('translatei18n', $items, $body);
            }

            break;

        case 'static' :

            $siteLocale = get_locale ();
            $staticDataObj = new StaticDataService();
            $transientKey = 'static' . $siteLocale; // Transient key for Static Data
            $transientStaticData = get_transient ($transientKey);
            $transientStaticData = false;
            /* If no value then set the site local transient */
            if ($transientStaticData === false) {
                $resultStaticData = $staticDataObj->getStaticData (NULL);
                $staticDataVars = $resultStaticData->data;
                $transientStaticData = $staticDataObj->getMultilingualStaticData ($staticDataVars);
                set_transient ($transientKey, $transientStaticData, 60 * 5); //Second*Min*Hour
            }

            if (isset ($_GET['statictype'])) {
                $translatedArr[$_GET['statictype']] = $transientStaticData[$_GET['statictype']];
            } else {
                $translatedArr = $transientStaticData;
            }

            break;
    }

    if ($print) {
        echo "<pre>";
        print_r ($translatedArr);
        echo "</pre>";
        exit;
    } else {
        $callback = (isset ($_GET['callback'])) ? $_GET['callback'] : NULL;
        $jsonStart = ($callback) ? $callback . '( ' : NULL;

        $jsonDecodedData = json_encode ($translatedArr);
        $jsonEnd = ($callback) ? ' );' : NULL;
        Header('content-type: application/javascript');
        echo $jsonStart . $jsonDecodedData . $jsonEnd;
    }

    exit;
}

// Author: msp
// Date: 26-11-2013
// Get news in a json representation
//
add_action ('wp_ajax_bidx_news', 'get_wp_news');

function get_wp_news ()
{
    // setting default query arguments
    // check "http://codex.wordpress.org/Class_Reference/WP_Query#Order_.26_Orderby_Parameters" for defaults on sorting
    //
    $limit = ( isset ($_GET['limit']) ) ? $_GET['limit'] : 5;
    $offset = ( isset ($_GET['offset']) ) ? $_GET['offset'] : 1;
    $order = ( isset ($_GET['order']) ) ? $_GET['order'] : "desc";
    $orderby = ( isset ($_GET['sort']) ) ? $_GET['sort'] : "date";

    // prepare the result array
    //
    $result = array (
      "status" => "OK"
      , "languageCode" => "en"
      , "data" => Array ()
    );

    // set the query arguments
    //
    $postType = (get_option ('group-news')) ? 'news':'post';

    $args = array (
      'post_type' => $postType
      , 'post_status' => 'publish'
      , 'posts_per_page' => $limit
      , 'order' => $order
      , 'paged' => $offset
    );

    $my_query = null;
    $my_query = new WP_Query ($args);

    // set return values
    //
    $result["data"]["totalNews"] = intval ($my_query->found_posts);
    $result["data"]["news"] = array ();

    if ($my_query->have_posts ()) {

        // iterate the posts
        //
        foreach ($my_query->posts as $post) {
            // decide not to encode the content because I think json_encode will take care of this
            //
            $content = $post->post_content;

            // add post data to result
            //
            $result["data"]["news"][] = array (
              "postId" => $post->ID
              , "date" => $post->post_date
              , "title" => $post->post_title
              , "content" => wp_trim_words ($content, $num_words = 100, $more = null)
              , "url" => get_permalink ($post->ID)
              , "featuredImage" => wp_get_attachment_url (get_post_thumbnail_id ($post->ID))
            );
        }
    }
    // clear wp query
    //
    wp_reset_query ();

    // echo converted result into json
    //
    echo json_encode ($result);

    // do not remove exit, it will add unwanted output after the json value
    //
    exit;
}

/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * Create the Po file from settings->Bidx
 * http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_createpo
 * //wp-content/plugins/wpml-string-translation/inc/functions.php Changes file for phtml files scanning
 *
 */

add_action ('wp_ajax_bidx_createpo', 'create_bidx_po');

function create_bidx_po ()
{
    if (is_super_admin ()) {
        //$pre_data = bidx_wordpress_pre_action ('staticpo');
        // $params = $pre_data['params'];
        $lang = (isset ($_GET['lang'])) ? $_GET['lang'] : NULL;
        //force some filters
        $type = (isset ($_GET['type'])) ? $_GET['type'] : NULL;
        switch ($type) {

            case 'static' :
                $result = call_bidx_service ('staticdata', NULL, 'GET');
                $requestData = bidx_wordpress_post_action ('staticpo', $result, $_GET);
                $po = $requestData->po;

                break;
            case 'module' :
                $pathName = $_GET['path'];
                $language = (isset ($body['lang'])) ? $body['lang'] : 'Original';
                $po = '# Language ' . $language . PHP_EOL;


                $body = $_GET;
                $i18AppsArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/{apps,admin}/*/{i18n.xml}', GLOB_BRACE);
                $i18PluginArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/{i18n.xml}', GLOB_BRACE);

                $fileArr = array_merge ($i18AppsArr, $i18PluginArr);

                foreach ($fileArr as $fileName) {

                    $body['is_app'] = (preg_match ("/(apps|admin)/i", $fileName)) ? true : false;

                    $dirArr = (preg_match ("/(apps|admin)\/(.*)\/i18n.xml/i", $fileName, $matches));
                    $body['app'] = (isset ($matches[2])) ? $matches[2] : NULL;

                    $document = simplexml_load_file ($fileName);
                    $items = $document->xpath ('//Item');

                    $po .= other_wordpress_post_action ('pocreate', $items, $body);
                }
                break;
            case 'bidxplugin' :
                global $pluginStrings;

                $pluginPath         = WP_CONTENT_DIR.'/plugins/bidx-plugin';
                bidx_st_scan_plugin_files ($pluginPath); // Plugin

                $themePath          = WP_CONTENT_DIR.'/themes/bidx-group';
                bidx_st_scan_plugin_files ($themePath); // Group Theme

                $competitionPath    = WP_CONTENT_DIR.'/plugins/bidx-competition-plugin';
                bidx_st_scan_plugin_files ($competitionPath); // Group Theme

                $po = plugin_theme_po_action ($pluginStrings, $_GET);

                break;

            case 'bidxtheme' :
            case 'bidxgrouptheme':
                $plugin = $_GET['path'];
                global $pluginStrings;
                bidx_st_scan_plugin_files ($plugin);
                $po = plugin_theme_po_action ($pluginStrings, $_GET);

                break;
        }

        if ($lang) {
            $popot = 'po';
            $poname = $lang . '_' . strtoupper ($lang);
        } else {
            $popot = 'pot';
            $poname = 'bidx';
        }


        header ("Content-Type: application/force-download");
        header ("Content-Type: application/octet-stream");
        header ("Content-Type: application/download");
        header ("Content-Disposition: attachment; filename=" . $poname . '.' . $popot . ";");
        header ("Content-Length: " . strlen ($po));
        echo $po;
        exit (0);
    } else {
        die ('Nice Try!');
    }
}

function bidx_st_scan_plugin_files ($plugin)
{
    require_once WP_PLUGIN_DIR . '/sitepress-multilingual-cms/inc/potx.php';
    static $recursion, $scanned_files = array ();
    static $scan_stats = false;

    $dh = opendir ($plugin);
    while (false !== ($file = readdir ($dh))) {
        if (0 === strpos ($file, '.'))
            continue;
        if (is_dir ($plugin . "/" . $file)) {
            $recursion++;
            $scan_stats .= str_repeat ("\t", $recursion - 1) . sprintf (__ ('Opening folder: %s', 'wpml-string-translation'), "/" . $file) . PHP_EOL;
            $pluginStrings = bidx_st_scan_plugin_files ($plugin . "/" . $file, $recursion);
            $recursion--;
        } elseif (preg_match ('#(\.php|\.inc|\.phtml)$#i', $file)) {
            $scan_stats .= str_repeat ("\t", $recursion) . sprintf (__ ('Scanning file: %s', 'wpml-string-translation'), "/" . $file) . PHP_EOL;
            $scanned_files[] = "/" . $file;
            _potx_process_file ($plugin . "/" . $file, 0, '__bidx_scan_plugin_files_results', '_potx_save_version', POTX_API_7);
        } else {
            $scan_stats .= str_repeat ("\t", $recursion) . sprintf (__ ('Skipping file: %s', 'wpml-string-translation'), "/" . $file) . PHP_EOL;
        }
    }

    $scan_stats .= __('Done scanning files', 'wpml-string-translation') . PHP_EOL;
}

function __bidx_scan_plugin_files_results ($string, $domain, $_gettext_context, $file, $line)
{
    global $pluginStrings;
    $textDomain = $_GET['type'];

    if ($domain == $textDomain) {
        $return->value = $string;
        $return->domain = $domain;
        $return->key = $_gettext_context;
        $return->file = $file;
        $return->line = $line;
        $pluginStrings[] = $return;
        return $return;
    }
}

function plugin_theme_po_action ($displayData, $body)
{

    $language = (isset ($body['lang'])) ? $body['lang'] : 'Original';
    $po = '# Language ' . $language . PHP_EOL;
    $count = 1;
    $validate = array ();

    foreach ($displayData as $dataId) {
        $msgId = $dataId->value;
        $msgStr = (isset ($body['lang'])) ? $body['lang'] . $msgId : '';
        $msgCtxt = $dataId->key;

        if ($msgCtxt) {
            $_tag = '# _x("<!--msgId-->", "<!--msgcTxt-->","' . $body['type'] . '");';
            $_x = true;
            $valCTxt = $msgCtxt;
        } else {
            $_tag = '# _e("<!--msgId-->","' . $body['type'] . '");';
            $_x = false;
            $valCTxt = 'nocontext';
        }


        $tag = str_replace ('<!--msgId-->', $msgId, $_tag);
        $tag = str_replace ('<!--msgcTxt-->', $msgCtxt, $tag);
        $po .= PHP_EOL . '#' . $count . ') File -' . $dataId->file . ' -' . $dataId->line . PHP_EOL;
        $po .= $tag . PHP_EOL;
        $po .= '# Context ' . $msgCtxt . ' Textdomain ' . $dataId->domain . PHP_EOL;

        if (!isset ($validate[$valCTxt][$msgId])) {

            $po .= ($_x) ? 'msgctxt "' . str_replace ('"', '\"', $msgCtxt) . '"' . PHP_EOL : '';
            $po .= 'msgid "' . $msgId . '"' . PHP_EOL;
            $po .= 'msgstr "' . $msgStr . '"' . PHP_EOL;
            $po .= PHP_EOL;
            $validate[$valCTxt][$msgId] = true;
        } else {
            $po .= '# Already exists, doesnt need translation.' . PHP_EOL . PHP_EOL;
        }

        $count++;
    }

    return $po;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Check Bidx Service Response
 *
 * @param bool $echo
 */
function other_wordpress_post_action ($url, $result, $body)
{
    switch ($url) {
        case 'pocreate' :
            $count = 1;
            $po = '';

            if ($body['is_app']) {
                $_tag = '# _x("<!--msgId-->", "<!--msgcTxt-->","i18n");';
                $_x = true;
            } else {
                $_tag = '# _e("<!--msgId-->", "i18n");';
                $_x = false;
            }

            foreach ($result as $xmlObj) {
                $msgId = $xmlObj->__toString ();
                $arr = $xmlObj->attributes ();
                //$msgcTxt = $arr['value'];
                $msgCTxt = $body['app'];
                $msgStr = (isset ($body['lang'])) ? $body['lang'] . $msgId : '';
                $tag = str_replace ('<!--msgId-->', $msgId, $_tag);
                $tag = str_replace ('<!--msgcTxt-->', $msgCTxt, $tag);
                $po .= $tag . PHP_EOL;
                $po .= '# Context ' . $msgCTxt . ' TextDomain i18n' . PHP_EOL;
                $po .= ($_x) ? 'msgctxt "' . str_replace ('"', '\"', $msgCTxt) . '"' . PHP_EOL : '';
                $po .= 'msgid "' . str_replace ('"', '\"', $msgId) . '"' . PHP_EOL;
                $po .= 'msgstr "' . str_replace ('"', '\"', $msgStr) . '"' . PHP_EOL;
                $po .= PHP_EOL;

                $count++;
            }
            return $po;
            break;

        case 'translatei18n' :
            $count      = 0;
            $appName    = $body['app'];
            $i18nData   = array ();
            foreach ($result as $xmlObj) {
                $i18nData[$count]   = new stdClass();
                $arr                = $xmlObj->attributes ();
                $xmlLabel           = $xmlObj->__toString ();

                if ($appName == '__global') {
                    $label = __ ($xmlLabel, 'i18n');
                } else {
                    $label = _x ($xmlLabel, $appName, 'i18n');
                }

                $i18nData[$count]->value = $arr['value']->__toString ();


                $i18nData[$count]->label = utf8_encode ( $label );

                $count++;
            }
            return $i18nData;

            break;
    }
    exit;
}

/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * Flush the bidx Wordpress PHP Session Variables
 * http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_clearwpsession
 *
 */
add_action ('wp_ajax_nopriv_bidx_clearwpsession', 'clear_wp_bidx_session'); // ajax for logged in users
add_action ('wp_ajax_bidx_clearwpsession', 'clear_wp_bidx_session');

function clear_wp_bidx_session ()
{

    /* Clear the Session */
    // if (isset ($_COOKIE['session_id'])) {
    //session_id ($_COOKIE['session_id']);
    session_start ();
    session_destroy ();
    // setcookie ('session_id', ' ', time () - YEAR_IN_SECONDS, '/', 'bidx.net');
    // }
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
function get_bidx_subdomain ($echo = false)
{
    $hostAddress = explode ('.', $_SERVER ["HTTP_HOST"]);
    if (is_array ($hostAddress)) {
        if (preg_match ("/www/", $hostAddress [0])) {
            $passBack = 1;
        } else {
            $passBack = 0;
        }
        if ($echo == false) {
            return ($hostAddress [$passBack]);
        } else {
            echo ($hostAddress [$passBack]);
        }
    } else {
        return (false);
    }
}

//hopefully grays stuff out.
function bidx_warning ()
{
    echo '<strong style="color:red;">Any changes made below WILL NOT be preserved when you login again. You have to change your personal information per instructions found in the <a href="../wp-login.php">login box</a>.</strong>';
}

//disables the (useless) password reset option in WP when this plugin is enabled.
function bidx_show_password_fields ()
{
    return 0;
}

/*
 * Disable functions.  Idea taken from http auth plugin.
 */

function disable_function_register ()
{
    $errors = new WP_Error();
    $errors->add ('registerdisabled', __ ('User registration is not available from this site, so you can\'t create an account or retrieve your password from here. See the message above.'));
    ?></form><br /><div id="login_error">User registration is not available from this site, so you can't create an account or retrieve your password from here. See the message above.</div>
    <p id="backtoblog"><a href="<?php bloginfo ('url'); ?>/" title="<?php _e ('Are you lost?') ?>"><?php printf (__ ('&larr; Back to %s'), get_bloginfo ('title', 'display')); ?></a></p>
    <?php
    exit ();
}

function disable_function ()
{
    $errors = new WP_Error();
    $errors->add ('registerdisabled', __ ('User registration is not available from this site, so you can\'t create an account or retrieve your password from here. See the message above.'));
    login_header (__ ('Log In'), '', $errors);
    ?>
    <p id="backtoblog"><a href="<?php bloginfo ('url'); ?>/" title="<?php _e ('Are you lost?') ?>"><?php printf (__ ('&larr; Back to %s'), get_bloginfo ('title', 'display')); ?></a></p>
    <?php
    exit ();
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Check Bidx Get Redirect
 *
 * @param bool $echo
 */
function get_redirect ($url, $requestData, $domain = NULL)
{
    $redirectUrl = NULL;
    $redirect = NULL;
    /****** If have a particular Redirect in params *************** */
    if (isset ($_POST['redirect_to'])) {
        $redirect_to = $_POST['redirect_to'];
        $redirect = base64_decode ($redirect_to);
    }

    // check if a user specifc Redirect is set in the userPreference
    //
    if (isset ($requestData->data->bidxMemberProfile->userPreferences->firstLoginUrl) && isset ($requestData->data->bidxMemberProfile->userPreferences->firstLoginGroup)) {

        $groupName      = $requestData->data->bidxMemberProfile->userPreferences->firstLoginGroup;
        $firstLogin     = $requestData->data->bidxMemberProfile->userPreferences->firstLoginUrl;
        // added bidx_wp_content function to handle preferences

        $redirect = '//' . $groupName . '.' . DOMAIN_CURRENT_SITE . '/' . $firstLogin;

    }

    /*     * ***** Decide on Redirect/Submit Logic ********** */
    switch ($url) {
        case 'sessionactive':
        case 'session':
           /* Language redirection is handled now in  login.js */
           /* global $sitepress;
            if ( isset( $sitepress) ) {
            	$currentLanguage    =   $sitepress->get_current_language();
            } else {
				$currentLanguage    =   'en';
			}
            $redirectLang           =   ($currentLanguage != 'en') ? '/'.$currentLanguage : '/';
            $redirect               =   ($redirect) ? $redirect : $redirectLang;*/
            $requestData->redirect  =   $redirect;

            break;

        case 'groups':

            $requestData->data->id = $requestData->data->group->id;
            $requestData->data->domain = $requestData->data->group->domain;
            $http = (is_ssl ()) ? 'https://' : 'http://';
            $requestData->submit = $http . $domain . '/registration/';
            break;
    }
    return $requestData;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Add timeout for Bidx Services
 *
 * @param bool $echo
 */
add_filter ('http_request_timeout', 'bidx_request_timeout_time');

function bidx_request_timeout_time ($val)
{
    return 60;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Check Bidx Service Response
 *
 * @param bool $echo
 */
function bidx_wordpress_post_action ($url, $result, $body)
{

    $requestData = (isset ($result['body'])) ? json_decode ($result['body']) : new stdClass();
    $httpCode = $result['response']['code'];
    $groupName = (isset ($body['domain'])) ? $body['domain'] : NULL;
    $redirectUrl = NULL;

    /*     * ***Check the Http response and decide the status of request whether its error or ok * */

    if ($httpCode >= 200 && $httpCode < 300) {
        //Keep the real status
        //$requestData->status = 'ERROR';
    } else if ($httpCode >= 300 && $httpCode < 400) {
        $requestData->status = 'ERROR';
    } else if ($httpCode == 401) {
        $requestData->status = 'ERROR';
        //If user not logged in and its not ajax call then redirect him to the login screen
        $is_ajax = isset ($_SERVER['HTTP_X_REQUESTED_WITH']) AND
            strtolower ($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

        if (!$is_ajax) {
            ($url != 'session' || $url != 'sessionactive') ? bidx_redirect_login ($groupName) : '';
        }
    } else if ($httpCode == 'timeout') {
        $requestData->status = 'ERROR';
        $bidxWPerror = $result['error'];
        $errors = $bidxWPerror->get_error_messages ();

        $error = implode (', ', $errors);

        $requestData->text .= $error;
        //$this->clear_wp_bidx_session ();
    } else {
        $requestData->status = 'ERROR';
    }

    //Write logic what If error and what if its ok (ex Redirect)
    switch ($url) {

        case 'sessionactive' :
            if ($requestData->status != 'ERROR' && isset ($requestData->data)) {
                $requestData = get_redirect ($url, $requestData);
            }
            break;
        case 'session' :

            $username = NULL;
            // If we get data in return
            if ($requestData->status != 'ERROR' && isset ($requestData->data)) {    //create/update wp account from external database if login/pw exact match exists in that db
                $process = TRUE;
                $displayData = $requestData->data;
                //check role and assign logged in wp username if present.

                if ($requestData->code == 'userLoggedIn') {
                    //Default Role is anonymous
                    $username = $groupName . WP_ANONYMOUS_ROLE;

                    if (!empty ($displayData->roles)) {
                        $roleArray = $displayData->roles;
                        $bidxLoginPriority = explode ('|', BIDX_LOGIN_PRIORITY);
                        if (in_array ($bidxLoginPriority[0], $roleArray)) {
                            $username = 'admin';
                        } else if (in_array ($bidxLoginPriority[1], $roleArray)) {
                            $username = $groupName . WP_OWNER_ROLE;
                        } else if (in_array ($bidxLoginPriority[2], $roleArray)) {
                            $username = $groupName . WP_ADMIN_ROLE;
                        } else if (in_array ($bidxLoginPriority[3], $roleArray)) {
                            $username = $groupName . WP_MEMBER_ROLE;
                        }
                    }
                } else {
                    $requestData->status = 'ERROR';
                    $requestData->text = 'You do not have permissions to log in.';
                    $process = FALSE;
                }

                //only continue, if login/pw is valid AND, if used, proper role perms
                if ($process) {
                    //echo $username;exit;
                    //looks asdlike wp functions clean up data before entry, so I'm not going to try to clean out fields beforehand.
                    if ($user_id = username_exists ($username)) {   //just do an update
                        // userdata will contain all information about the user
                        $userdata = get_userdata ($user_id);
                        $user = wp_set_current_user ($user_id, $username);
                        // this will actually make the user authenticated as soon as the cookie is in the browser
                        //wp_set_auth_cookie ($user_id);

                        // the wp_login action is used by a lot of plugins, just decide if you need it
                        do_action ('wp_login', $userdata->ID);
                        // you can redirect the authenticated user to the "logged-in-page", define('MY_PROFILE_PAGE',1); f.e. first
                        // $requestData = get_redirect($url, $requestData);
                    }
                }

                $requestData = get_redirect ($url, $requestData, $groupName);
            }
            else if($requestData->status == 'ERROR' && !$requestData->text) {
                $requestData->text = 'Something went wrong while logging you in, please try again';
            }

            break;

        case 'groups' :

            //Delete the wordpress group site if Bidx says its Error
            global $current_site;
            $site_id = $body['response']['site_id'];
            $user_id = $body['response']['user_id'];
            if (strtolower ($requestData->status) == 'error') {
                //Delete Wordpress Site
                if ($site_id != '0' && $site_id != $current_site->blog_id) {
                    wpmu_delete_blog ($site_id, true);
                }
                //Delete Wordpress User
                if ($user_id != '0' && $user_id != '1') {
                    wpmu_delete_user ($user_id);
                }
            } else {
                $requestData = get_redirect ($url, $requestData, $body['response']['domain']);
            }
            break;

        case 'staticpo':
            $displayData = $requestData->data;
            $language = (isset ($body['lang'])) ? $body['lang'] : 'Original';
            $po = '# Language ' . $language . PHP_EOL;
            $count = 1;
            $validate = array ();

            foreach ($displayData as $dataKey => $dataValue) {

                $po .= PHP_EOL . '#' . $count . ' ' . $dataKey . PHP_EOL;

                foreach ($dataValue as $dataId) {


                    $msgId = str_replace ('"', '\"', $dataId->value);
                    $msgStr = (isset ($body['lang'])) ? $body['lang'] . $msgId : '';
                    $msgCtxt = str_replace ('"', '\"', $dataId->key);
                    $po .= '#  _x("' . $msgId . '", "' . $msgCtxt . '", ' . '"static");' . PHP_EOL;
                    $po .= '# Context ' . $msgCtxt . ' Textdomain static' . PHP_EOL;

                    if (!isset ($validate[$msgCtxt][$msgId])) {
                        $po .= 'msgctxt "' . $msgCtxt . '"' . PHP_EOL;
                        $po .= 'msgid "' . $msgId . '"' . PHP_EOL;
                        $po .= 'msgstr "' . $msgStr . '"' . PHP_EOL;
                        $po .= PHP_EOL;
                        $validate[$msgCtxt][$msgId] = true;
                    } else {
                        $po .= '# Already exists, doesnt need translation.' . PHP_EOL . PHP_EOL;
                    }
                }
                $count++;
            }
            $requestData->po = $po;

            break;
        default :
    }
    return $requestData;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Create Wordpress Site for Bidx Group
 *
 * @param bool $echo
 */
function create_bidx_wp_site ($groupName, $email)
{
    global $wpdb, $current_site;

    $status = 'ok';
    $groupName = str_replace (" ", "", strtolower ($groupName));
    //if (preg_match('|^([a-zA-Z0-9-])+$|', $groupName))
    // $groupName = str_replace(" ","",strtolower($groupName));

    $newdomain = $groupName . '.' . preg_replace ('|^www\.|', '', $current_site->domain);
    $path = $current_site->path;

    $password = 'bidxGeeks9';
    //$user_id = email_exists($email);
    $userName = $groupName;

    $user_id = wpmu_create_user ($userName, $password, $email);
    if (false == $user_id) {
        //wp_die(__('There was an error creating the user.'));
        $status = 'error';
        $text = 'here was an error creating the user.';
    } else {
        $wpdb->hide_errors ();
        $id = wpmu_create_blog ($newdomain, $path, $groupName, $user_id, array ('public' => 1), $current_site->id);
        $wpdb->show_errors ();
        if (!is_wp_error ($id)) {
            if (!get_user_option ('primary_blog', $user_id)) {
                update_user_option ($user_id, 'primary_blog', $id, true);
            }
            $content_mail = sprintf (__ ('New site created by %1$s

Address: %2$s
Name: %3$s'), $userName, get_site_url ($id), stripslashes ($groupName));
            //wp_mail(get_site_option('admin_email'), sprintf(__('[%s] New Site Created'), $current_site->site_name), $content_mail, 'From: "Site Admin" <' . get_site_option('admin_email') . '>');
            //wp_mail ('info@bidnetwork.org', sprintf (__ ('[%s] New Site Created'), $current_site->site_name), $content_mail, 'From: "Site Admin" <' . get_site_option ('admin_email') . '>');

            $text = 'New website created';
        } else {
            //wp_die($id->get_error_message());
            $status = 'error';
            $text = $id->get_error_message ();
        }
    }

    $siteCreation = array ('status' => $status,
      'text' => $text,
      'site_id' => $id,
      'user_id' => $user_id,
      'domain' => $newdomain,
      'subdomain' => $groupName);
    return $siteCreation;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Create Wordpress Site for Bidx Group
 * [id] => 1    [domain] => bidx.dev    [path] => /    [blog_id] => 1    [cookie_domain] => bidx.dev    [site_name] => Bidx Sites
 * http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_delete
 *
 * @param bool $echo
 */
add_action ('wp_ajax_nopriv_bidx_delete', 'bidx_delete_wp_pages'); // ajax for logged in users
add_action ('wp_ajax_bidx_delete', 'bidx_delete_wp_pages');

function bidx_delete_wp_pages ()
{
    global $wpdb;
    set_time_limit (120);
    $pageTitle = array ('Login');

    $blogs = $wpdb->get_col ("SELECT blog_id FROM {$wpdb->blogs} WHERE site_id = {$wpdb->siteid} AND spam = 0");
    if ($blogs)
    {
        foreach ($blogs as $blog_id) {
            switch_to_blog ($blog_id);
            delete_bidx_plugin ($pageTitle); //silently deactivate the plugin
            restore_current_blog ();
        }
    ?><div id="message" class="updated fade"><p><span style="color:#FF3300;"><?php echo implode (', ', $pageTitle); ?></span><?php echo ' has been MASS Deleted.'; ?></p></div><?php
    }
    else
    {
    ?><div class="error"><p><?php echo 'Failed to mass deactivate: error selecting blogs'; ?></p></div><?php
    }
}

function delete_bidx_plugin ($pageTitle)
{
    foreach ($pageTitle as $pageValue) {
        $page = get_page_by_title ($pageValue);
        wp_delete_post ($page->ID, true);
    }

    return;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Create Wordpress Site for Bidx Group
 * [id] => 1    [domain] => bidx.dev    [path] => /    [blog_id] => 1    [cookie_domain] => bidx.dev    [site_name] => Bidx Sites
 * http://local.bidx.net/wp-admin/admin-ajax.php?action=local_create&print=true
 *
 * @param bool $echo
 */
//

add_action ('wp_ajax_local_create', 'create_wp_site_from_local');
add_action ('wp_ajax_nopriv_local_create', 'create_wp_site_from_local'); // ajax for logged in users

function create_wp_site_from_local ($groupName, $email)
{
    if ((DOMAIN_CURRENT_SITE == 'local.bidx.net')) {
        global $wpdb;

        $status = 'ok';
        $id = '';
        $print = $_GET['print'];
        $domain = $_SERVER['HTTP_HOST'];
        $groupDomainArr = array ('cambridge-angels', 'sampoerna', 'shell', 'burundi-fruits');

        $roleArr = array ('', WP_ADMIN_ROLE, WP_OWNER_ROLE, WP_MEMBER_ROLE, WP_ANONYMOUS_ROLE);

        $blogUrl = strtolower (get_site_url ());
        $blog_title = BidxCommon::get_bidx_subdomain (false, $blogUrl);

        //Delete the Sites and users if exist
        foreach ($groupDomainArr as $groupName) {
            $site_id = $body['response']['site_id'];
            $user_id = $body['response']['user_id'];
            //Delete Wordpress Site
            $blogUrl = $groupName . '.' . $domain;
            $site_id = get_blog_id_from_url ($blogUrl);

            if ($site_id) {
                wpmu_delete_blog ($site_id, true);
                $siteDelete[$groupName]['site_id'] = $site_id;
            }
            //Delete Users if exist
            foreach ($roleArr as $roleVal) {
                $userName = $groupName . $roleVal;
                $user = get_userdatabylogin ($userName);
                $user_id = $user->ID; // prints the id of the user
                //Delete Wordpress User
                if ($user_id) {
                    wpmu_delete_user ($user_id);
                    $siteDelete[$groupName][$userName] = $user_id;
                }
            }
        }

        //Insert site and users
        foreach ($groupDomainArr as $groupName) {
            if ($groupName) {
                $groupName = str_replace (" ", "", strtolower ($groupName));
                $email = $groupName . '@bidx.net';
                //if (preg_match('|^([a-zA-Z0-9-])+$|', $groupName))
                // $groupName = str_replace(" ","",strtolower($groupName));

                $newdomain = $groupName . '.' . preg_replace ('|^www\.|', '', $domain);
                $password = 'bidxGeeks9';
                $userName = $groupName;

                $user_id = wpmu_create_user ($userName, $password, $email);
                if (false == $user_id) {
                    //wp_die(__('There was an error creating the user.'));
                    $status = 'error';
                    $text = 'here was an error creating the user or user already exists.';
                } else {
                    $wpdb->hide_errors ();

                    $id = wpmu_create_blog ($newdomain, '/', $groupName, $user_id, array ('public' => 1), '1');
                    $wpdb->show_errors ();
                    if (!is_wp_error ($id)) {
                        if (!get_user_option ('primary_blog', $user_id)) {
                            update_user_option ($user_id, 'primary_blog', $id, true);
                        }
                        $content_mail = sprintf (__ ('New site created by %1$s

Address: %2$s
Name: %3$s'), $userName, get_site_url ($id), stripslashes ($groupName));
                        //wp_mail(get_site_option('admin_email'), sprintf(__('[%s] New Site Created'), $current_site->site_name), $content_mail, 'From: "Site Admin" <' . get_site_option('admin_email') . '>');
                        wp_mail ('altaf.samnani@bidnetwork.org', sprintf (__ ('[%s] New Site Created from Backend'), 'Bidx Sites'), $content_mail, 'From: "Site Admin" <' . get_site_option ('admin_email') . '>');

                        $text = 'New website created';
                    } else {
                        //wp_die($id->get_error_message());
                        $status = 'error';
                        $text = $id->get_error_message ();
                    }
                }
            } else {
                $status = 'error';
                $text = 'Trying to fool me, He He :D.';
            }

            $siteCreation[$groupName] = array ('status' => $status,
              'text' => $text,
              'site_id' => $id,
              'user_id' => $user_id,
              'domain' => $newdomain,
              'subdomain' => $groupName);
        }
        if ($print) {
            echo '<pre>Site Deleted<br>';
            print_r ($siteDelete);
            echo '<br>Site Created<br>';
            print_r ($siteCreation);
            echo '</pre>';
        } else {
            $site['delete'] = $siteDelete;
            $site['create'] = $siteCreation;
            echo json_encode ($site);
        }
        exit;
    }
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Create Wordpress Site for Bidx Group
 * [id] => 1    [domain] => bidx.dev    [path] => /    [blog_id] => 1    [cookie_domain] => bidx.dev    [site_name] => Bidx Sites
 * http://bidx.net/wp-admin/admin-ajax.php?action=bidx_create&domain=hello&code=slowHorse01
 *
 * @param bool $echo
 */
//

add_action ('wp_ajax_bidx_create', 'create_wp_site_from_bidx');
add_action ('wp_ajax_nopriv_bidx_create', 'create_wp_site_from_bidx'); // ajax for logged in users

function create_wp_site_from_bidx ($groupName, $email)
{
    global $wpdb;

    $status = 'ok';
    $groupName = $_GET['domain'];
    $email = $groupName . '@bidx.net';
    $getCode = $_GET['code'];
    $id = '';
    $domain = $_SERVER['HTTP_HOST'];

    $code = 'slowHorse01';

    if ($code == $getCode && $groupName) {
        $groupName = str_replace (" ", "", strtolower ($groupName));
        //if (preg_match('|^([a-zA-Z0-9-])+$|', $groupName))
        // $groupName = str_replace(" ","",strtolower($groupName));

        $newdomain = $groupName . '.' . preg_replace ('|^www\.|', '', $domain);


        $password = 'bidxGeeks9';
        //$user_id = email_exists($email);
        $userName = $groupName;

        $user_id = wpmu_create_user ($userName, $password, $email);
        if (false == $user_id) {
            //wp_die(__('There was an error creating the user.'));
            $status = 'error';
            $text = 'here was an error creating the user or user already exists.';
        } else {
            $wpdb->hide_errors ();

            $id = wpmu_create_blog ($newdomain, '/', $groupName, $user_id, array ('public' => 1), '1');
            $wpdb->show_errors ();
            if (!is_wp_error ($id)) {
                if (!get_user_option ('primary_blog', $user_id)) {
                    update_user_option ($user_id, 'primary_blog', $id, true);
                }
                $content_mail = sprintf (__ ('New site created by %1$s

Address: %2$s
Name: %3$s'), $userName, get_site_url ($id), stripslashes ($groupName));
                //wp_mail(get_site_option('admin_email'), sprintf(__('[%s] New Site Created'), $current_site->site_name), $content_mail, 'From: "Site Admin" <' . get_site_option('admin_email') . '>');
                wp_mail ('altaf.samnani@bidnetwork.org', sprintf (__ ('[%s] New Site Created from Backend'), 'Bidx Sites'), $content_mail, 'From: "Site Admin" <' . get_site_option ('admin_email') . '>');

                $text = 'New website created';
            } else {
                //wp_die($id->get_error_message());
                $status = 'error';
                $text = $id->get_error_message ();
            }
        }
    } else {
        $status = 'error';
        $text = 'Trying to fool me, He He :D.';
    }

    $siteCreation = array ('status' => $status,
      'text' => $text,
      'site_id' => $id,
      'user_id' => $user_id,
      'domain' => $newdomain,
      'subdomain' => $groupName);
    echo json_encode ($siteCreation);
    exit;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Registratin Ajax Call
 *
 * @param String $url
 */
function bidx_wordpress_pre_action ($url = 'default', $file_values = NULL)
{

    $params = $_POST;

    switch ($url) {

        case 'groups' :
            $params['name'] = $_POST['groupName'];

            //Create Wordpress group.bidx.net website
            $wp_site = create_bidx_wp_site ($params['name'], $params['username']);
            $response = array ('status' => $wp_site['status'],
              'text' => $wp_site['text'],
              'site_id' => $wp_site['site_id'],
              'user_id' => $wp_site['user_id'],
              'domain' => $wp_site['domain']
            );
            $params['domain'] = $wp_site['subdomain'];

            break;

        case 'mailer' :
            $get_data = $_GET;
            $response['status'] = 'ok';
            $params['protocol'] = $get_data['protocol'];
            $params['type'] = $get_data['type'];
            $get_data['domain'] = $get_data['groupDomain'];
            unset ($get_data['protocol']);
            unset ($get_data['type']);
            unset ($get_data['groupDomain']);
            unset ($get_data['action']);
            $params['data'] = $get_data;
            break;

        case 'entitygroup' :
            $response['status'] = 'ok';
            $params['bidxEntityType'] = 'bidxBusinessGroup';
            $params['businessGroupName'] = 'true';
            $params['bidxEntityId'] = $params['groupProfileId'];
            break;

        case 'entityprofile':
            $response['status'] = 'ok';
            $params['bidxEntityType'] = 'bidxMemberProfile';
            $params['isMember'] = 'true';
            $params['bidxEntityId'] = $params['creatorProfileId'];
            break;

        case 'memberprofilepicture':
            $response['status'] = 'ok';
            $id = $params['memberProfileId'];
            $domain = $params['domain'];
            unset ($params);

            $params['path'] = '/personalDetails/profilePicture';
            $params['purpose'] = 'profilePicture';

            $params['fileContent'] = "@" . $file_values["tmp_name"] . ';filename=' . $file_values["name"] . ';type=' . $file_values["type"];

            $params['id'] = $id;
            $params['domain'] = $domain;
            break;

        case 'memberprofileattachment':
            $response['status'] = 'ok';
            $id = $params['memberProfileId'];
            $domain = $params['domain'];
            unset ($params);

            $params['path'] = '/personalDetails/attachment';
            $params['purpose'] = '';

            $params['fileContent'] = "@" . $file_values["tmp_name"] . ';filename=' . $file_values["name"] . ';type=' . $file_values["type"];

            $params['id'] = $id;
            $params['domain'] = $domain;
            break;

        case 'entrepreneurprofilecv':
            $response['status'] = 'ok';
            $id = $params['entrepreneurProfileId'];
            $domain = $params['domain'];
            unset ($params);

            $params['path'] = '/cv';
            $params['purpose'] = 'CV';

            $params['fileContent'] = "@" . $file_values["tmp_name"] . ';filename=' . $file_values["name"] . ';type=' . $file_values["type"];

            $params['id'] = $id;
            $params['domain'] = $domain;
            break;

        case 'entrepreneurprofileattachment':
            $response['status'] = 'ok';
            $id = $params['entrepreneurProfileId'];
            $domain = $params['domain'];
            unset ($params);

            $params['path'] = '/attachment';
            $params['purpose'] = '';

            $params['fileContent'] = "@" . $file_values["tmp_name"] . ';filename=' . $file_values["name"] . ';type=' . $file_values["type"];

            $params['id'] = $id;
            $params['domain'] = $domain;
            break;

        case 'investorprofileattachment':
            $response['status'] = 'ok';
            $id = $params['investorProfileId'];
            $domain = $params['domain'];
            unset ($params);

            $params['path'] = '/attachment';
            $params['purpose'] = '';

            $params['fileContent'] = "@" . $file_values["tmp_name"] . ';filename=' . $file_values["name"] . ';type=' . $file_values["type"];

            $params['id'] = $id;
            $params['domain'] = $domain;
            break;

        case 'companylogo':
            $response['status'] = 'ok';
            $id = $params['companyProfileId'];
            $domain = $params['domain'];
            unset ($params);

            $params['path'] = '/logo';
            $params['purpose'] = 'Logo';

            $params['fileContent'] = "@" . $file_values["tmp_name"] . ';filename=' . $file_values["name"] . ';type=' . $file_values["type"];

            $params['id'] = $id;
            $params['domain'] = $domain;
            break;


        case 'logo' :
            $response['status'] = 'ok';
            $id = $params['groupProfileId'];
            $domain = $params['domain'];
            unset ($params);
            $params['path'] = '/logo';
            $params['purpose'] = 'logo';

            //$params['fileContent'] = $file_values;
            $params['fileContent'] = "@" . $file_values["tmp_name"] . ';filename=' . $file_values["name"] . ';type=' . $file_values["type"];
            // $params['fileContent'] = "@/home/altaf/Desktop/dirk_heuff.png;filename=dirk_heuff;type=image/png'";
            //';filename='.$file_values["name"].';name='.$file_values["name"].';type='.$file_values["type"];
            //.';empty=false;originalFilename='.$file_values["name"].';size='.$file_values["size"].';contentType='.$file_values["type"];
            //Altaftest
            $params['id'] = $id;
            $params['domain'] = $domain;
            break;

        case 'staff_email':
            $params['subject'] = 'New group ' . $params['groupName'] . ' has been created';

            $body = "Dear Staff, <br/><br/> New group <strong>" . $params['groupName'] . "</strong> is requested by <strong>" . $params['username'] . "</strong> from country <strong>" . $params['country'] . "</strong><br/><br/>";
            $body.= 'Email     -' . $params['username'] . '<br/>';
            $body.= 'GroupName -' . $params['groupName'] . '<br/>';
            $body.= 'Country   -' . $params['country'] . '<br/><br/>';
            $body.= 'Regards<br>Bidx Dev Team';
            $params['body'] = $body;

        default:
            $response['status'] = 'ok';
            break;
    }

    //Unset this variables this doesnt need to be send
    unset ($params['apiurl']);
    unset ($params['apimethod']);

    //Replace dynamice dynname to name as it is created thrugh form.js on fly as a hidden field so js doesnt accept name=name
    if (isset ($params['dynname'])) {
        $params['name'] = $params['dynname'];
        unset ($params['dynname']);
    }

    $data['params'] = $params;
    $data['response'] = $response;
    return $data;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Registratin Ajax Call
 *
 * @param bool $echo
 */
add_action ('wp_ajax_nopriv_bidx_request', 'ajax_submit_action'); // ajax for logged in users

function ajax_submit_action ()
{

    $url = (isset ($_POST['apiurl'])) ? $_POST['apiurl'] : NULL;
    $method = (isset ($_POST['apimethod'])) ? $_POST['apimethod'] : NULL;

    //1 Do wordpress stuff and get the params
    $body = bidx_wordpress_pre_action ($url);

    if ($body['response']['status'] == 'ok') {

        //2 Talk to Bidx Api and get the response
        $params = $body['params'];
        $result = call_bidx_service ($url, $params, $method);

        //3 Check validation error and include redirect logic
        $requestData = bidx_wordpress_post_action ($url, $result, $body);
    } else {
        $requestData->status = $body['response']['status'];
        $requestData->text = $body['response']['text'];
    }

    $jsonData = json_encode ($requestData);
    echo $jsonData;

    die (); // stop executing script
}

function bidx_register_response ($requestEntityMember, $requestEntityGroup, $requestGroupData)
{

    $requestData = new stdClass();

    if ($requestEntityMember->status == 'ERROR') {
        $requestData = $requestEntityMember;
    } else if ($requestEntityGroup->status == 'ERROR') {
        $requestData = $requestEntityGroup;
    } else if ($requestGroupData->status == 'ERROR') {
        $requestData = $requestGroupData;
    } else {

        $username_wp = $_POST['businessGroupName'] . WP_ADMIN_ROLE;
        force_wordpress_login ($username_wp);
        $requestData->status = 'OK';
        $requestData->submit = '/member';
        //Logs the user in and show the group dashboard
    }

    return $requestData;
}

function allowed_file_extension ($type, $file_type)
{
    $is_allowed = false;
    switch ($type) {
        case 'logo' :
        case 'memberprofilepicture':
        case 'companylogo':
            if (preg_match ("/^image/i", $file_type)) {
                $is_allowed = true;
            }
            break;
        case 'memberprofileattachment':
        case 'investorprofileattachment':
        case 'entrepreneurprofilecv':
        case 'entrepreneurprofileattachment':
            $is_allowed = true;
            break;
    }
    return $is_allowed;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Upload Handler
 *
 * @param bool $echo
 */
add_action ('wp_ajax_nopriv_file_upload', 'bidx_upload_action');
add_action ('wp_ajax_file_upload', 'bidx_upload_action');

function bidx_upload_action ()
{

    $type = 'logo';

    if (isset ($_POST['uploadtype'])) {
        $type = $_POST['uploadtype'];
    }

    $is_ie_wrapper = (isset ($_POST['jsonp'])) ? $_POST['jsonp'] : 0;

    foreach ($_FILES as $file_name => $file_values) {

        $file_extension = allowed_file_extension ($type, $file_values['type']);

        if ($file_extension) {
            $body = bidx_wordpress_pre_action ($type, $file_values);

            $params = $body['params'];
            $result = call_bidx_service ('entity/' . $params['id'] . '/document', $params, 'POST', 'upload');

            $request = bidx_wordpress_post_action ($type, $result, $body);
        } else {
            $request->status = 'ERROR';
            $request->text = "The uploaded file doesn't seem to be an image.";
        }

        $jsonData = json_encode ($request);

        $json_display = ($is_ie_wrapper) ? bidx_wrapper_response ($type, $jsonData) : $jsonData;

        echo $json_display;

        die (); // stop executing script
    }
}

function bidx_wrapper_response ($type, $jsonData)
{


    switch ($type) {

        case 'logo' :

            $with_wrapper_data = "<script type='text/javascript'>
parent.window.fileuploadCallBack(
{$jsonData}
);
</script>";

            break;
        default :
            $with_wrapper_data = $jsonData;
    }

    return $with_wrapper_data;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Registratin Ajax Call
 *
 * @param bool $echo
 */
add_action ('wp_ajax_nopriv_bidx_register', 'ajax_register_action');

function ajax_register_action ()
{

    $url = $_POST['apiurl'];
    $method = $_POST['apimethod'];

    //2 Edit Member Entity
    $bodyProfile = bidx_wordpress_pre_action ('entityprofile');
    $paramsProfile = $bodyProfile['params'];

    //  $resultEntityMember = call_bidx_service ('entity/' . $paramsProfile['creatorProfileId'], $paramsProfile, 'PUT');
    // $requestEntityMember = bidx_wordpress_post_action ('groupmembers', $resultEntityMember, $bodyProfile);
    //2 Edit Group Entity
    // $bodyGroup = bidx_wordpress_pre_action ('entitygroup');
    // $paramsGroup = $bodyGroup['params'];
    //$resultEntityGroup = call_bidx_service('entity/' . $paramsGroup['groupProfileId'], $paramsGroup, 'PUT');
    //$requestEntityGroup = bidx_wordpress_post_action('groupmembers', $resultEntityGroup, $bodyGroup);
    //3 Edit Group Data
    $bodyGrpData = bidx_wordpress_pre_action ("groups");
    $paramsGrpData = $bodyGrpData['params'];
    $resultGrpData = call_bidx_service ('groups/' . $paramsGrpData['id'], $paramsGrpData, 'PUT');
    $requestGrpData = bidx_wordpress_post_action ('groupmembers', $resultGrpData, $bodyGrpData);

    //exit;
    $requestData = bidx_register_response ($requestEntityMember, $requestEntityGroup, $requestGrpData);


    $jsonData = json_encode ($requestData);
    echo $jsonData;

    die (); // stop executing script
}

// Author: msp
// Date: 01-12-2013
// create wordpress site call
//http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_createsite #POST
//
add_action ('wp_ajax_nopriv_bidx_createsite', 'ajax_create_wordpress_site');

function ajax_create_wordpress_site ()
{
    // adding origin header to allow cross domain ajax call from admin site
    //
header ('Access-Control-Allow-Origin: http://admin.' . $_SERVER['HTTP_HOST']);

    $bodyGrpData = bidx_wordpress_pre_action ("groups");
    $jsonData = json_encode ($bodyGrpData);
    echo $jsonData;

    die (); // stop executing script
}

/* Assign theme/pages/metadata when site is created
 * Reference http://stackoverflow.com/questions/6890617/how-to-add-a-meta-box-to-wordpress-pages
 * @author Altaf Samnani
 * @version 1.0
 * @description  Assign theme/pages/metadata when site is created
 * Reference http://stackoverflow.com/questions/6890617/how-to-add-a-meta-box-to-wordpress-pages
 * http://bigbigtech.com/2009/07/wordpress-mu-cross-posting-with-switch_to_blog/
 * http://wordpress.org/support/topic/sharing-page-content-across-networked-install?replies=6
 *
 * Add Custom Page attributes
 *
 * @param bool $echo
 */

add_action ('wpmu_new_blog', 'assign_bidxgroup_theme_page', '1');

function assign_bidxgroup_theme_page ($blog_id)
{
    global $wpdb;

    //Login to the site
    switch_to_blog ($blog_id);
    // Action 1 Switch theme to assign
    switch_theme ('bidx-group');
    //Create custom role and capablitiei
    //create_custom_role_capabilities ($blog_id);

    restore_current_blog ();
}



/* Alter Network Admin menus to get Bidx branding
 * Reference http://wordpress.stackexchange.com/questions/7290/remove-custom-post-type-menu-for-none-administrator-users
 * @author Altaf Samnani
 * @version 1.0
 *
 *
 * @param bool $echo
 */

function alter_network_menu ()
{

    add_submenu_page ('settings.php', __ ('Static PO Generator'), __ ('Bidx global settings'), 'manage_network_options', 'static-po', 'bidx_options');
}

add_action ('network_admin_menu', 'alter_network_menu');


/* Bidx options
 * Reference //wp-content/plugins/wpml-string-translation/inc/functions.php , added phtml options, changed core file.
 * @author Altaf Samnani
 * @version 1.0
 *
 *
 * @param bool $echo
 */

function bidx_options ()
{
    /* 1 Create Bidx Static PO */
    if (current_user_can ('manage_options')) {

        $pluginDir = WP_PLUGIN_DIR . '/bidx-plugin/apps';
        echo "<h2>Bidx Pot File Generator </h2>";
        /* 1. Bidx Static Pot Generator */
        echo "<b>Bidx Static Api Pot Generator (Text domain static)</b><br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=static'>here</a> to create static PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=static&lang=es'>here</a> to create static Demo Es PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=static&lang=fr'>here</a> to create static Demo Fr PO <br/><br/>";

        /* 1.2 Bidx Apps Pot Generator */
        echo "<b>Bidx Wp Plugin I18n.xml Pot Generator (Text domain i18n) </b><br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=module&path=" . WP_PLUGIN_DIR . "/bidx-plugin" . "&app=apps'>here</a> to create Apps PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=module&lang=es&path=" . WP_PLUGIN_DIR . "/bidx-plugin" . "&app=apps'>here</a> to create Apps Demo Es PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=module&lang=fr&path=" . WP_PLUGIN_DIR . "/bidx-plugin" . "&app=apps'>here</a> to create Apps Demo Fr PO <br/><br/>";

        /* 1.3. Bidx Apps Pot Generator */
        echo "<b>Bidx Wp Plugin Pot Generator (bidx-plugin + bidx-group theme) (Text domain bidxplugin)</b><br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxplugin'>here</a> to create Apps PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxplugin&lang=es'>here</a> to create Apps Demo Es PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxplugin&lang=fr'>here</a> to create Apps Demo Fr PO <br/><br/>";

        /* 1.4. Bidx Theme Pot Generator */
        echo "<b>Bidx Main Theme Pot Generator (Bidx Theme Main site bidx.net) (Text domain bidxtheme)</b><br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxtheme&path=" . WP_CONTENT_DIR . "/themes'>here</a> to create Apps PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxtheme&lang=es&path=" . WP_CONTENT_DIR . "/themes'>here</a> to create Apps Demo Es PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxtheme&lang=fr&path=" . WP_CONTENT_DIR . "/themes'>here</a> to create Apps Demo Fr PO <br/><br/>";

        /* 1.4. Bidx Group Theme Pot Generator
        echo "<b>Bidx Group Theme Pot Generator (Bidx Theme) (Text domain bidxtheme)</b><br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxgrouptheme&path=" . WP_CONTENT_DIR . "/themes'>here</a> to create Apps PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxgrouptheme&lang=es&path=" . WP_CONTENT_DIR . "/themes'>here</a> to create Apps Demo Es PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxgrouptheme&lang=fr&path=" . WP_CONTENT_DIR . "/themes'>here</a> to create Apps Demo Fr PO <br/>";
         */

        /* 2 Bidx Push Notification */
        $entrepreneurNotification = get_site_option ('entrepreneur-notification');
        $htmlEntrNotification = "<br/><br/><b>Bidx Entrepreneur Notification</b><br/>";
        $htmlEntrNotification .= "<textarea name='entrepreneur-notification'>" . $entrepreneurNotification . "</textarea>";
        $htmlEntrNotification .= "<div class='buttonwrapper'>
                    <input type='hidden' value='entrepreneur-notification' name='notification'/>
                    <input type='submit' name = 'action' value='Save'>
                    <input type='submit' name = 'action' value='Reset' >
                </div>";
        echo get_site_option ('entrepreneur-notification');
        if (isset ($_POST['action'])) {
            $action = $_POST['action'];
            $notificationType = $_POST['notification'];
            $notificationVal = $_POST[$notificationType];
            if ($action == 'Save') {
                update_site_option ($notificationType, $notificationVal);
            } else {

            }
        }
        /* 3 Bidx Push Notification */
        $investorNotification = get_site_option ('investor-notification');
        $htmlInvestorNotification = "<br/><br/><b>Bidx Investor Notification</b><br/>";
        $htmlInvestorNotification .= "<textarea name='investor-notification'>" . $investorNotification . "</textarea>";
        $htmlInvestorNotification .= "<div class='buttonwrapper'>
                    <input type='hidden' value='investor-notification' name='notification'/>
                    <input type='submit' name = 'action' value='Save'>
                    <input type='submit' name = 'action' value='Reset' >
                </div>";

        /* 4 Skipso */
        $skipsoUrl = get_site_option ('skipso-frontend-logout');
        $htmlFrontendLogout = "<br/><br/><b>Skipso Frontend Logout URL</b><br/>";
        $htmlFrontendLogout .= "<input style='width:350px;' type='text' name='skipso-frontend-logout' value='" . $skipsoUrl . "'>";
        $htmlFrontendLogout .= "<div class='buttonwrapper'>
                    <input type='hidden' value='skipso-frontend-logout' name='notification'/>
                    <input type='submit' name = 'action' value='Save'>
                    <input type='submit' name = 'action' value='Reset' >
                </div>";

        /* 5 Skipso BAckend Logout */
        $skipsoBackendLogoutUrl = get_site_option ('skipso-backend-logout');
        $htmlBackendLogout = "<br/><br/><b>Skipso Backend Logout URL</b><br/>";
        $htmlBackendLogout .= "<input style='width:350px;' type='text' name='skipso-backend-logout' value='" . $skipsoBackendLogoutUrl . "'>";
        $htmlBackendLogout .= "<div class='buttonwrapper'>
                    <input type='hidden' value='skipso-backend-logout' name='notification'/>
                    <input type='submit' name = 'action' value='Save'>
                    <input type='submit' name = 'action' value='Reset' >
                </div>";

        /* 6 Skipso Judge Logout */
        $skipsoJudgeLogoutUrl = get_site_option ('skipso-judge-logout');
        $htmlJudgeLogout = "<br/><br/><b>Skipso Judge Logout URL</b><br/>";
        $htmlJudgeLogout .= "<input style='width:350px;' type='text' name='skipso-judge-logout' value='" . $skipsoJudgeLogoutUrl . "'>";
        $htmlJudgeLogout .= "<div class='buttonwrapper'>
                    <input type='hidden' value='skipso-judge-logout' name='notification'/>
                    <input type='submit' name = 'action' value='Save'>
                    <input type='submit' name = 'action' value='Reset' >
                </div>";





        echo "<h2>Global Custom Options</h2>
                <form method='post' action='settings.php?page=static-po'>
                    {$htmlEntrNotification}
                </form>
                <form method='post' action='settings.php?page=static-po'>
                    {$htmlInvestorNotification}
                </form>
                <form method='post' action='settings.php?page=static-po'>
                    {$htmlFrontendLogout}
                </form>
                <form method='post' action='settings.php?page=static-po'>
                    {$htmlBackendLogout}
                </form>
                <form method='post' action='settings.php?page=static-po'>
                    {$htmlJudgeLogout}
                </form>
                    ";
    } else {
        //wp_die (__ ('You do not have sufficient permissions to access this page.'));
    }
}

/* Force Wordpress Login
 * @author Altaf Samnani
 * @version 1.0
 *
 *
 * @param String $$username
 */

function force_wordpress_login ($username)
{

    if ($user_id == username_exists ($username)) {   //just do an update
        // userdata will contain all information about the user
        $userdata = get_userdata ($user_id);
        $user = wp_set_current_user ($user_id, $username);
        // this will actually make the user authenticated as soon as the cookie is in the browser
        wp_set_auth_cookie ($user_id);

        // the wp_login action is used by a lot of plugins, just decide if you need it
        do_action ('wp_login', $userdata->ID);
        // you can redirect the authenticated user to the "logged-in-page", define('MY_PROFILE_PAGE',1); f.e. first
    }
    return;
}

/* Send frontpage Group createion request Staff Email
 * @author Altaf Samnani
 * @version 1.0
 * @url http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_staffmail
 *
 */

add_action ('wp_ajax_bidx_staffmail', 'bidx_staffmail');
add_action ('wp_ajax_nopriv_bidx_staffmail', 'bidx_staffmail'); // ajax for logged in users

function bidx_staffmail ()
{

    $data = bidx_wordpress_pre_action ('staff_email');
    $params = $data['params'];
    $fromName = "From: '" . $params['groupName'] . "' <info@bidx.net>";

    add_filter ('wp_mail_content_type', create_function ('', 'return "text/html"; '));
    $mailSent = wp_mail ('info@bidx.net', $params['subject'], $params['body'], $fromName);
    if ($mailSent) {
        $requestData->status = 'OK';
        $requestData->text = 'Our staff will contact you shortly, thank you for your patience';
    } else {
        $requestData->status = 'Mail is not configured, ERROR';
    }

    //Test

    $jsonData = json_encode ($requestData);
    echo $jsonData;
    die ();
}

/* * ************************* Bidx Dashboard Widget Start **************************************** */

/* Add a widget to the dashboard.
 * @author Altaf Samnani
 * @version 1.0
 *
 */

function bidx_add_dashboard_widgets ()
{

    $currentUser = wp_get_current_user ();
    if (in_array (WP_OWNER_ROLE, $currentUser->roles) || in_array (WP_ADMIN_ROLE, $currentUser->roles)) {
        bidx_remove_core_widgets (); // Remove core Wp widgets for Group admin role
//        wp_add_dashboard_widget (
//            'bidx_dashboard_widget', // Widget slug.
//            'Bidx', // Title.
//            'bidx_dashboard_widget_function' // Display function.
//        );
    }
}

add_action ('wp_dashboard_setup', 'bidx_add_dashboard_widgets');

/* Remove Core Wp widgets on Dashboard.
 * @author Altaf Samnani
 * @version 1.0
 *
 */

function bidx_remove_core_widgets ()
{
    global $wp_meta_boxes;

    unset ($wp_meta_boxes['dashboard']['normal']['core']);
    unset ($wp_meta_boxes['dashboard']['side']['core']);
}

//add_action ('admin_enqueue_scripts', 'roots_scripts', 100);


/* * ************************* Bidx Dashboard Widget End **************************************** */

/* * **************** Bidx Admin Theme ************************************************ */



function wpc_remove_admin_elements ()
{
    echo '<style type="text/css">
           .versions #wp-version-message {display:none !important;}
    </style>';
}

function remove_footer_admin ()
{
    echo '<span id="footer-thankyou">' . __ ('Thank you for creating with <a href="http://wordpress.org/">Bidx</a>.') . '</span>';
}

function annointed_admin_bar_remove ()
{
    global $wp_admin_bar;

    $current_user = wp_get_current_user ();
    $displayName = (isset (BidxCommon::$staticSession)) ? BidxCommon::$staticSession->data->displayName . ' (' . $current_user->roles[0] . ')' : $current_user->user_login;

    /* Remove their stuff */
    $wp_admin_bar->remove_menu ('wp-logo');
    $wp_admin_bar->remove_menu ('comments');
    $wp_admin_bar->remove_menu ('my-sites');
    $wp_admin_bar->remove_menu ('my-account');

    $custom_menu = array ('id' => 'bidx-name', 'title' => $displayName, 'parent' => 'top-secondary', 'href' => '/member');
    $wp_admin_bar->add_menu ($custom_menu);
    $custom_menu_logout = array ('id' => 'bidx-logout', 'title' => 'Logout', 'parent' => 'bidx-name', 'href' => wp_logout_url ('/'));
    $wp_admin_bar->add_menu ($custom_menu_logout);
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Bidx Zendesk Settings
 *
 */
function bidx_zendesk_settings ()
{

    require_once(BIDX_PLUGIN_DIR . '/support/support.php');


    //1. Form Post Handling
    if (isset ($_POST['bidx-zendesk-data'])) {
        $form_data = $_POST['bidx-zendesk-data'];

        if (!$form_data['email'] || !$form_data['password']) {
            $html = "<div id='message' class='error'>
                        <p>" . __ ('All fields are required. Please try again.', 'zendesk') . "
                        </p>
                    </div>";
        } else {

            //1.1 Add Zendesk email/password for autologin
            update_option ('bidx-zendesk-email', $form_data['email']);
            update_option ('bidx-zendesk-password', base64_encode ($form_data['password']));

            //1.2 Flush User meta for groupowner if exists
            $blogUrl = strtolower (get_site_url ());
            $blogTitle = BidxCommon::get_bidx_subdomain (false, $blogUrl);
            $group_owner_login = $blogTitle . WP_OWNER_ROLE;
            $userOwner = get_user_by ('login', $group_owner_login);
            delete_user_meta ($userOwner->ID, 'zendesk_user_options');


            $html = "<div class='updated'>
                        <p>" . __ ('Your options are updated succesfully.', 'support') . "
                        </p>
                    </div>";
        }

        echo $html;
    }

    //2. Bidx Zendesk View Settings
    $atts = array ('app' => 'support', 'view' => 'settings');
    $support = new support();
    $support->load ($atts);
}

//add_action ('login_enqueue_scripts', 'bidx_admin_theme_style');
/* Alter Admin menus to get Bidx branding
 * Reference http://wordpress.stackexchange.com/questions/7290/remove-custom-post-type-menu-for-none-administrator-users
 * @author Altaf Samnani
 * @version 1.0
 *
 *
 * @param bool $echo
 */
add_action ('admin_menu', 'alter_site_menu', 11);

function alter_site_menu ()
{
    global $menu;

    if ((current_user_can ('install_themes'))) {
        $restricted = array ();
        add_menu_page ('skipso', 'Skipso settings', 'edit_theme_options', 'skipso', 'bidx_skipso_settings');
        add_options_page( 'bidX Group Settings', 'bidX Group Settings', 'manage_options', 'settings', 'bidx_general_settings');
        add_submenu_page ('zendesk-support', __ ('Zendesk Bidx Settings', 'zendesk'), __ ('Account Settings', 'zendesk'), 'manage_options', 'bidx_zendesk_settings', 'bidx_zendesk_settings');
    } // check if admin and hide nothing
    else { // for all other users
        $current_user = wp_get_current_user ();

        if (in_array (WP_ADMIN_ROLE, $current_user->roles) || in_array (WP_OWNER_ROLE, $current_user->roles) || in_array (WP_MEMBER_ROLE, $current_user->roles)) {
            /* Removal of Wp Core Menus */
            remove_menu_page ('profile.php');
            remove_menu_page ('tools.php');
            remove_menu_page ('edit-comments.php');
            remove_menu_page ('index.php');
            remove_submenu_page ('index.php', 'my-sites.php');
            remove_submenu_page ('themes.php', 'themes.php');
 //           remove_submenu_page ('themes.php', 'customize.php');
            add_action ('wp_before_admin_bar_render', 'annointed_admin_bar_remove', 0);
            add_action ('admin_head', 'wpc_remove_admin_elements');

            /* Dashboard GroupAdmin/GroupOwner Menus */
            if (in_array (WP_ADMIN_ROLE, $current_user->roles) || in_array (WP_OWNER_ROLE, $current_user->roles)) {
                add_menu_page ('invite-members', 'Invite members', 'edit_theme_options', 'invite-members', 'bidx_dashboard_invite');
                add_menu_page ('getting-started', 'Getting Started', 'edit_theme_options', 'getting-started', 'bidx_getting_started');
                add_menu_page ('support', 'Support', 'edit_theme_options', 'support', 'bidx_dashboard_support');
                add_menu_page ('group-settings', 'Group Settings', 'edit_theme_options', 'group-settings', 'bidx_group_settings');
                add_menu_page ('competitions', 'Competitions', 'edit_theme_options', 'competitions', 'bidx_dashboard_competition');
            }
        }
    }
    add_filter ('admin_footer_text', 'remove_footer_admin');
}

function bidx_skipso_metadata ($skipsoEmails, $type)
{
    $html = '';
    $validEmail = array ();
    $code = preg_replace ('/\n$/', '', preg_replace ('/^\n/', '', preg_replace ('/[\r\n]+/', "\n", $skipsoEmails)));
    $skipsoEmailsArr = explode ("\n", $code);
    $skipsoUniqueArr = array_unique ($skipsoEmailsArr);
    $errorEmail = array ();

    foreach ($skipsoUniqueArr as $valueUnique) {
        if (filter_var ($valueUnique, FILTER_VALIDATE_EMAIL)) {
            $validEmail[$valueUnique] = $valueUnique;
        } else {
            $errorEmail[$valueUnique] = $valueUnique;
        }
    }

    if (!empty ($validEmail)) {
        $validEmailComma = implode (',', $validEmail);
        update_option ($type, trim ($validEmailComma));
    }

    if (!empty ($errorEmail)) {
        $invalidEmail = implode (',', $errorEmail);
        $html .= "<div id='message' class='error'>
                            <p>" . __ ('Email addresses ignored', 'competition') . ' ' . $invalidEmail . "
                            </p>
                        </div>";
    }

    return $html;
}
function bidx_general_settings() {

    require_once(BIDX_PLUGIN_DIR . '/dashboard/dashboard.php');

    if (isset ($_POST['action'])) {
        $action = $_POST['action'];
        $html = '';

        if ($action == 'Save') {
            //Is Competition and Email Settings
            $groupNews = (isset ($_POST['group-news'])) ? $_POST['group-news'] : 0;

            update_option ('group-news', $groupNews);

            $html .= "<div class='updated'>
                        <p>" . __ ('bidX options are updated succesfully.', 'bidxplugin') . "
                        </p>
                    </div>";

            echo $html;
        }
    }
    //2. Bidx Zendesk View Settings
    $atts = array ('app' => 'dashboard', 'view' => 'general-settings');
    $dashboard = new dashboard();
    $dashboard->load ($atts);

}
function bidx_skipso_settings ()
{
    require_once(BIDX_PLUGIN_DIR . '/dashboard/dashboard.php');

    if (isset ($_POST['action'])) {
        $action = $_POST['action'];
        $html = '';

        if ($action == 'Save') {

            //Is Competition and Email Settings
            $skipsoJudgeEmails = $_POST['skipso-judge-emails'];
            $skipsoBackendEmails = $_POST['skipso-backend-emails'];
            $skipsoCompetition = (isset ($_POST['skipso-competition'])) ? $_POST['skipso-competition'] : 0;
            $html .= bidx_skipso_metadata ($skipsoJudgeEmails, 'skipso-judge-emails');
            $html .= bidx_skipso_metadata ($skipsoBackendEmails, 'skipso-backend-emails');
            update_option ('skipso-competition', $skipsoCompetition);

            //Skipso Singlesignon Url
            $skipsoFrontendUrl = $_POST['skipso-frontend-url'];
            $skipsoBackendUrl = $_POST['skipso-backend-url'];
            $skipsoJudgeUrl = $_POST['skipso-judge-url'];
            update_option ('skipso-frontend-url', $skipsoFrontendUrl);
            update_option ('skipso-backend-url', $skipsoBackendUrl);
            update_option ('skipso-judge-url', $skipsoJudgeUrl);

            //Skipso Logout
            $skipsoFrontendLogout = $_POST['skipso-frontend-logout'];
            $skipsoBackendLogout = $_POST['skipso-backend-logout'];
            $skipsoJudgeLogout = $_POST['skipso-judge-logout'];
            update_option ('skipso-frontend-logout', $skipsoFrontendLogout);
            update_option ('skipso-backend-logout', $skipsoBackendLogout);
            update_option ('skipso-judge-logout', $skipsoJudgeLogout);


            $html .= "<div class='updated'>
                        <p>" . __ ('Your competitions options are updated succesfully.', 'competition') . "
                        </p>
                    </div>";
            echo $html;
        }
    }
    //2. Bidx Zendesk View Settings
    $atts = array ('app' => 'dashboard', 'view' => 'competition-settings');
    $dashboard = new dashboard();
    $dashboard->load ($atts);
}

function bidx_dashboard_competition ()
{
    $sessionData = BidxCommon::$staticSession;
    $isCompetition = get_option ('skipso-competition');
    $userName = $sessionData->data->username;
    $backendEmails = explode (",", get_option ('skipso-backend-emails'));
    $isBackendUser = ($isCompetition && in_array ($userName, $backendEmails)) ? true : false;
    if ($isBackendUser) {
        $skipsoBackendUrl = get_option ('skipso-backend-url');
        wp_redirect ($skipsoBackendUrl);
    } else {
        echo do_shortcode ("[bidx app='dashboard' view='group-dashboard' menu='competition']");
    }
}

function bidx_dashboard_invite ()
{

    echo do_shortcode ("[bidx app='dashboard' view='group-dashboard' menu='invite-members']");
}


/* Create the function to output the contents of our Dashboard Widget.
 * @author Altaf Samnani
 * @version 1.0
 *
 */

function bidx_getting_started ()
{
    //wp_enqueue_style( 'dashboard' );
    echo do_shortcode ("[bidx app='dashboard' view='group-dashboard' menu='getting-started']");
}

/* Create the function to output the contents of our Dashboard Widget.
 * @author Altaf Samnani
 * @version 1.0
 *
 */

function bidx_dashboard_support ()
{
    //global $zendesk_support;
    //wp_enqueue_style( 'dashboard' );
    echo do_shortcode ("[bidx app='support' view='support']");

    if (is_plugin_active ('zendesk/zendesk-support.php')) {
        echo do_shortcode ("[bidx app='support' view='view-zendesk-tickets']");
    }
}

/* Create the function to output the contents of our Dashboard Widget.
 * @author Altaf Samnani
 * @version 1.0
 *
 */

function bidx_group_settings ()
{
    //wp_enqueue_style( 'dashboard' );
    // echo do_shortcode ("[bidx app='dashboard' view='group-dashboard' menu='group-settings']");

    $bidxCommonObj  = new BidxCommon();
    $staticData     = $bidxCommonObj->getLocaleTransient (array (), $static = true, $i18nGlobal = false);

    $industry       = $staticData['static']['industry'];
    $socialImpact   = $staticData['static']['socialImpact'];
    $envImpact      = $staticData['static']['envImpact'];
?>
    <h2><?php echo __('Group Settings', 'bidxplugin') ?></h2>
    <div class="form-wrap">
        <form method="POST" id="bidx-group-settings">
            <div class="form-field">
                <label for="group-slogan"><?php echo __('Slogan', 'bidxplugin') ?></label>
                <input type="text" size="30" maxlength="140" id="group-slogan" name="group-slogan">
                <p><?php echo __('Max 140 chars.', 'bidxplugin') ?></p>
            </div>
            <div class="form-field">
                <label for="group-description"><?php echo __('Description', 'bidxplugin') ?></label>
                <textarea cols="40" rows="2" maxlength="200" id="group-description" name="group-description"></textarea>
                <p><?php echo __('Max 200 chars.', 'bidxplugin') ?></p>
            </div>
            <table>
                <tbody>
                    <tr><td><?php echo __('Focus Location', 'bidxplugin') ?></td><td></td></tr>
                    <tr>
                        <td>
                            <div class="form-field">
                                <label for="group-location-lon"><?php echo __('Longitude', 'bidxplugin') ?></label>
                                <input type="text" size="30" id="group-location-lon" name="group-location-lon">
                            </div>
                        </td>
                        <td>
                            <div class="form-field">
                                <label for="group-location-lat"><?php echo __('Latitude', 'bidxplugin') ?></label>
                                <input type="text" size="30" id="group-location-lat" name="group-location-lat">
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table>
                <tbody>
                    <tr>
                        <td>
                            <div class="form-field">
                                <label for="group-industry"><?php echo __('Industry', 'bidxplugin') ?></label>
                                <select class="" id="group-industry" name="group-industry" multiple>
<?php
                                    foreach ($industry as $option) {
?>
                                        <option value="<?php echo $option->value; ?>"><?php echo $option->label; ?></option>
<?php
                                    }
?>
                                </select>
                            </div>
                        </td>
                        <td>

                            <div class="form-field">
                                <label for="group-socialImpact"><?php echo __('Social Impact', 'bidxplugin') ?></label>
                                <select class="" id="group-socialImpact" name="group-socialImpact" multiple>
<?php
                                    foreach ($socialImpact as $option) {
?>
                                        <option value="<?php echo $option->value; ?>"><?php echo $option->label; ?></option>
<?php
                                    }
?>
                                </select>
                            </div>
                        </td>
                        <td>
                            <div class="form-field">
                                <label for="group-envImpact"><?php echo __('Environmental Impact', 'bidxplugin') ?></label>
                                <select class="" id="group-envImpact" name="group-envImpact" multiple>
<?php
                                    foreach ($envImpact as $option) {
?>
                                        <option value="<?php echo $option->value; ?>"><?php echo $option->label; ?></option>
<?php
                                    }
?>
                                </select>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <input type="submit" value="Save" class="button button-primary menu-save" id="save_group-settings" name="save_group-settings">
        </form>
    </div>
<?php
}

add_action ('wp_ajax_nopriv_bidx_set_option', 'bidx_set_option');
add_action ('wp_ajax_bidx_set_option', 'bidx_set_option');

function bidx_set_option ()
{

    $type = (isset ($_GET['type'])) ? $_GET['type'] : NULL;
    $value = (isset ($_GET['value'])) ? $_GET['value'] : NULL;
    $data['response'] = 'error';

    if ($type) {
        update_option ($type, $value);
        $data['response'] = 'ok';
    }
    echo json_encode ($data);
    exit;
}

/* Remove "Wordpress update available" message.
 * @author Altaf Samnani
 * @issue #BIDX-1780
 *
 */
add_action ('admin_menu', 'wp_hide_nag');

function wp_hide_nag ()
{

    remove_action ('admin_notices', 'update_nag', 3);
}

/* Add favicons support
 * @author Altaf Samnani
 * @issue #BIDX-1775
 *
 */
function bidx_group_favicon() {

 $img_url = get_template_directory_uri().'/assets/img/favicon_bidx.ico'; //make relative
 if ( get_theme_mod( 'favicon_image' ) ) {
    $img = parse_url( get_theme_mod( 'favicon_image' ) );
    $img_url = $img['path']; //make relative

 }
 echo '<link rel="Shortcut Icon" type="image/x-icon" href="' . $img_url . '" />';

}
add_action( 'admin_head', 'bidx_group_favicon' );
add_action( 'login_head', 'bidx_group_favicon' );
add_action( 'wp_head', 'bidx_group_favicon' );


/* Add Static page wordpress js
 * @author Altaf Samnani
 * @issue #BIDX-1786
 *
 */
function bidx_wp_content() {



    $currentPostTitle = get_the_title();

    switch($currentPostTitle) {
        /* Getting started member */
        case 'Getting started member':
        case 'Getting started mentor':
        case 'Getting started entrepreneur':
        case 'Getting started investor':
//            $bidxPreferencePath       = sprintf ('%s/../apps/member/static/js/memberpreference.js',    BIDX_PLUGIN_URI);
//            $deps                     = $deps = array( 'jquery', 'bootstrap', 'underscore', 'backbone', 'json2',
//			'holder', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-reflowrower', 'bidx-data', 'bidx-i18n', 'bidx-tagsinput',
//			'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods',
//			'bidx-location','bidx-chosen', 'typeahead'
//	);
//            wp_enqueue_script( 'memberpreference',		$bidxPreferencePath , array(), '20130808', TRUE );

            echo do_shortcode ("[bidx app='content']");
            break;

    }

}

add_action( 'wp_head', 'bidx_wp_content');





