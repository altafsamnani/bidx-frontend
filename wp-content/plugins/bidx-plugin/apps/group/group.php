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

	//static $deps = array( 'jquery', 'bootstrap', 'bidx-data', 'bidx-location', 'bidx-utils', 'bidx-api-core', 'bootstrap-paginator', 'jquery-fakecrop');
	static $deps = array ('bidx-tagsinput', 'jquery-fakecrop','bidx-common','bidx-data', 'bidx-i18n', 'jquery-validation',
      'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods','bidx-chosen', );
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
			case "latest-business-summaries" :
				$view->summaries = $groupSvc->getLatestBusinessSummaries();
				return $view->render( 'latest-business-summaries.phtml' );
				break;
			case "widget-latest-business-summaries" :
				$view->summaries = $groupSvc->getLatestBusinessSummaries();
				$view->panel 	 = isset( $atts[ "panel" ] ) ? true : false;
				$view->items 	 = $atts[ "items" ];
				$view->region 	 = $atts[ "region" ];
				return $view->render( 'widget-latest-business-summaries.phtml' );
				break;
			case "last-members":
				$sessionSvc = new SessionService( );

                /*************** Is investor or groupadmin *****************/
                $view->isLoggedInInvestor      = $sessionSvc->isHavingProfile ('bidxInvestorProfile');
                $view->isLoggedInGroupOwner    = $sessionSvc->isAdmin ( );

				$view->authenticated = isset( $atts[ "authenticated" ] ) ? $atts[ "authenticated" ] : "";
				$view->members 			= $groupSvc->getLatestMembers(  );
				return $view->render( 'last-members.phtml' );
				break;
			case "widget-latest-members":
				$sessionSvc = new SessionService( );

                /*************** Is investor or groupadmin *****************/
                $view->isLoggedInInvestor      = $sessionSvc->isHavingProfile ('bidxInvestorProfile');
                $view->isLoggedInGroupOwner    = $sessionSvc->isAdmin ( );
				$view->members 	= $groupSvc->getLatestMembers(  );
				$view->panel 	= isset( $atts[ "panel" ] ) ? true : false;
				$view->items 	= $atts[ "items" ];
				$view->region 	= $atts[ "region" ];
				return $view->render( 'widget-latest-members.phtml' );
				break;
			case "latest-news" :
				return $view->render( 'latest-news.phtml' );
				break;
			case "widget-latest-news" :
				$view->panel 	= isset( $atts[ "panel" ] ) ? true : false;
				$view->items 	= $atts[ "items" ];
				$view->region 	= $atts[ "region" ];
				return $view->render( 'widget-latest-news.phtml' );
				break;
			case "list-groups" :
				$view->groups = $groupSvc->getGroupDetails(  );
				return $view->render( 'group-list.phtml' );
				break;
			case "group-intro" :
				$view->group = $groupSvc->getGroupDetails(  );
				return $view->render( 'group-intro.phtml' );
				break;
			case "join-group":
				return $view->render( 'group-join.phtml' );
				break;
			case "group-header" :
        		$groupSvc->isRedirectCheck = false;
				$view->group = $groupSvc->getGroupDetails(  );
				return $view->render( 'group-header.phtml' );
				break;
			case "profile-dropDown" :
				return $view->render( 'profile-dropdown.phtml' );
				break;
			case "navbar" :
				return $view->render( 'navbar.phtml' );
				break;
			case "navbarshort" :
				return $view->render( 'navbarshort.phtml' );
				break;
			case "home" :

				$sessionData    = BidxCommon::$staticSession;
    			$entities       = isset( $sessionData->data->wp->entities ) ? $sessionData->data->wp->entities : null;
    			$authenticated=false;
    			if ( $sessionData->authenticated == 'true' ) {
        			$authenticated=true;
    			}

    			if ( $authenticated ) {
					return $view->render( 'group-home-private.phtml' );
    			} else {
					return $view->render( 'group-home-public.phtml' );
    			}
    			break;

			default :
				$view->groups = $groupSvc->getGroupDetails(  );
				return $view->render( 'group-list.phtml' );
		}
	}

}
?>
