<?php
/**
 * Group class loader.
 * Name lowercased for automatic loading.
 * Supported views:
 * - lastMembers : show a widget with the last members in the group
 * - listGroups : show a list of groups
 * - getGroupIntro : show the general group introduction data
 * - getGroupHeader : show the header data for a group containing image and name
 * - profileDropDown : show the dropdown with personal functions if a user is known in a group
 * 
 * @author Jaap Gorjup
 * @version 1.0
 */
class group {

	static $deps = array('jquery', 'bootstrap',  'bidx-location', 'bidx-utils', 'bidx-country-autocomplete', 'bidx-api-core');

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
	 * @param $atts attributes from the shorttag 
	 */
	function load($atts) {

		// 1. Template Rendering
		require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/group/static/templates/' );
		$view -> sessionData = BidxCommon::$staticSession;
		
		//2. Service Group
		require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
		$groupSvc = new GroupService( );
		
		// 3. Determine the view needed 
		$command = $atts['view'];
		
		switch ( $command ) {
			case "lastMembers" :
				$view->members = $groupSvc->getLatestMembers(  );
				return $view->render( 'lastMembers.phtml' );
			case "listGroups" :
				$view->groups = $groupSvc->getGroupDetails(  );
				return $view->render( 'groupList.phtml' );	
			case "getGroupIntro" :
				$view->group = $groupSvc->getGroupDetails(  );
				return $view->render( 'groupIntro.phtml' );	
			case "groupHeader" :
				$view->group = $groupSvc->getGroupDetails(  );
				return $view->render( 'groupHeader.phtml' );
			case "profileDropDown" :
				return $view->render( 'profileDropdown.phtml' );
			default :	
				$view->groups = $groupSvc->getGroupDetails(  );
				return $view->render( 'groupList.phtml' );
		}
	}
	
}
?>
