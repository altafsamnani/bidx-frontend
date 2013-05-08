<?php
/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class dashboard {

	/**
	 * Constructor
	 */
	function __construct() {
		add_action( 'wp_enqueue_scripts', array( &$this, 'register_dashboard_bidx_ui_libs' ) );
	}

	/**
	 * Register scripts and styles
	 */
	function register_dashboard_bidx_ui_libs()
	{
		wp_register_script( 'dashboard', plugins_url( 'static/js/dashboard.js', __FILE__ ), array('bootstrap'), '20130501', TRUE );	
		wp_register_style( 'dashboard', plugins_url( 'static/css/dashboard.css', __FILE__ ), array('bootstrap','bootstrap-responsive'), '20130501', 'all' );
	}

	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */
	function load($atts) {
		return file_get_contents ( BIDX_PLUGIN_DIR . '/dashboard/static/templates/default.html' );
	}
}

?>