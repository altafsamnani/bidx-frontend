<?php
/**
 * Bidx Admin Page class.
 *
 *
 * The class takes the following arguments
 * - $hook 				- the hook of the 'parent' (menu top-level page).
 * - $title 			- the browser window title of the page
 * - $menu 				- the page title as it appears in the menu
 * - $permissions 		- the capability a user requires to see the page
 * - $slug 				- a slug identifier for this page
 * - $body_content_cb 	- (optional) a callback that prints to the page, above the metaboxes.
 *
 * Example use
 * $my_admin page = new Bidx_Admin_Page('my_hook','My Admin Page','My Admin Page', 'manage_options','my-admin-page')
 * Note - 
 * JsLibraries are registered in shortcode.php through admin_init & admin_print_footer_scripts plz refer that 
 *
 *
 */
require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' ); 

class Bidx_Admin_Page 
{
	public $hook;
	public $title;
	public $menu;
	public $permissions;
	public $slug;
	public $page;
	public $userId;
	public $view;
	static $deps 	= 	array (	'underscore' 
							  ,	'bidx-admin-api-core'
							  , 'bidx-admin-common'
							  , 'bidx-admin-data'
							  , 'bidx-admin-i18n'
							  , 'google-jsapi'
							  );
	/**
	 * Constructor class for the Simple Admin Metabox
	 * @param $hook - (string) parent page hook
	 * @param $title - (string) the browser window title of the page
	 * @param $menu - (string)  the page title as it appears in the menuk
	 * @param $permissions - (string) the capability a user requires to see the page
	 * @param $slug - (string) a slug identifier for this page
	 * @param $body_content_cb - (callback)  (optional) a callback that prints to the page, above the metaboxes. See the tutorial for more details.
	 */
	function __construct( $hook, $title, $menu, $permissions, $slug, $body_content_cb='__return_true' )
	{
		$this->hook 			= $hook;
		$this->title 			= $title;
		$this->menu 			= $menu;
		$this->permissions 		= $permissions;
		$this->slug 			= $slug;
		$this->body_content_cb 	= $body_content_cb;
		$this->userId  			= get_current_user_id();

		/* Add the page */
		add_action( 'admin_menu', array( $this,'add_page' ) );

		add_action('admin_enqueue_scripts', array(&$this, 'register_admin_bidx_ui_libs'));

		add_action('admin_print_footer_scripts', array($this,'footer_scripts'));

		$this->view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/admin/static/templates/' ); 		
		
	}

	/**
	 * Loads the Google basis. Might be useful for everything instead of loading Google Maps only
	 * load them when needed by Javascript.
	 */
	public function register_admin_bidx_ui_libs() 
	{
		//1. Load Js Libraries
		wp_register_script ('monitoring', plugins_url('static/js/monitoring.js', __FILE__), self::$deps, '20140620', TRUE);
	}


	public function footer_scripts( )
	{
		/* For postmetadata dragging and arrow close/open icon functionality */
 		echo "<script>jQuery(document).ready(function(){ postboxes.add_postbox_toggles(pagenow); });</script>";	
		
	}

	/**
	 * Adds the custom page.
	 * Adds callbacks to the load-* and admin_footer-* hooks
	*/
	function add_page( )
	{

		/* Add the page */
		$this->page = add_submenu_page( $this->hook,
										$this->title, 
										$this->menu, 
										$this->permissions,
										$this->slug,  
										array($this,'render_page'),
										1);

		/* Add callbacks for this screen only */
		add_action('load-'.$this->page,  array($this,'page_actions'));
	
	}		

   /**
	* Actions to be taken prior to page loading. This is after headers have been set.
    * call on load-$hook
	* This calls the add_meta_boxes hooks, adds screen options and enqueues the postbox.js script.   
	*/
	function page_actions( )
	{
		do_action( 'add_meta_boxes_'.$this->page, null );
		do_action( 'add_meta_boxes', $this->page, null );

		/* User can choose between 1 or 2 columns (default 2) */
		add_screen_option( 'layout_columns', array( 'max' => 2, 'default' => 2 ) );

		/* Enqueue WordPress' script for handling the metaboxes */
		wp_enqueue_script( 'postbox' ); 
	}

	/**
	 * Renders the page
	*/
	function render_page()
	{
		$this->view->title 				= 	$this->title;
		$this->view->userId 			= 	$this->userId;       	
		$this->view->body_content_cb 	= 	$this->body_content_cb;

        echo $this->view->render( 'main.phtml' );
	}
}

	//Create a page
	$admin_mon = new Bidx_Admin_Page('edit.php',
									__('Monitoring','domain'),
									__('Monitoring','domain'), 
									'editor',
									'bidx_monitoring_page',
									'admin_body_content');

	//Define the body content for the page (if callback is specified above)
	function admin_body_content()
	{
		//echo 'Monitoring page contains the latest status of your portal.';
	
	}

	//Add metaboxes to the page
	add_action('add_meta_boxes','sh_example_metaboxes');
	
	function sh_example_metaboxes()
	{

		add_meta_box( 'Geo Location', __('Geo Location','bidx-plugin'), 'analytics_geo', null, 'normal', 'default' );
		
		add_meta_box( 'User Data', __('User Data','bidx-plugin'), 'analytics_user', null, 'normal', 'default' );	

		add_meta_box( 'Roles', __('User Roles','bidx-plugin'), 'analytics_roles', null, 'side' ,  'default' );

		add_meta_box( 'Registraions', __('Registrations','bidx-plugin'), 'analytics_registrations', null, 'side', 'default' );
		
		add_meta_box( 'Summaries', __('Business Summaries','bidx-plugin'), 'analytics_summaries', null, 'side', 'default' );	
		
		/* Add metaboxes help */
		get_current_screen()->add_help_tab( array(
			'id'      => 'How to use ? ',
			'title'   => __('Overview'),
			'content' =>
			'<p>' . __( 'This report gives overview of Registered Users, Business Summaries, Geographical data' ) . '</p>' 			
		) );

		get_current_screen()->set_help_sidebar(
			'<p><strong>' . __( 'View more links:' ) . '</strong></p>' .
			'<p>' . __( '<a href="/wp-admin/admin.php?page=getting-started" target="_blank">Getting started</a>' ) . '</p>' .
			'<p>' . __( '<a href="/wp-admin/admin.php?page=group-settings" target="_blank">Group Settings</a>' ) . '</p>'
		);
	}

	function analytics_geo()
	{
		echo 'Inside analytics_geo';
	}	

	function analytics_user()
	{
		echo 'Inside analytics_user';
	}	

	function analytics_registrations()
	{
		echo 'Inside analytics_registrations';
	}	
	
	function analytics_roles()
	{
		//1. Template Rendering               
        $view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/admin/static/templates/' );        
        echo $view->render( 'monitoring.phtml' );		

	}

	function analytics_summaries()
	{
		echo 'Inside roles';				

	}
	?>