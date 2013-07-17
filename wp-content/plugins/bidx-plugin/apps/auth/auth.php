<?php
/**
 * Authentication and registration content loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @author Altaf Samnani (ajax functions)
 * @version 1.0
 */
require_once( BIDX_PLUGIN_DIR . '/generic.php' );
class auth extends Generic{

	/**
	 * Constructor
	 * Registers hooks for ajax requests and security related material
	 * Also registers the scripts for auth.
	 * @todo generalize auth js functions in auth.js
	 */
	function __construct() {

		add_action( 'wp_enqueue_scripts', array( &$this, 'register_auth_bidx_ui_libs' ) );
	}

	/**
	 * Load the scripts and css belonging to this function
	 */
	function register_auth_bidx_ui_libs() {

        //$deps = array( 'bootstrap','memberprofile') ;
        $deps = $this->getWidgetJsDependency('auth');
        //$deps = array('bootstrap');
		wp_register_script( 'auth', plugins_url( 'static/js/auth.js', __FILE__ ), $deps, '20130501', TRUE );
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
		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/auth/static/templates/' );
		// 2. Determine the view needed
		$command = $atts['view'];
        $type    = $atts['type'];

        xdebug_break();

        switch ($command) {
            case "standard-auth":
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
                        $view->type = "default";
                        $render = 'standard-auth';
                        $view->showRegisterLink = true;
                        $view->showLoginLink = true;
                }
                break;

            default:
                $render = $command;
        }

        $view->groupNotification = (!empty($atts['name'])) ? $atts['name']: 'we';

		return $view -> render( $render . '.phtml' );

	}
}

?>
