<?php
/*
  Plugin Name: Bidx API Services
  Description: Bidx API Services
  Version: 3.15
  Author: Altaf Samnani

  Copyright 2013  Altaf Samnani  (email : altafsamnani@gmail.com)

  This program is free software; you can redistribute it and/or modify
  it  under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
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
 *
 * @return Loggedin User
 */

function bidx_process_mail ()
{


    //$is_session = bidx_check_session();
    // if($is_session) {
    //   echo 'session milaaa';exit;
    //}

    $pre_data = bidx_wordpress_pre_action ('mailer');
    $params = $pre_data['params'];

    $result = call_bidx_service ($params['action'], $params['data'], $params['protocol']);

    $requestData = bidx_wordpress_post_action ('mailer', $result, $params['data']);

    echo 'with session';

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
    $http = (is_ssl ()) ? 'https://' : 'http://';
    $current_url = $http . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    $redirect_url = $http . $groupDomain . '.' . DOMAIN_CURRENT_SITE . '/auth?q=' . base64_encode ($current_url) . '&emsg=1';

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

function bidx_login_session ()
{

    $body['domain'] = get_bidx_subdomain ();

    $get_redirect = ($_GET['q']) ? $_GET['q'] : NULL;

    /*     * ** Assumed if redirect in Get means session is already checked and is asking for uname/pass and then redirect ** */
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

function call_bidx_service ($urlservice, $body, $method = 'POST', $is_form_upload = false)
{

    $authUsername = ( API_AUTH_UNAME ) ? API_AUTH_UNAME : 'bidx'; // Bidx Auth login
    $authPassword = ( API_AUTH_PASS ) ? API_AUTH_PASS : 'gobidx'; // Bidx Auth password
    $bidxMethod = strtoupper ($method);
    $bidx_get_params = "";
    $cookie_string = "";
    $sendDomain = 'bidx.net';
    $cookieArr = array ();


    error_log (sprintf ("	: %s, body: %s", $urlservice, var_export ($body, true)));


    /*     * *********1. Retrieve Bidx Cookies and send back to api to check ******* */
    $cookieInfo = $_COOKIE;
    foreach ($_COOKIE as $cookieKey => $cookieValue) {
        if (preg_match ("/^bidx/i", $cookieKey)) {
            $cookieArr[] = new WP_Http_Cookie (array ('name' => $cookieKey, 'value' => urlencode ($cookieValue), 'domain' => $sendDomain));
        }
    }

    /*     * *********2. Set Headers ******************************** */
    //For Authentication
    $headers['Authorization'] = 'Basic ' . base64_encode ("$authUsername:$authPassword");

    // 2.1 Is Form Upload
    if ($is_form_upload) {
        $headers['Content-Type'] = 'multipart/form-data';
    }

    /* if ($urlservice == 'session' && $bidxMethod == 'POST' && DOMAIN_CURRENT_SITE == 'bidx.dev') {
      $body['username'] = 'admin@bidnetwork.org';
      $body['password'] = 'admin123';

      }
     */
    // 2.2 Set the group domain header
    if (isset ($body['domain'])) {
        //Talk with arjan for domain on first page registration it will be blank when it goes live
        $headers['X-Bidx-Group-Domain'] = ($urlservice == 'groups' && $bidxMethod == 'POST') ? 'beta' : $body['domain'];
        //$bidx_get_params.= '&groupDomain=' . $body['domain'];
    }

    /*     * ********* 3. Decide method to use************** */
    if ($bidxMethod == 'GET') {
        $bidx_get_params = ($body) ? '&' . http_build_query ($body) : '';
        $body = NULL;
    }


    /*     * *********** 4. WP Http Request ******************************* */


    $url = API_URL . $urlservice . '?csrf=false' . $bidx_get_params;

    error_log ("URL: " . $url);

    $request = new WP_Http;
    $result = $request->request ($url, array ('method' => $bidxMethod,
      'body' => $body,
      'headers' => $headers,
      'cookies' => $cookieArr,
      'timeout' => apply_filters ('http_request_timeout', 60)
    ));

    /*     * *********** 5. Set Cookies if Exist ************************* */
    if (is_array ($result)) {
        if (isset ($result['cookies']) && count ($result['cookies'])) {
            $cookies = $result['cookies'];
            foreach ($cookies as $bidxAuthCookie) {
                $cookieDomain = (DOMAIN_CURRENT_SITE == 'bidx.dev') ? 'bidx.dev' : $bidxAuthCookie->domain;
                setcookie ($bidxAuthCookie->name, $bidxAuthCookie->value, $bidxAuthCookie->expires, $bidxAuthCookie->path, $cookieDomain, FALSE, $bidxAuthCookie->httponly);
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
add_action ('wp_authenticate', 'ajax_submit_signin');
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
            $result = call_bidx_service ($url, $body);

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
                    $error = "<strong>ERROR:</STRONG> 122" . $text;
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
 * @return Loggedin User
 */
add_action ('wp_logout', 'bidx_signout');

function bidx_signout ()
{
    //Logout Bidx Session too

    clear_bidx_cookies ();

    $params['domain'] = get_bidx_subdomain ();
    call_bidx_service ('session', $params, 'DELETE');
    wp_clear_auth_cookie ();
    clear_wp_bidx_session ();
}

function clear_bidx_cookies ()
{

    /*     * *********Retrieve Bidx Cookies and send back to api to check ******* */
    $cookieInfo = $_COOKIE;
    foreach ($_COOKIE as $cookieKey => $cookieValue) {
        if (preg_match ("/^bidx/i", $cookieKey)) {
            setcookie ($cookieKey, ' ', time () - YEAR_IN_SECONDS, ADMIN_COOKIE_PATH, COOKIE_DOMAIN);
        }
    }
}

/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * String Translate API for Frontend
 ********** i18n ************** 
 *  1) For all data
 *  http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_translation&type=i18n&print=true
 *  2) For App i18n.xml data
 *  http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_translation&type=i18n&context=company&print=true
 *  3) For Global i18.xml data
 *  http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_translation&type=i18n&context=__global&print=true
 * 
 ********** Static **************  
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
    $type = (isset($_GET['type'])) ? $_GET['type'] : NULL;
    $print   = (isset($_GET['print'])) ? $_GET['print'] : NULL;
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
    
    if($print) {
        echo "<pre>";
        print_r($translatedArr);
        echo "</pre>";
        exit;
    } else {
        echo json_encode($translatedArr);   
    }   
    
    exit;
}

/*
 * @author Altaf Samnani
 * @version 1.0
 *
 * Create the Po file from settings->Bidx
 * http://local.bidx.net/wp-admin/admin-ajax.php?action=bidx_createpo
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
                $i18AppsArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/apps/*/{i18n.xml}', GLOB_BRACE);
                $i18PluginArr = glob (WP_PLUGIN_DIR . '/bidx-plugin/{i18n.xml}', GLOB_BRACE);

                $fileArr = array_merge ($i18AppsArr, $i18PluginArr);

                foreach ($fileArr as $fileName) {

                    $body['is_app'] = (preg_match ("/apps/i", $fileName)) ? true : false;

                    $dirArr = (preg_match ("/apps\/(.*)\/i18n.xml/i", $fileName, $matches));
                    $body['app'] = (isset ($matches[1])) ? $matches[1] : NULL;

                    $document = simplexml_load_file ($fileName);
                    $items = $document->xpath ('//Item');

                    $po .= other_wordpress_post_action ('pocreate', $items, $body);
                }
                break;
            case 'bidxplugin' :
                $plugin = $_GET['path'];
                global $pluginStrings;
                bidx_st_scan_plugin_files ($plugin);
                $po = plugin_theme_po_action ($pluginStrings,$_GET);
                

                break;

            case 'bidxtheme' :
                $plugin = $_GET['path'];
                global $pluginStrings;
                bidx_st_scan_plugin_files ($plugin);
                $po = plugin_theme_po_action ($pluginStrings,$_GET);

                break;
        }

        if ($lang) {
            $popot = 'po';
            $poname = $lang . '_' . strtoupper ($lang);
        } else {
            $popot = 'pot';
            $poname = 'i18n';
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

    $scan_stats .= __ ('Done scanning files', 'wpml-string-translation') . PHP_EOL;
    
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
        $msgId = str_replace ('"', '\"', $dataId->value);
        $msgStr = (isset ($body['lang'])) ? $body['lang'] . $msgId : '';
        $msgCtxt = str_replace ('"', '\"', $dataId->key);

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
            $po .= 'msgid "' . str_replace ('"', '\"', $msgId) . '"' . PHP_EOL;
            $po .= 'msgstr "' . str_replace ('"', '\"', $msgStr) . '"' . PHP_EOL;
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
            $count = 0;
            $appName = $body['app'];
            $i18nData = array();
            foreach ($result as $xmlObj) {

                $arr = $xmlObj->attributes ();
                $xmlLabel =  $xmlObj->__toString ();

                if($appName == '__global') {
                    $label = __( $xmlLabel ,'i18n');
                } else {
                    $label = _x( $xmlLabel ,$appName, 'i18n');
                }

                $i18nData[$count]->value = $arr['value']->__toString();


                $i18nData[$count]->label = $label;

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
    session_id ($_COOKIE['session_id']);
    session_start ();
    session_destroy ();
    setcookie ('session_id', ' ', time () - YEAR_IN_SECONDS, ADMIN_COOKIE_PATH, COOKIE_DOMAIN);
    //$sessionMsg = array ('status' => 'success','text' => 'Session Flused.');
    //echo json_encode ($sessionMsg);
    //exit;
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
        if (eregi ("^www$", $hostAddress [0])) {
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
    $domain = (DOMAIN_CURRENT_SITE == 'bidx.dev') ? 'site1.bidx.dev' : $domain;
    $redirect = NULL;
    /*     * **** If have a particular Redirect in params *************** */
    if (isset ($_POST['redirect_to'])) {
        $redirect_to = $_POST['redirect_to'];
        $redirect = base64_decode ($redirect_to);
    }

    /*     * ***** Decide on Redirect/Submit Logic ********** */
    switch ($url) {
        case 'sessionactive':
        case 'session':
            $redirect = ($redirect) ? $redirect : '/';
            $requestData->redirect = $redirect;
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
                    $username = $groupName . 'groupanonymous';

                    if (!empty ($displayData->roles)) {
                        $roleArray = $displayData->roles;

                        if (in_array ("SysAdmin", $roleArray)) {
                            //$username = 'admin';
                            $username = 'admin';
                        } else if (in_array ("GroupAdmin", $roleArray)) {

                            $username = $groupName . 'groupadmin';
                        } else if (in_array ("GroupOwner", $roleArray)) {

                            $username = $groupName . 'groupowner';
                        } else if (in_array ("Member", $roleArray)) {
                            $username = $groupName . 'groupmember';
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
                        wp_set_auth_cookie ($user_id);

                        // the wp_login action is used by a lot of plugins, just decide if you need it
                        do_action ('wp_login', $userdata->ID);
                        // you can redirect the authenticated user to the "logged-in-page", define('MY_PROFILE_PAGE',1); f.e. first
                        // $requestData = get_redirect($url, $requestData);
                    }
                }

                $requestData = get_redirect ($url, $requestData);
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
    if ($blogs) {
        foreach ($blogs as $blog_id) {
            switch_to_blog ($blog_id);
            delete_bidx_plugin ($pageTitle); //silently deactivate the plugin
            restore_current_blog ();
        }
        ?><div id="message" class="updated fade"><p><span style="color:#FF3300;"><?php echo implode (', ', $pageTitle); ?></span><?php echo ' has been MASS Deleted.'; ?></p></div><?php
        } else {
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

                    $roleArr = array ('', 'groupadmin', 'groupowner', 'groupmember', 'groupanonymous');


                    $blog_title = strtolower (get_bloginfo ());
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
                        $params['protocol'] = $get_data['protocol'];
                        $params['action'] = $get_data['action'];
                        $get_data['domain'] = $get_data['groupDomain'];
                        unset ($get_data['protocol']);
                        unset ($get_data['action']);
                        unset ($get_data['groupDomain']);
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

                        $body = "Dear Staff, <br/><br/> New group <strong>" . $params['groupName'] . "</strong> has been created by <strong>" . $params['username'] . "</strong> from country <strong>" . $params['country'] . "</strong><br/><br/>";
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

                    $username_wp = (DOMAIN_CURRENT_SITE == 'bidx.dev') ? 'site1groupadmin' : $_POST['businessGroupName'] . 'groupadmin';
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
                        $result = call_bidx_service ('entity/' . $params['id'] . '/document', $params, 'POST', true);

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

                $resultEntityMember = call_bidx_service ('entity/' . $paramsProfile['creatorProfileId'], $paramsProfile, 'PUT');
                $requestEntityMember = bidx_wordpress_post_action ('groupmembers', $resultEntityMember, $bodyProfile);


                //2 Edit Group Entity
                $bodyGroup = bidx_wordpress_pre_action ('entitygroup');
                $paramsGroup = $bodyGroup['params'];

                //$resultEntityGroup = call_bidx_service('entity/' . $paramsGroup['groupProfileId'], $paramsGroup, 'PUT');
                //$requestEntityGroup = bidx_wordpress_post_action('groupmembers', $resultEntityGroup, $bodyGroup);
                //3 Edit Group Data
                $bodyGrpData = bidx_wordpress_pre_action ();
                $paramsGrpData = $bodyGrpData['params'];
                $resultGrpData = call_bidx_service ('groups/' . $paramsGrpData['id'], $paramsGrpData, 'PUT');
                $requestGrpData = bidx_wordpress_post_action ('groupmembers', $resultGrpData, $bodyGrpData);

                //exit;
                $requestData = bidx_register_response ($requestEntityMember, $requestEntityGroup, $requestGrpData);


                $jsonData = json_encode ($requestData);
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

            add_action ('wpmu_new_blog', 'assign_bidxgroup_theme_page');

            function assign_bidxgroup_theme_page ($blog_id)
            {
                global $wpdb;

                //Login to the site
                switch_to_blog ($blog_id);
                // Action 1 Switch theme to assign
                switch_theme ('bidx-group');

                //Action 2 Default Enable WP Scrapper Plugin
                $wpws_values = array ('sc_posts' => 1, 'sc_widgets' => 1, 'on_error' => 'error_hide');

                update_option ('wpws_options', $wpws_values);

                //Action 3 Enable Plugin Bidx Api Services
                $result = activate_plugin ('bidx-services/bidx-services.php');

                //Action 4 Add Default Bidx Pages to render
                $querystr = "SELECT wposts.*,wpostmeta2.meta_value as template_value
    FROM wp_posts AS wposts
    INNER JOIN wp_postmeta AS wpostmeta ON wpostmeta.post_id = wposts.ID
    LEFT JOIN wp_postmeta AS wpostmeta2 ON  wpostmeta2.post_id = wposts.ID AND wpostmeta2.meta_key = '_wp_page_template'
    WHERE wpostmeta.meta_key = 'page_group'
    AND wpostmeta.meta_value = '1'";

                $pages_to_create = $wpdb->get_results ($querystr, OBJECT);

                foreach ($pages_to_create as $page) {

                    unset ($page->ID);
                    unset ($page->guid);
                    /* Reference http://codex.wordpress.org/Function_Reference/wp_insert_post */

                    $post_id = wp_insert_post ($page);
                    update_post_meta ($post_id, '_wp_page_template', $page->template_value);
                }

                create_custom_role_capabilities ($blog_id);

                restore_current_blog ();
            }

            /* Add Custom Role capabilities
             * @author Altaf Samnani
             * @version 1.0
             * @description  Assign Roles Capabilities
             *
             *
             * @param bool $return
             */

            function create_custom_role_capabilities ($blog_id)
            {
                /*                 * ********* Add Bidx Group Owner Group Admin Roles *************** */
                $new_user_caps_admin = array ('read' => true,
                  'edit_theme_options' => true,
                  'publish_pages' => true,
                  'publish_posts' => true,
                  'edit_pages' => true,
                  'edit_posts' => true,
                  'edit_other_posts' => false,
                  'edit_other_pages' => false,
                  'upload_files' => true);
                $new_role_added = add_role ('groupadmin', 'Group Admin', $new_user_caps_admin);

                $new_user_caps_owner = array ('read' => true,
                  'edit_theme_options' => true,
                  'publish_pages' => true,
                  'publish_posts' => true,
                  'edit_pages' => true,
                  'edit_posts' => true,
                  'edit_other_posts' => false,
                  'edit_other_pages' => false,
                  'upload_files' => true);

                $new_role_added = add_role ('groupowner', 'Group Owner', $new_user_caps_owner);

                $new_user_caps_member = array ('read' => true);
                $new_role_added = add_role ('groupmember', 'Group Member', $new_user_caps_member);

                $new_user_caps_anonymous = array ('read' => true);
                $new_role_added = add_role ('groupanonymous', 'Group Anonymous', $new_user_caps_anonymous);



                /* $new_role_added = add_role('groupowner', 'Group Owner', $new_user_caps);


                  /********* Add Bidx Group Owner Group Admin Roles **************** */
                $users_query = new WP_User_Query (array ('role' => 'administrator', 'orderby' => 'display_name'));
                $results = $users_query->get_results ();

                foreach ($results as $user) {

                    $user_id = $user->ID;

                    //When creating directly from wordpress handle that case too
                    $is_frm_bidx = (preg_match ("/groupadmin\z/i", $user->user_login)) ? true : false;
                    $group_password = 'bidxGeeks9';
                    //$group_admin_password = $user->user_login.'groupadmin';
                    //Group Admin
                    $group_admin_login = $user->user_login . 'groupadmin';
                    $group_admin_email = $user->user_login . '_admin@bidx.net';

                    //Group Owner
                    $group_owner_login = $user->user_login . 'groupowner';
                    $group_owner_email = $user->user_login . '_owner@bidx.net';

                    //Group Member
                    $group_member_login = $user->user_login . 'groupmember';
                    $group_member_email = $user->user_login . '_member@bidx.net';

                    //Group Member
                    $group_anonymous_login = $user->user_login . 'groupanonymous';
                    $group_anonymous_email = $user->user_login . '_anonymous@bidx.net';
                }


                //Add Group Owner Role
                if ($is_frm_bidx) {
                    $user = new WP_User ($user_id);
                    $user->remove_role ('administrator');
                    $user->add_role ('groupowner');
                } else {
                    /* For Adding users to existing blog */
                    $user_id_owner = wpmu_create_user ($group_owner_login, $group_password, $group_owner_email);
                    add_user_to_blog ($blog_id, $user_id_owner, 'groupowner');
                }

                //Add Group Admin Role
                $user_id_admin = wpmu_create_user ($group_admin_login, $group_password, $group_admin_email);
                add_user_to_blog ($blog_id, $user_id_admin, 'groupadmin');

                //Add Group Member Role
                $user_id_member = wpmu_create_user ($group_member_login, $group_password, $group_member_email);
                add_user_to_blog ($blog_id, $user_id_member, 'groupmember');

                //Add Group Member Role
                $user_id_anonymous = wpmu_create_user ($group_anonymous_login, $group_password, $group_anonymous_email);
                add_user_to_blog ($blog_id, $user_id_anonymous, 'groupanonymous');



                //wpmu_signup_user( $new_user_login, 'test@aa.com', array( 'add_to_blog' => $blog_id, 'new_role' => 'groupadmin' ) );
                //wp_insert_user( $user );

                return;
            }

            /* Start Add Custom Page attribute whether you want to add page in Group site creation
             * Reference http://stackoverflow.com/questions/6890617/how-to-add-a-meta-box-to-wordpress-pages
             * @author Altaf Samnani
             * @version 1.0
             *
             * Add Custom Page attributes
             *
             * @param bool $echo
             */

            add_action ('add_meta_boxes', 'add_page_group_metabox');

            function add_page_group_metabox ()
            {
                add_meta_box ('page-group-id', 'Group Page', 'group_callback', 'page', 'side', 'core');
            }

            function group_callback ($post)
            {
                $values = get_post_custom ($post->ID);
                $selected = isset ($values['page_group']) ? $values['page_group'][0] : '';
                ?>
    <label class="screen-reader-text" for="page_group"><?php _e ('Group page') ?></label>
    <select name="page_group" id="page_group">
        <option <?php echo ($selected == '1') ? 'selected' : '' ?> value='1'><?php _e ('Yes'); ?></option>
        <option <?php echo ($selected == '0') ? 'selected' : '' ?> value='0'><?php _e ('No'); ?></option>
    </select>
    <?php
}

add_action ('save_post', 'page_group_save');

function page_group_save ($post_id)
{
    // Bail if we're doing an auto save
    if (defined ('DOING_AUTOSAVE') && DOING_AUTOSAVE)
        return;

    // Probably a good idea to make sure your data is set

    if (isset ($_POST['page_group']))
        update_post_meta ($post_id, 'page_group', $_POST['page_group']);
}

/* Alter Admin menus to get Bidx branding
 * Reference http://wordpress.stackexchange.com/questions/7290/remove-custom-post-type-menu-for-none-administrator-users
 * @author Altaf Samnani
 * @version 1.0
 *
 *
 * @param bool $echo
 */

function alter_site_menu ()
{
    global $menu;

    if ((current_user_can ('install_themes'))) {
        $restricted = array ();
    } // check if admin and hide nothing
    else { // for all other users
        if ($current_user->user_level < 10) {
            remove_menu_page ('profile.php');
            remove_menu_page ('tools.php');
            remove_menu_page ('edit-comments.php');
            remove_submenu_page ('index.php', 'my-sites.php');

            //apply_filters( 'show_admin_bar', false );
            add_action ('wp_before_admin_bar_render', 'annointed_admin_bar_remove', 0);
            add_action ('admin_head', 'wpc_remove_admin_elements');
        }
    }
    add_filter ('admin_footer_text', 'remove_footer_admin');
}

add_action ('admin_menu', 'alter_site_menu');

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

    add_submenu_page ('settings.php', __ ('Static PO Generator'), __ ('Bidx'), 'manage_network_options', 'static-po', 'bidx_options');
}

add_action ('network_admin_menu', 'alter_network_menu');

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

        /* 2. Bidx Apps Pot Generator */
        echo "<b>Bidx Wp Plugin I18n.xml Pot Generator (Text domain i18n) </b><br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=module&path=" . WP_PLUGIN_DIR . "/bidx-plugin" . "&app=apps'>here</a> to create Apps PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=module&lang=es&path=" . WP_PLUGIN_DIR . "/bidx-plugin" . "&app=apps'>here</a> to create Apps Demo Es PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=module&lang=fr&path=" . WP_PLUGIN_DIR . "/bidx-plugin" . "&app=apps'>here</a> to create Apps Demo Fr PO <br/><br/>";

        /* 3. Bidx Apps Pot Generator */
        echo "<b>Bidx Wp Plugin Pot Generator (bidx-plugin) (Text domain bidxplugin)</b><br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxplugin&path=" . WP_PLUGIN_DIR . "/bidx-plugin'>here</a> to create Apps PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxplugin&lang=es&path=" . WP_PLUGIN_DIR . "/bidx-plugin'>here</a> to create Apps Demo Es PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxplugin&lang=fr&path=" . WP_PLUGIN_DIR . "/bidx-plugin'>here</a> to create Apps Demo Fr PO <br/><br/>";

        /* 4. Bidx Theme Pot Generator */
        echo "<b>Bidx Wp Theme Pot Generator (Bidx Theme) (Text domain bidxtheme)</b><br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxtheme&path=" . WP_CONTENT_DIR . "/themes'>here</a> to create Apps PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxtheme&lang=es&path=" . WP_CONTENT_DIR . "/themes'>here</a> to create Apps Demo Es PO <br/>";
        echo "Click <a href='/wp-admin/admin-ajax.php?action=bidx_createpo&type=bidxtheme&lang=fr&path=" . WP_CONTENT_DIR . "/themes'>here</a> to create Apps Demo Fr PO <br/>";

    } else {
        wp_die (__ ('You do not have sufficient permissions to access this page.'));
    }
}

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

    /* Remove their stuff */
    $wp_admin_bar->remove_menu ('wp-logo');
    $wp_admin_bar->remove_menu ('comments');
    $wp_admin_bar->remove_menu ('my-sites');
    $wp_admin_bar->remove_menu ('my-account');

    $current_user = wp_get_current_user ();
    $user_login = str_replace ('groupadmin', '', $current_user->user_login);
    $custom_menu = array ('id' => 'bidx-name', 'title' => $user_login, 'parent' => 'top-secondary', 'href' => '/member');
    $wp_admin_bar->add_menu ($custom_menu);
    $custom_menu_logout = array ('id' => 'bidx-logout', 'title' => 'Logout', 'parent' => 'bidx-name', 'href' => wp_logout_url ('/'));
    $wp_admin_bar->add_menu ($custom_menu_logout);
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

    if ($user_id = username_exists ($username)) {   //just do an update
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
    $fromName = "From: '" . $params['groupName'] . "' <" . $params['username'] . '>';

    add_filter ('wp_mail_content_type', create_function ('', 'return "text/html"; '));
    $mailSent = wp_mail ('info@bidnetwork.org', $params['subject'], $params['body'], $fromName);
    if ($mailSent) {
        $requestData->status = 'OK';
        $requestData->text = 'Our Staff will contact you shortly, thank you. We appreciate your patience.';
    } else {
        $requestData->status = 'ERROR';
    }

    //Test

    $jsonData = json_encode ($requestData);
    echo $jsonData;
    die ();
}
