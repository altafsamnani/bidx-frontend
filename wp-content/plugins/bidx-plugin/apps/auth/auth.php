<?php
/**
 * Authentication and registration content loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @author Altaf Samnani (ajax functions)
 * @version 1.0
 */
class auth {

	/**
	 * Constructor
	 * Registers hooks for ajax requests and security related material
	 * Also registers the scripts for auth.
	 * @todo generalize auth js functions in auth.js
	 */
	function __construct() {
		add_action( 'wp_enqueue_scripts', array( &$this, 'register_auth_bidx_ui_libs' ) );
		// ajax for logged in users
		//add_action( 'wp_ajax_nopriv_bidx_request', array( &$this, 'ajax_submit_action' ) ); 
		// wordpress login override
		//add_action( 'wp_authenticate', array( &$this, 'ajax_submit_signin' ) );
		// ajax login override
		//add_action( 'wp_ajax_nopriv_bidx_signin', array( &$this, 'ajax_submit_signin' ) );
		// logout override
		//add_action( 'wp_logout', array( &$this, 'bidx_signout' ) );
	}

	/**
	 * Load the scripts and css belonging to this function
	 */
	function register_auth_bidx_ui_libs() {
		wp_register_script( 'auth', plugins_url( 'static/js/auth.js', __FILE__ ), array('bootstrap'), '20130501', TRUE );
		wp_register_style( 'auth', plugins_url( 'static/css/auth.css', __FILE__ ), array('bootstrap','bootstrap-responsive'), '20130501', 'all' );
	}
	
	/**
	 * This is called with the bidx_request ajax calls
	 */
	function ajax_submit_action() {
	
		$url = ( isset( $_POST['apiurl'] ) ) ? $_POST['apiurl'] : NULL;
		$method = ( isset( $_POST['apimethod'] ) ) ? $_POST['apimethod'] : NULL;
	
		//1 Do wordpress stuff and get the params
		$body = bidx_wordpress_pre_action( $url );
	
		if ( $body['response']['status'] == 'ok' ) {
	
			//2 Talk to Bidx Api and get the response
			$params = $body['params'];
			$result = call_bidx_service( $url, $params, $method );
	
			//3 Check validation error and include redirect logic
			$requestData = bidx_wordpress_post_action( $url, $result, $body );
		}
		else {
			$requestData->status = $body['response']['status'];
			$requestData->text = $body['response']['text'];
		}
	
		$jsonData = json_encode( $requestData );
		echo $jsonData;
	
		die(); // stop executing script
	}

	/**
	 * Handles login requests
	 */
	function ajax_submit_signin() {
	
		global $error;
	
		//Get the group name from  Subdomain
		$groupName = BidxCommon :: get_bidx_subdomain();
		$username = (isset($_POST['log'])) ? $_POST['log'] : NULL;
		$password = (isset($_POST['pwd'])) ? $_POST['pwd'] : NULL;
	
		if ( $username && $password ) {
			$body = array(
					'username' => $username,
					'password' => $password,
					'domain' => $groupName
			);
	
			//Check if Username and password and User logged in is
			if ( $username && $password ) {
				// Check external bidx check for username and password credentials
				$url = 'session';
				//$url = 'http://test.bidx.net/api/v1/session?csrf=false&groupKey='.$groupName;
				$result = call_bidx_service($url, $body);
	
				//3 Check validation error and include redirect logic
				$requestData = bidx_wordpress_post_action($url, $result, $body);
	
				$is_ajax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) AND
				strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
	
				if ($is_ajax) {
					$jsonData = json_encode($requestData);
					echo $jsonData;
					die(); // stop executing script
				}
				else {
	
					if ($requestData->status == 'ERROR') {
						$error = "<strong>ERROR:</STRONG>" . $requestData->text;
					}
					else {
	
						$text = ($requestData->redirect) ? wp_redirect($requestData->redirect) : 'Something wrong happened';
						$error = "<strong>ERROR:</STRONG> 122" . $text;
					}
				}
			}
		}
	}
	
	/**
	 * Signout the bidx user
	 */
	function bidx_signout() {
		BidxCommon :: clear_bidx_cookies();
		$params['domain'] = BidxCommon :: get_bidx_subdomain();
		call_bidx_service('session', $params, 'DELETE');
		wp_clear_auth_cookie();
	}	
	
	/**
	 * Function to block wordpress registration
	 * @todo: cleanup response
	 */
	function disable_function_register() {
		$errors = new WP_Error();
		$errors->add('registerdisabled', __('User registration is not available from this site, so you can\'t create an account or retrieve your password from here. See the message above.'));
		?></form><br /><div id="login_error">User registration is not available from this site, so you can't create an account or retrieve your password from here. See the message above.</div>
	  <p id="backtoblog"><a href="<?php bloginfo('url'); ?>/" title="<?php _e('Are you lost?') ?>"><?php printf(__('&larr; Back to %s'), get_bloginfo('title', 'display')); ?></a></p>
	  <?php
	  exit();
	}
	
	
	function bidx_register_response($requestEntityMember, $requestEntityGroup, $requestGroupData) {
	
		$requestData = new stdClass();
	
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
			$requestData->submit = '/member';
			//Logs the user in and show the group dashboard
		}
	
		return $requestData;
	}
	
	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */
	function load($atts) {
		// 1. Template Rendering
		require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/auth/static/templates/' );
		// 2. Determine the view needed 
		$command = $atts['view'];
        $type    = $atts['type'];
        
        switch($type) {
            case "login" :
                $view->type = "login";
                $render = 'standard-auth';
                $view->showRegisterLink = false;
                $view->showLoginLink = true;
                break;
            case "register" :
                $view->type = "register";
                $render = 'registration';
                $view->showLoginLink = false;
                break;
            default :
                $view->type = "login";
                $render = 'standard-auth';
                $view->showRegisterLink = true;
                $view->showLoginLink = true;
        }

		return $view -> render( $render . '.phtml' );

	}
}

?>