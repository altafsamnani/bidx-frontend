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
 * Supported views is for authenticated or not authenticated
 *
 * @author Jaap Gorjup
 * @version 1.0
 */
class search {
	// dependencies : should be centralized!
	static $deps = array('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2', 'bidx-utils', 'bidx-api-core');

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
		wp_register_style( 'search', plugins_url( 'static/css/search.css', __FILE__ ), array('bootstrap','bootstrap-responsive'), '20130501', 'all' );
		wp_enqueue_style( 'search' );
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
		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/search/templates/' );
		$sessionData = BidxCommon::$staticSession;

		// 2. Server side rendering anonymous
		require_once( BIDX_PLUGIN_DIR . '/../services/search-service.php' );
		$service = new SearchService( );

		if ( key_exists( 'q', $atts ) ) {
			$view -> query = $service -> cookQuery( $atts );
		} else if ( $_REQUEST['q'] != null ) {
			$view -> query = $service -> cookQuery( );
		}
		$view -> results = $service -> getSearchResults( $view -> query );


		// 3. Parse data for preparsing for presentations
		if ( !property_exists( $view -> results, 'data' ) ) {
			$data = array( 'numFound' => 0, 'error' => 'Communication failure' );
			$view -> results -> data = $data;
		}

		$rows = 10;
		if ( key_exists( 'rows', $view -> query ) ) {
			$rows = $view -> rows;
		}

		// 4. navigation previous
		if ( key_exists( 'start', $view -> query ) ) {
			if ( $view -> query['start'] > 0 ) {
				$backParam = $view -> query;
				$newIndex = $view -> query['start'] - $rows;
				if ($newIndex >= 0) {
					$backParam['start'] = $newIndex;
				}
				$view -> previousLink = BidxCommon:: buildHTTPQuery($backParam);
				Logger :: getLogger('search') -> trace( 'previousLink : ' . $view -> previousLink );
			}
		}
		//  5. navigation next
		$numFound = $view -> results -> data -> numFound;
		$start = $view -> results -> data -> start;
		if ($numFound - ( $start + $rows ) > 1 ) {
			$nextParam = $view -> query;
			$nextParam['start'] = $start + $rows;
			$view -> nextLink = BidxCommon:: buildHTTPQuery( $nextParam );
			Logger :: getLogger( 'search' ) -> trace( 'nextLink : ' . $view -> nextLink );
		}

		// 6. Determine the view needed
		if ( key_exists( 'view', $atts ) ) {
			$command = $atts['view'];
		} else {
			$command = 'listView';
		}

		return $view->render( $command.'.phtml' );
	}

}
?>
