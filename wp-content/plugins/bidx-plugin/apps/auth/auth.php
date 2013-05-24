<?php
/**
 * Authentication and registration content loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class auth {

	/**
	 * Constructor
	 */
	function __construct() {
		add_action( 'wp_enqueue_scripts', array( &$this, 'register_auth_bidx_ui_libs' ) );
	}

	/**
	 * Load the scripts and css belonging to this function
	 */
	function register_auth_bidx_ui_libs() {
		wp_register_script( 'auth', plugins_url( 'static/js/auth.js', __FILE__ ), array('bootstrap'), '20130501', TRUE );
		wp_register_style( 'auth', plugins_url( 'static/css/auth.css', __FILE__ ), array('bootstrap','bootstrap-responsive'), '20130501', 'all' );
	}
	
	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */
	function load($atts) {
		
		
		return file_get_contents ( BIDX_PLUGIN_DIR . '/search/static/templates/default.html' );
	}
}

?>