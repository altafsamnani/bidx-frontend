<?php
/*
Plugin Name: Bidx Login Authentication
Description: Used to externally authenticate WP users with Bidx.
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
if ( !function_exists('htmlspecialchars_decode') )
{
    function htmlspecialchars_decode($text)
    {
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

function bidx_auth_check_login($username, $password) {
  require_once('./wp-includes/registration.php');

  //Get the group name from  Subdomain
  $groupName = get_subdomain( );

  $body = array(
    'username' => $username,
    'password' => $password
  );

  //Check if Username and password and User logged in is 
  if ($username && $password) {
    // Check external bidx check for username and password credentials
    $authUsername = 'bidx'; // Bidx Auth login
    $authPassword = 'gobidx'; // Bidx Auth password
    $headers = array('Authorization' => 'Basic ' . base64_encode("$authUsername:$authPassword"));

    $url = 'http://test.bidx.net/api/v1/session?csrf=false&groupKey=bidxTestGroupKey';
    //$url = 'http://test.bidx.net/api/v1/session?csrf=false&groupKey='.$groupName;
    $request = new WP_Http;
    $result = $request->request($url, array('method' => 'POST',
      'body' => $body,
      'headers' => $headers
        ));
    // test $result['response'] and if OK do something with $result['body']

    $requestData = json_decode($result['body']);
    $displayData = $requestData->data;

    // If we get data in return
    if (!$ext_error && isset($displayData)) {    //create/update wp account from external database if login/pw exact match exists in that db
      $process = TRUE;

      //check role and assign logged in wp username if present.
      if (!empty($displayData->roles)) {
        $roleArray = $displayData->roles;
        if (in_array("SysAdmin", $roleArray)) {
          //$username = 'admin';
          $username = $groupName.'groupadmin';
        } else if(in_array(array("GroupAdmin","GroupOwner"), $roleArray)) {
          $username = $groupName.'groupadmin';
        } else if(in_array("Member", $roleArray)) {
          $username = $groupName.'subscriber';
        }
      }
      else {
        $username = NULL;
        $ext_error = "wrongrole";
        $process = FALSE;
      }
 
      //only continue, if login/pw is valid AND, if used, proper role perms
      if ($process) {

        //looks like wp functions clean up data before entry, so I'm not going to try to clean out fields beforehand.
        if ($user_id = username_exists($username)) {   //just do an update     
         // userdata will contain all information about the user
         $userdata = get_userdata($user_id);
         $user = set_current_user($user_id,$username);
         // this will actually make the user authenticated as soon as the cookie is in the browser
         wp_set_auth_cookie($user_id);
         // the wp_login action is used by a lot of plugins, just decide if you need it
         do_action('wp_login',$userdata->ID);
         // you can redirect the authenticated user to the "logged-in-page", define('MY_PROFILE_PAGE',1); f.e. first
         header("Location:".get_page_link(MY_PROFILE_PAGE));
        }
      }
    }
    else { //username exists but wrong password...
      global $ext_error;
      $ext_error = "wrongpw";
      $username = NULL;
    }
  }
}

//gives warning for login - where to get "source" login
function bidx_auth_warning() {
   echo "<p class=\"message\">".get_option('bidx_error_msg')."</p>";
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
function get_subdomain($echo = false) {
	$hostAddress = explode ( '.', $_SERVER ["HTTP_HOST"] );
	if (is_array ( $hostAddress )) {
		if (eregi ( "^www$", $hostAddress [0] )) {
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

function bidx_errors() {
	global $error;
	global $ext_error;
	if ($ext_error == "notindb")
		return "<strong>ERROR:</strong> Username not found.";
	else if ($ext_error == "wrongrole")
		return "<strong>ERROR:</strong> You don't have permissions to log in.";
	else if ($ext_error == "wrongpw")
		return "<strong>ERROR:</strong> Invalid password.";
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
		<p id="backtoblog"><a href="<?php bloginfo('url'); ?>/" title="<?php _e('Are you lost?') ?>"><?php printf(__('&larr; Back to %s'), get_bloginfo('title', 'display' )); ?></a></p>
	<?php
	exit();
}

function disable_function() {
	$errors = new WP_Error();
	$errors->add('registerdisabled', __('User registration is not available from this site, so you can\'t create an account or retrieve your password from here. See the message above.'));
	login_header(__('Log In'), '', $errors);
	?>
	<p id="backtoblog"><a href="<?php bloginfo('url'); ?>/" title="<?php _e('Are you lost?') ?>"><?php printf(__('&larr; Back to %s'), get_bloginfo('title', 'display' )); ?></a></p>
	<?php
	exit();
}



//add_action('admin_init', 'bidx_auth_init' );
//add_action('admin_menu', 'bidx_auth_add_menu');
add_action('wp_authenticate', 'bidx_auth_check_login', 1, 2 );
add_action('lost_password', 'disable_function');
add_action('user_register', 'disable_function');
add_action('register_form', 'disable_function_register');
add_action('retrieve_password', 'disable_function');
add_action('password_reset', 'disable_function');
//add_action('profile_personal_options','bidx_warning');
add_filter('login_errors','bidx_errors');
//add_filter('show_password_fields','bidx_show_password_fields');
//add_filter('login_message','bidx_auth_warning');

//register_activation_hook( __FILE__, 'bidx_auth_activate' );
