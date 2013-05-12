<?php
/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class search {

	/**
	 * Constructor
	 */
	function __construct() {
		add_action( 'wp_enqueue_scripts', array( &$this, 'register_search_bidx_ui_libs' ) ) ;	
	}
	
	/**
	 * Registers the search specific javascript and css files
	 */
	public function register_search_bidx_ui_libs() {
		wp_register_script( 'search', plugins_url( 'static/js/search.js', __FILE__ ), array('bootstrap'), '20130501', TRUE );
//		wp_register_style( 'search', plugins_url( 'static/css/search.css', __FILE__ ), array('bootstrap','bootstrap-responsive'), '20130501', 'all' );
	}

	/**
	 * Load the content.
	 * The search is a static page where the content is loaded dynamically from the UI.
	 * Dynamic action needs to be added here
	 * @param $atts 
	 */
	function load($atts) {
		return file_get_contents ( BIDX_PLUGIN_DIR . '/search/static/templates/default.html' );
	}
}
?>
