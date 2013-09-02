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

	static $deps = array('jquery', 'bootstrap',  'bidx-location', 'bidx-utils', 'bidx-form', 'bidx-api-core');

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
		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/group/templates/' );
		$view -> sessionData = BidxCommon::$staticSession;

		//2. Service Group
		require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
		$groupSvc = new GroupService( );
		
		// 3. Determine the view needed
		$command = $atts['view'];

		switch ( $command ) {
			case "last-members" :
				$view->members = $groupSvc->getLatestMembers(  );
				return $view->render( 'last-members.phtml' );
			case "list-groups" :
				$view->groups = $groupSvc->getGroupDetails(  );
				return $view->render( 'group-list.phtml' );
			case "group-intro" :
				$view->group = $groupSvc->getGroupDetails(  );
				return $view->render( 'group-intro.phtml' );
			case "join-group":
				return $view->render( 'group-join.phtml' );
			case "group-header" :
        		$groupSvc->isRedirectCheck = false;
				$view->group = $groupSvc->getGroupDetails(  );
				return $view->render( 'group-header.phtml' );
			case "profile-dropDown" :
				return $view->render( 'profile-dropdown.phtml' );
			case "navbar" :
				return $view->render( 'navbar.phtml' );
			default :
				$view->groups = $groupSvc->getGroupDetails(  );
				return $view->render( 'group-list.phtml' );
		}
	}

}
?>
