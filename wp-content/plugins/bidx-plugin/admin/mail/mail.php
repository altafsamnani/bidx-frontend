<?php

class Bidx_Admin_Mail
{
	public 	$hook
	,		$title
	,		$menu
	,		$permissions
	,		$slug
	,		$page
	,		$userId
	,		$view
	,		$className
	, 		$deps 	= 	array (	'underscore'
							  ,	'bidx-admin-api-core'
							  , 'bidx-admin-common'
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
	function __construct( $options )
	{
		$this->hook 			=	 (string) $options->hook;
		$this->title    		=    (string) $options->title;
		$this->menu     		=    (string) $options->menu;
		$this->permissions 		=	 (string) $options->permissions;
		$this->slug 			=    (string) $options->slug;
		$this->userId  			=	 get_current_user_id();
		$this->className        =    strtolower($this->menu);
		$icon                   =    (string) $options->icon;

		$this->view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/../admin/mail/static/templates/' );

		$this->page = add_menu_page (	$this->title
									,	$this->menu
									,	$this->permissions
									,	$this->slug
									,	array($this,'render_page')
									,	$icon);


		//Add metaboxes to the page
		add_action('add_meta_boxes', array(&$this,'add_meta_box'));

		add_action('load-'.$this->page,  array(&$this,'page_actions'));

		/* Add callbacks for this screen only */
		add_action('admin_enqueue_scripts', array(&$this, 'register_admin_bidx_ui_libs'));

		//add_action('admin_print_footer_scripts-'.$this->page, array(&$this,'footer_scripts'));



	}
	/**
	* Actions to be taken prior to page loading. This is after headers have been set.
    * call on load-$hook
	* This calls the add_meta_boxes hooks, adds screen options and enqueues the postbox.js script.
	*/
	public function page_actions( )
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
	public function render_page()
	{

		$this->view->title 				= 	$this->title;
		$this->view->userId 			= 	$this->userId;
		$this->view->body_content_cb 	= 	$this->admin_body_content();
		$this->view->className          =   $this->className;

       // echo $this->view->render( 'main.phtml' );
	}

	/**
	 * Loads the Google basis. Might be useful for everything instead of loading Google Maps only
	 * load them when needed by Javascript.
	 */
	public function register_admin_bidx_ui_libs()
	{
		//1. Load Js Libraries
		wp_register_script ($this->className, plugins_url("static/js/{$this->className}.js", __FILE__), $this->deps, '20140620', TRUE);
	}


	public function footer_scripts( )
	{
		/* For postmetadata dragging and arrow close/open icon functionality */
 		echo "<script>jQuery(document).ready(function(){ postboxes.add_postbox_toggles(pagenow); });</script>";

	}

	//Define the body content for the page (if callback is specified above)
	public function admin_body_content()
	{
		//echo 'Monitoring page contains the latest status of your portal.';

	}

	public function add_meta_box()
	{

		add_meta_box( 'Geo Location', __('Geo Location','bidx-plugin'), array($this,'analytics_geo'), null, 'normal', 'default' );


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

	public function analytics_geo()
	{
        echo $this->view->render( 'main.phtml' );
	}



}
	?>