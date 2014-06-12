<?php 

require_once 'bidxcompetitionwidget.php';

/**
 * A Competition is a custom content type in a site containing a description, image and some data defined in custom fields.
 * When the custom type is edited the data can be entered. The link can lead to:
 * - simple competition (custom post + data)
 * - external competition link (custom post + links)
 * 
 * A competition post consists of:
 * Title - name of the competition
 * Post  - description of the competition
 * Image - image for the competition
 * Custom post fields (startdate, enddate and type)
 * 
 * TODO add localized po files in lang directory
 * FIXME store the results of the competition entries in the database
 * http://codex.wordpress.org/Creating_Tables_with_Plugins
 */
class BidxCompetition {
	
	/** constants for the competition **/
	const POST_TYPE = 'competition';
	const COMPETITION_START_KEY = 'startdate';
	const COMPETITION_END_KEY = 'enddate';
	const COMPETITION_TYPE_KEY = 'type';	
	
	public function __construct() {
		
		add_action( 'add_meta_boxes', array( $this, 'bidxcompetition_add_meta_box' ) );
		add_action( 'save_post', array( $this, 'bidxcompetition_save_meta_box_data' ) );
		
		add_action( 'init', array( $this, 'create_competition' ) );
		add_action( 'widgets_init', array( $this, 'create_competition_widget' ) );

	}
	
	/**
	 * List the competitions in this site
	 */
	static function get_competitions_list() {
		
		return new WP_Query( array( 'post_type' => 'competition' ) );
		
	}
	
	/**
	 * Create the custom post describing the competition
	 */
	function create_competition() {
		
		//TODO move all labelling local
		$labels = array(
				'name'                => _x( 'Competitions', 'Competitions', 'bidx_competition' ),
				'singular_name'       => _x( 'Competition', 'Competition', 'bidx_competition' ),
				'menu_name'           => __( 'Competitions', 'bidx_competition' ),
				'parent_item_colon'   => __( 'Parent Items:', 'bidx_competition' ),
				'all_items'           => __( 'All Competitions', 'bidx_competition' ),
				'view_item'           => __( 'View Competition', 'bidx_competition' ),
				'add_new_item'        => __( 'Add New Competition', 'bidx_competition' ),
				'add_new'             => __( 'Add New', 'bidx_competition' ),
				'edit_item'           => __( 'Edit Competition', 'bidx_competition' ),
				'update_item'         => __( 'Update Competition', 'bidx_competition' ),
				'search_items'        => __( 'Search Competition', 'bidx_competition' ),
				'not_found'           => __( 'Competition not found', 'bidx_competition' ),
				'not_found_in_trash'  => __( 'Competition not found in Trash', 'bidx_competition' ),
		);
		
		$args = array(
				'label'               => __( 'post_type', 'text_domain' ),
				'description'         => __( 'Competition definition', 'text_domain' ),
				'labels'              => $labels,
				'supports'            => array( ),
				'hierarchical'        => false,
				'public'              => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => true,
				'show_in_admin_bar'   => true,
				'menu_position'       => 40,
				'menu_icon'           => 'dashicons-awards',
				'can_export'          => true,
				'has_archive'         => true,
				'exclude_from_search' => true,
				'publicly_queryable'  => true,
				'capability_type'     => 'post',
		);
		register_post_type ( self::POST_TYPE, $args );
		
	}
	
	function create_competition_widget() {
		register_widget( 'BidxCompetitionCounterWidget' );	
		register_widget( 'BidxCompetitionRegistrationWidget' );
	}	

	function create_competition_shortcode() {

	}
	
	/**
	 * Currently nothing assigned
	 */
	function load() {
	
	}
		
	/**
	 * Hide the custom post type (do not remove)
	 */
	function unload() {
		add_action( 'widgets_init', 'remove_competition_widget' );
	}

	function remove_competition_widget() {
		unregister_widget( 'BidxCompetitionCounterWidget' );
		unregister_widget( 'BidxCompetitionRegistrationWidget' );
	}	
	
	/**
	 * Adds a box to the main column on the Post and Page edit screens.
	 */
	function bidxcompetition_add_meta_box() {
	
		add_meta_box(
			'bidxcompetition_sectionid',
			__( 'Competition Settings', 'myplugin_textdomain' ),
			array( $this, 'meta_box_callback' ),
			$POST_TYPE,
			'side'
		);
	}
	
	
	/**
	 * Prints the box content.
	 *
	 * @param WP_Post $post The object for the current post/page.
	*/
	function meta_box_callback( $post ) {
	
		// Add an nonce field so we can check for it later.
		wp_nonce_field( 'bidxcompetition_meta_box', 'bidxcompetition_meta_box_nonce' );
	
		/*
		 * Use get_post_meta() to retrieve an existing value
		* from the database and use the value for the form.
		*/
		$startdate = get_post_meta( $post->ID, 'competition_startdate', true );
		$enddate = get_post_meta( $post->ID, 'competition_enddate', true );
		
		//do HTML inlining here
		//add default values
		
		echo '<p><label for="competition_startdate">';
		_e( 'Startdate (optional)', 'myplugin_textdomain' );
		echo '</label> ';
		echo '<input type="date" id="competition_startdate" name="competition_startdate" value="' . esc_attr( $startdate ) . '" class="bidx-datepicker" />';
		echo '</p><p><label for="competition_enddate">';
		_e( 'Enddate (mandatory)', 'myplugin_textdomain' );
		echo '</label> ';
		echo '<input type="date" id="competition_enddate" name="competition_enddate" value="' . esc_attr( $enddate ) . '" class="bidx-datepicker" />';
		echo '</p>';
	}
	
	/**
	 * When the post is saved, saves our custom data.
	 * We need to verify this came from our screen and with proper authorization,
	 * because the save_post action can be triggered at other times.
	 * 
	 * @param int $post_id The ID of the post being saved.
	 */
	function bidxcompetition_save_meta_box_data( $post_id ) {
	
		// Verify that the nonce is valid.
		if ( ( ! isset( $_POST['bidxcompetition_meta_box_nonce'] ) && 
			 !wp_verify_nonce( $_POST['bidxcompetition_meta_box_nonce'], 'bidxcompetition_meta_box' ) ) ) {
			return;
		}
	
		// If this is an autosave, our form has not been submitted, so we don't want to do anything.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
	
		// Check the user's permissions.
		if ( isset( $_POST['post_type'] ) && 'competition' == $_POST['post_type'] ) {
			if ( ! current_user_can( 'edit_page', $post_id ) ) {
				return;
			}
		} else {
			return;
		} 
	
		// TODO : add error messages
		if ( ! isset( $_POST['competition_enddate'] ) ) {
			//TODO check if enddate is before today
			return;
		}
	
		if ( isset( $_POST['competition_startdate'] ) ) {
			//TODO check if startdate is before enddate
			$my_data = sanitize_text_field( $_POST['competition_startdate'] );
			update_post_meta( $post_id, 'competition_startdate', $my_data );
		}
		
		$my_data = sanitize_text_field( $_POST['competition_enddate'] );
		update_post_meta( $post_id, 'competition_enddate', $my_data );
	}
	
}
?>
