<?php
/**
 * Authentication and registration content loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @author Altaf Samnani (ajax functions)
 * @author msp (js app)
 * @version 1.0
 */
class auth {

	/**
	 * Constructor
	 * Registers hooks for ajax requests and security related material
	 * Also registers the scripts for auth.
	 */

    static $deps = array ('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2', 'holder', 'bidx-form', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                        'jquery-validation', 'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');


	function __construct() {

		add_action( 'wp_enqueue_scripts', array( &$this, 'register_auth_bidx_ui_libs' ) );
	}

	/**
	 * Load the scripts and css belonging to this function
	 */
	function register_auth_bidx_ui_libs() {

        //$deps = array( 'bootstrap','memberprofile') ;
        //$deps = $this->getWidgetJsDependency('auth');
        //$deps = array('bootstrap');
		wp_register_script( 'auth', plugins_url( 'static/js/auth.js', __FILE__ ), self::$deps, '20130501', TRUE );
		wp_register_style( 'auth', plugins_url( 'static/css/auth.css', __FILE__ ), array('bootstrap','bootstrap-responsive'), '20130501', 'all' );
	}

	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */
	function load($atts) {
		// 1. Template Rendering
		require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/auth/templates/' );
		// 2. Determine the view needed

		$command = $atts['view'];
        $type    = array_key_exists( 'type', $atts ) ? $atts['type'] : null;

        // NOTE: because of changes in this App setup, the code below should be revised if Auth is used as a widget.
        // Default the $command is currently 'views' which holds all the views (login, password reset and register)

        switch ($command) {
            case "standard-auth":
                switch($type) {
                    case "login" :
                        $view->type = "login";
                        $render = 'views';
                        $view->showRegisterLink = false;
                        $view->showLoginLink = true;
                        break;
                    case "register" : //NOTE: #mattijs: I am under the impression that this block is not used??
                        $view->type = "register";
                        $render = 'registration';
                        $view->showLoginLink = false;
                        break;
                    default :
                        $view->type = "default";
                        $render = 'views';
                        $view->showRegisterLink = true;
                        $view->showLoginLink = true;
                        break;
                }
                break;

            default:
                $view->showRegisterLink = true;
                $view->showLoginLink = true;
                $render = $command;
        }

        $view->groupNotification = (!empty($atts['name'])) ? $atts['name']: 'we';

		$view -> render( $render . '.phtml' );

	}
}

?>
