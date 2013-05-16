<?php
/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class group {

	static $deps = array('jquery', 'jqueryui', 'bootstrap', 'underscore', 'backbone', 'json2', 'bidx-fileupload', 'bidx-form', 'bidx-form-element', 'bidx-location', 'bidx-utils', 'bidx-country-autocomplete', 'bidx-api-core');
	
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
		wp_register_script( 'group', plugins_url( 'static/js/group.js', __FILE__ ),  self :: $deps, '20130501', TRUE );
		wp_register_style( 'group', plugins_url( 'static/css/group.css', __FILE__ ), array(), '20130501', 'all' );
		wp_enqueue_style( 'group' );
	}

	/**
	 * Load the content.
	 * The search is a static page where the content is loaded dynamically from the UI.
	 * Dynamic action needs to be added here
	 * @param $atts 
	 */
	function load($atts) {

	    /* 1 Template Rendering */
	     require_once(BIDX_PLUGIN_DIR .'/templatelibrary.php');
	     $view = new TemplateLibrary(BIDX_PLUGIN_DIR.'/group/static/templates/');
	    
	    return $view->render('lastMembers.phtml');
	     
		//return $view->render('groupList.phtml'); 
	}
}
?>
