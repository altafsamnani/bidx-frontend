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
 *
 *
 */
class Bidx_Admin_Page {
	var $hook;
	var $title;
	var $menu;
	var $permissions;
	var $slug;
	var $page;

	/**
	 * Constructor class for the Simple Admin Metabox
	 * @param $hook - (string) parent page hook
	 * @param $title - (string) the browser window title of the page
	 * @param $menu - (string)  the page title as it appears in the menuk
	 * @param $permissions - (string) the capability a user requires to see the page
	 * @param $slug - (string) a slug identifier for this page
	 * @param $body_content_cb - (callback)  (optional) a callback that prints to the page, above the metaboxes. See the tutorial for more details.
	 */
	function __construct( $hook, $title, $menu, $permissions, $slug, $body_content_cb='__return_true' ){
		$this->hook = $hook;
		$this->title = $title;
		$this->menu = $menu;
		$this->permissions = $permissions;
		$this->slug = $slug;
		$this->body_content_cb = $body_content_cb;

		/* Add the page */
		add_action( 'admin_menu', array( $this,'add_page' ) );
		
		$this -> addGoogleCharts();
	}


	/**
	 * Adds the custom page.
	 * Adds callbacks to the load-* and admin_footer-* hooks
	*/
	function add_page( ){

		/* Add the page */
		$this->page = add_submenu_page( $this->hook,
										$this->title, 
										$this->menu, 
										$this->permissions,
										$this->slug,  
										array($this,'render_page'),
										1);

		/* Add callbacks for this screen only */
		add_action('load-'.$this->page,  array($this,'page_actions'),9);
		add_action('admin_footer-'.$this->page,array($this,'footer_scripts'));
		add_action('wp_enqueue_scripts', array($this, 'addGoogleCharts') );
	}

	/**
	 * Prints the jQuery script to initiliase the metaboxes
	 * Called on admin_footer-*
	 * 
	*/
	function footer_scripts( ){
		?>
 			<script>jQuery(document).ready(function(){ postboxes.add_postbox_toggles(pagenow); });</script>	
		<?php
	}

   /**
	* Actions to be taken prior to page loading. This is after headers have been set.
    * call on load-$hook
	* This calls the add_meta_boxes hooks, adds screen options and enqueues the postbox.js script.   
	*/
	function page_actions( ){
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
	function render_page(){
		?>
		 <div class="wrap">

			<?php screen_icon(); ?>

			 <h2> <?php echo esc_html($this->title);?> </h2>

			<form name="my_form" method="post">  
				<input type="hidden" name="action" value="some-action">
				<?php wp_nonce_field( 'some-action-nonce' );

				/* Used to save closed metaboxes and their order */
				wp_nonce_field( 'meta-box-order', 'meta-box-order-nonce', false );
				wp_nonce_field( 'closedpostboxes', 'closedpostboxesnonce', false ); ?>

				<div id="poststuff">
		
					 <div id="post-body" class="metabox-holder columns-<?php echo 1 == get_current_screen()->get_columns() ? '1' : '2'; ?>"> 

						  <div id="post-body-content">
							<?php call_user_func( $this->body_content_cb ); ?>
						  </div>    

						  <div id="postbox-container-1" class="postbox-container">
						        <?php do_meta_boxes( '', 'side', null ); ?>
						  </div>    

						  <div id="postbox-container-2" class="postbox-container">
						        <?php do_meta_boxes( '', 'normal', null );  ?>
						        <?php do_meta_boxes( '', 'advanced', null ); ?>
						  </div>	     					

					 </div> <!-- #post-body -->
				
				 </div> <!-- #poststuff -->

	      		  </form>			

		 </div><!-- .wrap -->
		<?php
	}
	
	/**
	 * Loads the Google basis. Might be useful for everything instead of loading Google Maps only
	 * load them when needed by Javascript.
	 */
	public function addGoogleCharts() {
		wp_enqueue_script ('js-api', '//www.google.com/jsapi', array (), '20140620', TRUE);
		//include generic setup class file with all the specifics in it.!!!
	}	

}

	/* Example Usage */

	//Create a page
	$admin_mon = new Bidx_Admin_Page('edit.php',
									__('Monitoring','domain'),
									__('Monitoring','domain'), 
									'editor',
									'bidx_monitoring_page',
									'admin_body_content');

	//Define the body content for the page (if callback is specified above)
	function admin_body_content(){
		?>
		<p>Monitoring page contains the latest status of your portal.<p>
	<?php
	}

	//Add metaboxes to the page
	add_action('add_meta_boxes','sh_example_metaboxes');
	
	function sh_example_metaboxes(){
		add_meta_box( 'example1', __('Registrations','bidx-plugin'), 'analytics_metabox', $admin_mon->page, 'normal', 'high' );
		add_meta_box( 'example2', __('Business Summaries','bidx-plugin'), 'analytics_metab00x', $admin_mon->page, 'normal', 'high' );	
		add_meta_box( 'example3', __('User Roles','bidx-plugin'), 'analytics_metab00x', $admin_mon->page, 'side' ,  'high' );
	}

	function analytics_metab00x(){
		?>
		Plokplokplok
		<?php 
	}	
	
	//Define the insides of the metabox
	//create an analytics metabox
	//initialize
	
	function analytics_metabox(){
		//generate unique identifier
		?>
		<script type="text/javascript">
		google.load("visualization", "1", {packages:["corechart"]});
		google.setOnLoadCallback(drawChart);
		
		function drawChart() {
	        var data = google.visualization.arrayToDataTable([
	          ['week', 'Registrations', 'Deregistrations'],
	          ['week 22',  90,      2],
	          ['week 23',  160,     6],
	          ['week 24',  180,     6],
	          ['week 25',  190,     9]
	        ]);
	
	        var options = {
	          title: 'Registrations'
	        };

	        var chart = new google.visualization.LineChart(document.getElementById('example1'));
	        chart.draw(data, options);
        </script>     
		<?php
	}