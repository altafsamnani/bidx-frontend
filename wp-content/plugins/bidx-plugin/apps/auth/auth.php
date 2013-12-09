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

    static $deps = array ('jquery', 'bootstrap', 'underscore', 'backbone', 'json2', 'holder', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                        'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods', 'bidx-location','chosen','bidx-tagsinput','bidx-chosen');


	function __construct() {

		add_action( 'wp_enqueue_scripts', array( &$this, 'register_auth_bidx_ui_libs' ) );
	}

	/**
	 * Load the scripts and css belonging to this function
	 */
	function register_auth_bidx_ui_libs() {

        wp_register_script( 'registration',  plugins_url( 'static/js/group-registration.js',    __FILE__ ), array(), '20130501', TRUE );

        $deps = array_merge( self :: $deps, array( 'registration' ) );

		wp_register_script( 'auth', plugins_url( 'static/js/auth.js', __FILE__ ), $deps, '20130501', TRUE );
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

        $view->showRegisterLink = true;
        $view->showLoginLink = true;
        $render = $command;

        $view->groupNotification = (!empty($atts['name'])) ? $atts['name']: 'we';
		$view -> render( $render . '.phtml' );

	}
}

?>
