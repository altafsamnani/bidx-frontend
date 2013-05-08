<?php
/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class businessplan {

	/**
	 * Constructor
	 */
	function __construct() {
		add_action( 'wp_enqueue_scripts', array( &$this, 'register_businessplan_bidx_ui_libs' ) );
	}

	/**
	 * Load the scripts and css belonging to this function
	 */
	function register_businessplan_bidx_ui_libs() {
		wp_register_script( 'businessplan', plugins_url( 'static/js/businessplan.js', __FILE__ ), array('bootstrap'), '20130501', TRUE );
		wp_register_style( 'businessplan', plugins_url( 'static/css/businessplan.css', __FILE__ ), array('bootstrap','bootstrap-responsive'), '20130501', 'all' );
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