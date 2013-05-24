<?php
/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * 
 * The data is retrieved client side, so this app just returned preconfigured search views.
 * 
 * Setting the query (attribute query=):
 * The query, part of the GET request on the url can be added here.
 * This should contain everything on the querystring including q= / fq= etc.
 * 
 * Supported views (attribute view=):
 * - default : show the big full screen search
 * - listView : list overview vertical
 * - cardView : list of cards, 3 per row horizontal
 * - mapView  : plot the result in a Google Maps view
 * 
 * @author Jaap Gorjup
 * @version 1.0
 */
class search {
	// dependencies : should be centralized!
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
		wp_register_script( 'search', plugins_url( 'static/js/search.js', __FILE__ ),  self :: $deps, '20130501', TRUE );
//		wp_register_style( 'search', plugins_url( 'static/css/search.css', __FILE__ ), array('bootstrap','bootstrap-responsive'), '20130501', 'all' );
	}

	/**
	 * Load the content.
	 * The search is a static page where the content is loaded dynamically from the UI.
	 * Dynamic action needs to be added here
	 * @param $atts 
	 */
	function load($atts) {
	
		// 1. Template Rendering
		require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/search/static/templates/' );
		
		//2. Copy data
		if (in_array('q', $atts)) {
			$view -> query = $atts['q'];
		}
		
		// 3. Determine the view needed
		if (in_array('q', $atts)) {
			$command = $atts['view'];
		} else {
			$command = '';
		}
		switch ( $command ) {
			case "cardView" :
				return $view->render( 'cardView.phtml' );
			case "listView" :
				return $view->render( 'listView.phtml' );
			case "mapView" :
				return $view->render( 'mapView.phtml' );
			default :
				return $view->render( 'default.phtml' );
		}		
	}
}
?>
