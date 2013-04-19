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
if (!function_exists('htmlspecialchars_decode')) {

  function htmlspecialchars_decode($text) {
    return strtr($text, array_flip(get_html_translation_table(HTML_SPECIALCHARS)));
  }

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

function call_bidx_service($urlservice, $body, $method = 'POST') {

  $authUsername = 'bidx'; // Bidx Auth login
  $authPassword = 'gobidx'; // Bidx Auth password
  $bidxMethod = strtoupper($method);
  $bidx_get_params = "";
  $cookie_string = "";
  $sendDomain = (WP_DEVELOPMENT == FALSE) ? 'bidx.dev' : 'bidx.net';
  $cookieArr =  array();
//1 Decide method to use
  if ($bidxMethod == 'GET') {
    $bidx_get_params = '&' . http_build_query($body);
    $body = NULL;
  }
  else if ($bidxMethod == 'PUT') {
    $bidxMethod = 'PUT';
  }
  else {
    $bidxMethod = 'POST';
  }

  //2 Retrieve Bidx Cookies and send back to api to check
  $cookieInfo = $_COOKIE;
  foreach ($_COOKIE as $cookieKey => $cookieValue) {
    if (preg_match("/^bidx/i", $cookieKey)) {
   
   // $cookie_string .= $cookieKey.'="'.$cookieValue.'"; ';
      $cookieArr[] = new WP_Http_Cookie(array('name'=>$cookieKey,'value'=>$cookieValue,'domain'=>$sendDomain));
    }
  }
  //$cookie_string = 'bidx-auth-test='.urlencode($_COOKIE['bidx-auth-test']).'; ';
  //Remove stray delimiters
  //$cookie_string = trim($cookie_string, '; ');

 // $cookie_string = 'bidx-auth-test'."=".$_COOKIE['bidx-auth-test'].";";
  $url = 'http://test.bidx.net/api/v1/' . $urlservice . '?groupKey=bidxTestGroupKey&csrf=false' . $bidx_get_params;

  $headers = array('Authorization' => 'Basic ' . base64_encode("$authUsername:$authPassword"),
   // 'Cookie' => $cookie_string
   );
  $request = new WP_Http;

  $result = $request->request($url, array('method' => $bidxMethod,
    'body' => $body,
    'headers' => $headers,
    'cookies' => $cookieArr
      ));


  /* Set Cookies if Exist */  

    $cookies = $result['cookies'];
    if(count($cookies)) {
      foreach ($cookies as $bidxAuthCookie) {
      $cookieDomain = (WP_DEVELOPMENT == TRUE) ? 'bidx.dev' : $bidxAuthCookie->domain;
      setcookie($bidxAuthCookie->name, $bidxAuthCookie->value, $bidxAuthCookie->expires, $bidxAuthCookie->path, $cookieDomain, FALSE, $bidxAuthCookie->httponly);
    }
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

function bidx_auth_check_login($username, $password) {
  require_once('./wp-includes/registration.php');

  global $ext_error;
  //Get the group name from  Subdomain
  $groupName = get_bidx_subdomain();

  $body = array(
    'username' => $username,
    'password' => $password
  );

  //Check if Username and password and User logged in is 
  if ($username && $password) {
    // Check external bidx check for username and password credentials
    $url = 'session';
    //$url = 'http://test.bidx.net/api/v1/session?csrf=false&groupKey='.$groupName;
    $result = call_bidx_service($url, $body);

    // test $result['response'] and if OK do something with $result['body']
    $requestData = json_decode($result['body']);
    $responseCode = $result['response']['code'];

    switch ($responseCode) {
      case '401' :
        $ext_error = "wrongpw";
        $username = NULL;
        break;

      case '404' :
        $ext_error = "wrongusr";
        $username = NULL;
        break;

      case '200':
        $displayData = $requestData->data;
        $bidxAuthCookie = $result['cookies'][0];
        // If we get data in return
        if (!$ext_error && isset($displayData)) {    //create/update wp account from external database if login/pw exact match exists in that db
          $process = TRUE;

          //check role and assign logged in wp username if present.
          if (!empty($displayData->roles)) {
            $roleArray = $displayData->roles;
            if (in_array("SysAdmin", $roleArray)) {
              //$username = 'admin';
              $username = 'admin';
            }
            else if (in_array(array("GroupAdmin", "GroupOwner"), $roleArray)) {
              $username = $groupName . 'groupadmin';
            }
            else if (in_array("Member", $roleArray)) {
              $username = $groupName . 'subscriber';
            }
          }
          else {
            $username = NULL;
            $ext_error = "wrongrole";
            $process = FALSE;
          }


          //only continue, if login/pw is valid AND, if used, proper role perms
          if ($process) {
            //echo $username;exit;
            //looks asdlike wp functions clean up data before entry, so I'm not going to try to clean out fields beforehand.
            if ($user_id = username_exists($username)) {   //just do an update
              // userdata will contain all information about the user
              $userdata = get_userdata($user_id);
              $user = set_current_user($user_id, $username);
              // this will actually make the user authenticated as soon as the cookie is in the browser
              wp_set_auth_cookie($user_id);
              //Set Cookie for Bidx
              setcookie($bidxAuthCookie->name, $bidxAuthCookie->value, $bidxAuthCookie->expires, $bidxAuthCookie->path, 'bidx.dev', FALSE, $bidxAuthCookie->httponly);

              // the wp_login action is used by a lot of plugins, just decide if you need it
              do_action('wp_login', $userdata->ID);
              // you can redirect the authenticated user to the "logged-in-page", define('MY_PROFILE_PAGE',1); f.e. first
              header("Location:" . get_page_link(MY_PROFILE_PAGE));
            }
          }
        }
        break;
    }
  }
}

//gives warning for login - where to get "source" login
function bidx_auth_warning() {
  echo "<p class=\"message\">" . get_option('bidx_error_msg') . "</p>";
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
function get_bidx_subdomain($echo = false) {
  $hostAddress = explode('.', $_SERVER ["HTTP_HOST"]);
  if (is_array($hostAddress)) {
    if (eregi("^www$", $hostAddress [0])) {
      $passBack = 1;
    }
    else {
      $passBack = 0;
    }
    if ($echo == false) {
      return ($hostAddress [$passBack]);
    }
    else {
      echo ($hostAddress [$passBack]);
    }
  }
  else {
    return (false);
  }
}

function bidx_errors() {
  global $error;
  global $ext_error;
  if ($ext_error == "notindb")
    return "<strong>ERROR:</strong> Username not found.";
  else if ($ext_error == "wrongrole")
    return "<strong>ERROR:</strong> You don't have permissions to log in.";
  else if ($ext_error == "wrongpw")
    return "<strong>ERROR:</strong> Invalid password.";
  else if ($ext_error == "wrongusr")
    return "<strong>ERROR:</strong> User not found.";
  else if ($ext_error == "nocurl")
    return "<strong>ERROR:</strong> Bidx needs the CURL PHP extension. Contact your server adminsitrator!";
  else if ($ext_error == "nohttps")
    return "<strong>ERROR:</strong> Protocol https not supported or disabled in libcurl. Contact your server adminsitrator!";
  else if ($ext_error == "nojson")
    return "<strong>ERROR:</strong>Bidx needs the JSON PHP extension. Contact your server adminsitrator!";
  else
    return $error;
}

//hopefully grays stuff out.
function bidx_warning() {
  echo '<strong style="color:red;">Any changes made below WILL NOT be preserved when you login again. You have to change your personal information per instructions found in the <a href="../wp-login.php">login box</a>.</strong>';
}

//disables the (useless) password reset option in WP when this plugin is enabled.
function bidx_show_password_fields() {
  return 0;
}

/*
 * Disable functions.  Idea taken from http auth plugin.
 */

function disable_function_register() {
  $errors = new WP_Error();
  $errors->add('registerdisabled', __('User registration is not available from this site, so you can\'t create an account or retrieve your password from here. See the message above.'));
  ?></form><br /><div id="login_error">User registration is not available from this site, so you can't create an account or retrieve your password from here. See the message above.</div>
  <p id="backtoblog"><a href="<?php bloginfo('url'); ?>/" title="<?php _e('Are you lost?') ?>"><?php printf(__('&larr; Back to %s'), get_bloginfo('title', 'display')); ?></a></p>
  <?php
  exit();
}

function disable_function() {
  $errors = new WP_Error();
  $errors->add('registerdisabled', __('User registration is not available from this site, so you can\'t create an account or retrieve your password from here. See the message above.'));
  login_header(__('Log In'), '', $errors);
  ?>
  <p id="backtoblog"><a href="<?php bloginfo('url'); ?>/" title="<?php _e('Are you lost?') ?>"><?php printf(__('&larr; Back to %s'), get_bloginfo('title', 'display')); ?></a></p>
  <?php
  exit();
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Check Bidx Get Redirect
 *
 * @param bool $echo
 */
function get_redirect($url) {
  $redirectUrl = NULL;
  switch ($url) {
    case 'members':
      //$redirectUrl = '/group-creation-success';
      break;
    case 'groups':
      //$redirectUrl = '/group-creation-success';
      break;
    case 'sessions':
      //$redirectUrl =  '';
      break;
  }
  return $redirectUrl;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Add timeout for Bidx Services
 *
 * @param bool $echo
 */
function bidx_request_timeout_time($time) {
  $time = 50; //new number of seconds

  return $time;
}

add_filter('http_request_timeout', 'bidx_request_timeout_time');

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Check Bidx Service Response
 *
 * @param bool $echo
 */
function bidx_wordpress_post_action($result, $url, $body) {

  $requestData = json_decode($result['body']);
  $httpCode = $result['response']['code'];
  $redirectUrl = NULL;

  //Check the Http response and decide the status of request whether its error or ok

  if ($httpCode >= 200 && $httpCode < 300) {
    //Keep the real status
    //$requestData->status = 'ERROR';
  }
  else if ($httpCode >= 300 && $httpCode < 400) {
    $requestData->status = 'ERROR';
  }
  else {
    $requestData->status = 'ERROR';
  }

  //Write logic what If error and what if its ok (ex Redirect)
  switch ($url) {
    case 'groups' :

      //Delete the wordpress group site if Bidx says its Error
      global $current_site;
      $site_id = $body['response']['site_id'];
      $user_id = $body['response']['user_id'];
      if (strtolower($requestData->status) == 'error') {
        //Delete Wordpress Site
        if ($site_id != '0' && $site_id != $current_site->blog_id) {
          wpmu_delete_blog($site_id, true);
        }
        //Delete Wordpress User
        if ($user_id != '0' && $user_id != '1') {
          wpmu_delete_user($user_id);
        }
      }
      else {

        $domain = $body['response']['domain'];
        $domain = 'site1.bidx.dev';
        //$qparam = base64_encode('name='.$requestData->data->name.'&gid='.$requestData->data->currentGroupId.'&uname='.$requestData->data->username);
        // $requestData->redirect = 'http://'.$domain.'/registration?bname='.$requestData->data->name.'&bgid='.$requestData->data->currentGroupId.'&buname='.$requestData->data->username;
        $requestData->submit = 'http://' . $domain . '/registration/';
      }

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
function create_bidx_wp_site($groupName, $email) {
  global $wpdb, $current_site;
  $status = 'ok';
  if (preg_match('|^([a-zA-Z0-9-])+$|', $groupName))
    $groupName = strtolower($groupName);

  $newdomain = $groupName . '.' . preg_replace('|^www\.|', '', $current_site->domain);
  $path = $current_site->path;

  $password = 'N/A';
  //$user_id = email_exists($email);
  $userName = $groupName . 'groupadmin';
  $user_id = wpmu_create_user($userName, $password, $email);
  if (false == $user_id) {
    //wp_die(__('There was an error creating the user.'));
    $status = 'error';
    $text = 'here was an error creating the user.';
  }
  else {
    $wpdb->hide_errors();
    $id = wpmu_create_blog($newdomain, $path, $title, $user_id, array('public' => 1), $current_site->id);
    $wpdb->show_errors();
    if (!is_wp_error($id)) {
      if (!get_user_option('primary_blog', $user_id)) {
        update_user_option($user_id, 'primary_blog', $id, true);
      }
      $content_mail = sprintf(__('New site created by %1$s

Address: %2$s
Name: %3$s'), $current_user->user_login, get_site_url($id), stripslashes($title));
      //wp_mail(get_site_option('admin_email'), sprintf(__('[%s] New Site Created'), $current_site->site_name), $content_mail, 'From: "Site Admin" <' . get_site_option('admin_email') . '>');
      wp_mail('altaf.samnani@bidnetwork.org', sprintf(__('[%s] New Site Created'), $current_site->site_name), $content_mail, 'From: "Site Admin" <' . get_site_option('admin_email') . '>');

      $text = 'New website created';
    }
    else {
      //wp_die($id->get_error_message());
      $status = 'error';
      $text = $id->get_error_message();
    }
  }

  $siteCreation = array('status' => $status,
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
 * Registratin Ajax Call
 *
 * @param String $url
 */
function bidx_wordpress_pre_action($url = 'default', $file_values = NULL) {

  $params = $_POST;

  switch ($url) {

    case 'groups' :
      $params['name'] = $_POST['groupName'];

      //Create Wordpress group.bidx.net website
      $wp_site = create_bidx_wp_site($params['name'], $params['username']);
      $response = array('status' => $wp_site['status'],
        'text' => $wp_site['text'],
        'site_id' => $wp_site['site_id'],
        'user_id' => $wp_site['user_id'],
        'domain' => $wp_site['domain']
      );
      $params['domain'] = $wp_site['group_domain'];
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
    
    case 'logo' :
      $response['status'] = 'ok';
      $params['path']    = 'logo';
      $params['purpose'] = 'logo';
      $params['fileContent'] = '@'.$file_values["tmp_name"];
      break;
    
    default:
      $response['status'] = 'ok';
      break;
  }

  //Unset this variables this doesnt need to be send
  unset($params['apiurl']);
  unset($params['apimethod']);

  //Replace dynamice dynname to name as it is created thrugh form.js on fly as a hidden field so js doesnt accept name=name
  if (isset($params['dynname'])) {
    $params['name'] = $params['dynname'];
    unset($params['dynname']);
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
add_action('wp_ajax_nopriv_bidx_request', 'ajax_submit_action'); // ajax for logged in users

function ajax_submit_action() {

  $url = $_POST['apiurl'];
  $method = $_POST['apimethod'];

  //1 Do wordpress stuff and get the params
  $body = bidx_wordpress_pre_action($url);

  if ($body['response']['status'] == 'ok') {

    //2 Talk to Bidx Api and get the response
    $params = $body['params'];
    $result = call_bidx_service($url, $params, $method);

    //3 Check validation error and include redirect logic
    $requestData = bidx_wordpress_post_action($result, $url, $body);
  }
  else {
    $requestData->status = $body['response']['status'];
    $requestData->text = $body['response']['text'];
  }

  $jsonData = json_encode($requestData);
  echo $jsonData;

  die(); // stop executing script
}

function bidx_register_response($requestEntityMember, $requestEntityGroup, $requestGroupData) {

  $requestData = NULL;

  if ($requestEntityMember->status == 'ERROR') {
    $requestData = $requestEntityMember;
  }
  else if ($requestEntityGroup->status == 'ERROR') {
    $requestData = $requestEntityGroup;
  }
  else if ($requestGroupData->status == 'ERROR') {
    $requestData = $requestGroupData;
  }
  else {
    $requestData->status = 'OK';
    $requestData->submit = '/group-creation-success';
    //Logs the user in and show the group dashboard
  }

  return $requestData;
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Upload Handler
 *
 * @param bool $echo
 */
add_action('wp_ajax_nopriv_file_upload', 'bidx_upload_action');
function bidx_upload_action() {
  $type = 'logo';
  echo "<pre>";
  print_r($_FILES);
  echo "</pre>";
  exit;
  foreach($_FILES as $file_name => $file_values) {

    switch( $file_values['type'] ) {

      case (preg_match("/^image/i", $file_values['type']) ? true : false ) :

        bidx_wordpress_pre_action($type,$file_values);
        echo "<pre>";
        print_r($file_values);
        echo "</pre>";
        exit;
        break;

      case 'imgupload' :
        echo 'imgupload';
        break;
    }

  }

  
}

/**
 * @author Altaf Samnani
 * @version 1.0
 *
 * Registratin Ajax Call
 *
 * @param bool $echo
 */
add_action('wp_ajax_nopriv_bidx_register', 'ajax_register_action');

function ajax_register_action() {

  $url = $_POST['apiurl'];
  $method = $_POST['apimethod'];

  //2 Edit Member Entity
  $bodyProfile = bidx_wordpress_pre_action('entityprofile');
  $paramsProfile = $bodyProfile['params'];

  $resultEntityMember = call_bidx_service('entity/' . $paramsProfile['creatorProfileId'], $paramsProfile, 'PUT');
  $requestEntityMember = bidx_wordpress_post_action($resultEntityMember, 'groupmembers', $bodyProfile);


  //2 Edit Group Entity
  $bodyGroup = bidx_wordpress_pre_action('entitygroup');
  $paramsGroup = $bodyGroup['params'];

  $resultEntityGroup = call_bidx_service('entity/' . $paramsGroup['groupProfileId'], $paramsGroup, 'PUT');
  $requestEntityGroup = bidx_wordpress_post_action($resultEntityGroup, 'groupmembers', $bodyGroup);

  //3 Edit Group Data
  $bodyGrpData = bidx_wordpress_pre_action();
  $paramsGrpData = $bodyGrpData['params'];
  $resultGrpData = call_bidx_service('groups/' . $paramsGrpData['id'], $paramsGrpData, 'PUT');
  $requestGrpData = bidx_wordpress_post_action($resultGrpData, 'groupmembers', $bodyGrpData);

  //exit;
  $requestData = bidx_register_response($requestEntityMember, $requestEntityGroup, $requestGrpData);


  $jsonData = json_encode($requestData);
  echo $jsonData;

  die(); // stop executing script
}

/* Assign theme/pages/metadata when site is created
 * Reference http://stackoverflow.com/questions/6890617/how-to-add-a-meta-box-to-wordpress-pages
 * @author Altaf Samnani
 * @version 1.0
 * @description  Assign theme/pages/metadata when site is created
 * Reference http://stackoverflow.com/questions/6890617/how-to-add-a-meta-box-to-wordpress-pages
 *
 * Add Custom Page attributes
 *
 * @param bool $echo
 */


add_action('wpmu_new_blog', 'assign_bidxgroup_theme_page');

function assign_bidxgroup_theme_page($blog_id) {
  global $wpdb;

  //Login to the site
  switch_to_blog($blog_id);
  // Action 1 Switch theme to assign
  switch_theme('bidx-group');

  //Action 2 Default Enable WP Scrapper Plugin
  $wpws_values = array('sc_posts' => 1, 'sc_widgets' => 1, 'on_error' => 'error_hide');

  update_option('wpws_options', $wpws_values);

  //Action 3 Enable Plugin Bidx Api Services
  $result = activate_plugin('bidx-services/bidx-services.php');

  //Action 4 Add Default Bidx Pages to render
  $querystr = "SELECT wposts.*,wpostmeta2.meta_value as template_value
    FROM wp_posts AS wposts
    INNER JOIN wp_postmeta AS wpostmeta ON wpostmeta.post_id = wposts.ID
    LEFT JOIN wp_postmeta AS wpostmeta2 ON  wpostmeta2.post_id = wposts.ID AND wpostmeta2.meta_key = '_wp_page_template'
    WHERE wpostmeta.meta_key = 'page_group'
    AND wpostmeta.meta_value = '1'";

  $pages_to_create = $wpdb->get_results($querystr, OBJECT);

  foreach ($pages_to_create as $page) {

    unset($page->ID);
    unset($page->guid);
    /* Reference http://codex.wordpress.org/Function_Reference/wp_insert_post */
    $post_id = wp_insert_post($page);
    update_post_meta($post_id, '_wp_page_template', $page->template_value);
  }

  restore_current_blog();
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

add_action('add_meta_boxes', 'add_page_group_metabox');

function add_page_group_metabox() {
  add_meta_box('page-group-id', 'Group Page', 'group_callback', 'page', 'side', 'core');
}

function group_callback($post) {
  $values = get_post_custom($post->ID);
  $selected = isset($values['page_group']) ? $values['page_group'][0] : '';
  ?>
  <label class="screen-reader-text" for="page_group"><?php _e('Group page') ?></label>
  <select name="page_group" id="page_group">
    <option <?php echo ($selected == '1') ? 'selected' : '' ?> value='1'><?php _e('Yes'); ?></option>
    <option <?php echo ($selected == '0') ? 'selected' : '' ?> value='0'><?php _e('No'); ?></option>
  </select>
  <?php
}

add_action('save_post', 'page_group_save');

function page_group_save($post_id) {
  // Bail if we're doing an auto save
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
    return;

  // Probably a good idea to make sure your data is set

  if (isset($_POST['page_group']))
    update_post_meta($post_id, 'page_group', $_POST['page_group']);
}

/* End Add Page attribute whether you want to add page in Group site creation */


/* Login Start */
//add_action('wp_authenticate', 'bidx_auth_check_login', 1, 2);
//add_filter('login_errors', 'bidx_errors');
/* Login End */

//add_action('lost_password', 'disable_function');
//add_action('user_register', 'disable_function');
//add_action('register_form', 'disable_function_register');
//add_action('retrieve_password', 'disable_function');
//add_action('password_reset', 'disable_function');
//add_action('profile_personal_options','bidx_warning');

//add_filter('show_password_fields','bidx_show_password_fields');
//add_filter('login_message','bidx_auth_warning');

//register_activation_hook( __FILE__, 'bidx_auth_activate' );



//function add_query_vars($aVars) {
//$aVars[] = "bname"; // represents the name of the product category as shown in the URL
//$aVars[] = "bgid";
//$aVars[] = "buname";
//return $aVars;
//}
//
//// hook add_query_vars function into query_vars
//add_filter('query_vars', 'add_query_vars');

