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

  $bidx_get_params = "";

  if (strtolower($method) == 'get') {
    $bidx_get_params = '&' . http_build_query($body);
    $body = NULL;
  }

  $url = 'http://test.bidx.net/api/v1/' . $urlservice . '?groupKey=bidxTestGroupKey&csrf=false' . $bidx_get_params;

  $headers = array('Authorization' => 'Basic ' . base64_encode("$authUsername:$authPassword"));
  $request = new WP_Http;
  $bidxMethod = (strtolower($method) == 'get') ? 'GET' : 'POST';

  $result = $request->request($url, array('method' => $bidxMethod,
    'body' => $body,
    'headers' => $headers
      ));

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

//function enqueue_scripts_styles_init() {
//wp_enqueue_script( 'ajax-script', get_stylesheet_directory_uri().'/js/script.js', array('jquery'), 1.0 ); // jQuery will be included automatically
// get_template_directory_uri() . '/js/script.js'; // Inside a parent theme
// get_stylesheet_directory_uri() . '/js/script.js'; // Inside a child theme
// plugins_url( '/js/script.js', __FILE__ ); // Inside a plugin
//wp_localize_script( 'ajax-script', 'ajax_object', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) ); // setting ajaxurl
//}
//add_action('init', 'enqueue_scripts_styles_init');
// Reference http://www.jackreichert.com/2013/03/24/using-ajax-in-wordpress-development-the-quickstart-guide/
// http://web-profile.com.ua/wordpress/dev/ajax-in-wordpress/
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
    case 'members' :
      //Delete the wordpress group site if Bidx says its Error
      global $current_site;
      $site_id = $body['response']['site_id'];

      if (strtolower($requestData->status) == 'error') {
        if ($site_id != '0' && $site_id != $current_site->blog_id) {
          wpmu_delete_blog($site_id, true);
        }
      } else {
        $requestData->redirect = '/group-creation-success';
      }     

      break;
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

  $siteCreation = array('status' => $status, 'text' => $text, 'site_id' => $id);
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
function bidx_wordpress_pre_action($url) {

  switch ($url) {

    case 'groups' :
      $params = array('username' => $_POST['username'],
        'name' => $_POST['groupName'],
        'password' => $_POST['password']);

      //Create Wordpress group.bidx.net website
      $wp_site = create_bidx_wp_site($params['name'], $params['username']);
      $response = array('status' => $wp_site['status'],
        'text' => $wp_site['text'],
        'site_id' => $wp_site['site_id']);
      break;

    case 'members' :
      $params = array('emailAddress' => $_POST['username'],
        'firstName' => $_POST['groupName'],
        'lastName' => 'group',
        'countryCode' => 'nl');

      //Create Wordpress group.bidx.net website
      $wp_site = create_bidx_wp_site($params['firstName'], $params['emailAddress']);
      $response = array('status' => $wp_site['status'],
        'text' => $wp_site['text'],
        'site_id' => $wp_site['site_id']);
      break;

    default:
      $params = $_POST;
      $response['status'] = 'ok';
      break;
  }
  
  unset($params['apiurl']);
  unset($params['apimethod']);

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

add_action('wp_ajax_nopriv_bidx_request', 'ajax_submit_action'); // ajax for logged in users


add_action('wpmu_new_blog', 'assign_bidxgroup_theme');

function assign_bidxgroup_theme($blog_id) {
switch_to_blog($blog_id);

// Do all the work
switch_theme('bidx-group');

restore_current_blog();

}
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
