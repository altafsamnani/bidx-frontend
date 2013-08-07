<?php
/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class dashboard {

	static $deps = array( 'bidx-common' );

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

		wp_register_script( 'dashboard', plugins_url( 'static/js/dashboard.js', __FILE__ ), self::$deps, '20130715', TRUE );
        wp_register_style( 'dashboard', plugins_url( 'static/css/dashboard.css', __FILE__ ),  array(), '20130715', TRUE );/*should load mail css, not all other css files from other apps*/
        wp_enqueue_style('dashboard');
	}

	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */

	function load($atts) {
		//return file_get_contents ( BIDX_PLUGIN_DIR . '/dashboard/static/templates/default.html' );

	    /* 1 Template Rendering */
	    require_once(BIDX_PLUGIN_DIR . '/templatelibrary.php');
	    $view = new TemplateLibrary(BIDX_PLUGIN_DIR . '/dashboard/templates/');
	    $view -> sessionData = BidxCommon::$staticSession;

		//2. Service Group
		//require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
		//$groupSvc = new GroupService( );

		// 3. Determine the view needed
		$command = $atts['view'];

		switch ($command) {
			case 'my-dashboard':
				$template = 'my-dashboard.phtml';
				break;
			case 'investor-dashboard':
				$template = 'investor-dashboard.phtml';
				break;
			default:
				$template = 'my-dashboard.phtml';
				break;
		}
		$view->render($template);



	}


}

?>