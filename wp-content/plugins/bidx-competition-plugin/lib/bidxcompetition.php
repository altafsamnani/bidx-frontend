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
 * 
 * http://codex.wordpress.org/Creating_Tables_with_Plugins
 * 
 * 
 * To really use this plugin well the theme must also support post-thumbnails
 */
class BidxCompetition {
		
	/** constants for the competition **/
	const POST_TYPE = 'competition';
	const COMPETITION_START_KEY = '	';
	const COMPETITION_END_KEY 	= 'competition_enddate';
		
	const COMPETITION_TYPE_KEY 	= 'competition_type';	
	const COMPETITION_TYPE_OPEN_KEY 		= 'open';
	const COMPETITION_TYPE_REGISTRATION_KEY = 'registered';
	const COMPETITION_TYPE_CLOSED_KEY 		= 'closed';
 	private static $competition_types	= array(
 				COMPETITION_TYPE_OPEN_KEY, 
 				COMPETITION_TYPE_REGISTRATION_KEY,
 				COMPETITION_TYPE_CLOSED_KEY
 	);		
		
	/**
	 * Constructor sets up the actions for the backend functions and the widgets
	 * 
	 * TODO load screen for competition with custom help sidebar : set_help_sidebar( $content )
	 */
	public function __construct() {		
		//load the multilang text domain file
		$this->load_text_domain();
				
		add_action( 'add_meta_boxes', array( $this, 'bidxcompetition_add_meta_box' ) );
		add_action( 'save_post', 	  array( $this, 'bidxcompetition_save_meta_box_data' ) );		
		add_action( 'init', 		  array( $this, 'create_competition' ) );
		add_action( 'widgets_init',   array( $this, 'create_competition_widget' ) );
		
		add_filter( 'manage_competition_posts_columns', 	  array( $this, 'competition_table_head') );
		add_action( 'manage_competition_posts_custom_column', array( $this, 'competition_table_content'), 10, 2 );

		//load the monitoring
		$monitoring = new CompetitionMonitoring();
		//load the judging
		$judges = new CompetitionJudging();
	}
		
	/**
	 * List the competitions in this site
	 */
	static function get_competitions_list() {		
		return new WP_Query( array( 'post_type' => 'competition', 'post_status' => 'publish' ) );		
	}
	
	/**
	 * Localization support
	 */
	function load_text_domain() {
			
 		$locale = get_locale();
 		if( !empty( $locale ) ) {

//				What is the mofile name?
// 				if( @file_exists( $mofile ) && is_readable( $mofile ) ) { 
// 					load_textdomain( $this->p->name, $mofile );
// 				}
 		}
	}
		
		/**
		 * Create the custom post describing the competition
		 */
		function create_competition() {
			
			$args = array(
					'label'               => __( 'post_type', 'bidx_competition' ),
					'description'         => __( 'Competition definition', 'bidx_competition' ),
					'labels'              => array(
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
					),
					'supports'            => array( 
							'thumbnail',  //
							'title', 
							'editor',
							'excerpt' 
					),
					'hierarchical'        => true,
					'public'              => true,
					'show_ui'             => true,
					'show_in_menu'        => true,
					'show_in_nav_menus'   => true,
					'show_in_admin_bar'   => true,
					'menu_position'       => 40,
					'menu_icon'           => 'dashicons-awards',
					'can_export'          => true,
					'has_archive'         => true,
					'exclude_from_search' => false,
					'publicly_queryable'  => true,
					'capability_type'     => 'post',
			);
			register_post_type ( self::POST_TYPE, $args );
		}
		
		/**
		 * Adds extra fields to the competition overview
		 * @param list of defaults $defaults
		 * @return string
		 */
		function competition_table_head( $defaults ) {
			$defaults['thumbnail'] 			   = __( 'Thumbnail',  'bidx_competition' );
			$defaults['competition_startdate'] = __( 'Startdate',  'bidx_competition' );
			$defaults['competition_enddate']   = __( 'Enddate',    'bidx_competition' );
			$defaults['monitoring']   		   = __( 'Monitoring', 'bidx_competition' );
			return $defaults;
		}
		/**
		 * Fills the extra created columns for the competition post type
		 * @param string $column_name
		 * @param int $post_id
		 */
		function competition_table_content( $column_name, $post_id ) {
			if ($column_name == 'competition_startdate') {
				$start_date = get_post_meta( $post_id, 'competition_startdate', true );
				echo date( _x( 'F d, Y', 'Start date format', 'textdomain' ), strtotime( $start_date ) );
			}
			if ($column_name == 'competition_enddate') {
				$end_date = get_post_meta( $post_id, 'competition_enddate', true );
				echo date( _x( 'F d, Y', 'End date format', 'textdomain' ), strtotime( $end_date ) );
			}
			if ($column_name == 'monitoring') {
				echo '<a href="/wp-admin/edit.php?post_type=competition&page=competition-monitoring-page&competition_id='.$post_id.'">View</a>';
			}
			if ($column_name == 'thumbnail') {
				$thumbnail = get_post_meta( $post_id, 'thumbnail', true );
				echo '<img src="'. $thumbnail .'" />';
			}						
		}		
		
		/**
		 * Register the widgets
		 */
		function create_competition_widget() {
			register_widget( 'BidxCompetitionCounterWidget' );	
			//the functions of the widgets need to be joined
			//register_widget( 'BidxCompetitionRegistrationWidget' );
			//register_widget( 'BidxCompetitionJudgingWidget' );
		}	
		
		/**
		 * Initialize database object initialization.
		 * Flush rewrite rules to ensure connecting the competition in the right manner
		 */
		function load() {
			CompetitionDatabase :: initialize();
			flush_rewrite_rules( false );
		}
			
		/**
		 * Hide the custom post type (do not remove)
		 */
		function unload() {
			add_action( 'widgets_init', 'remove_competition_widget' );
		}
	
		/**
		 *  TODO MOVE THIS TO THE Widgets file
		 */
		function remove_competition_widget() {
			unregister_widget( 'BidxCompetitionCounterWidget' );
			//unregister_widget( 'BidxCompetitionRegistrationWidget' );
		}	
		
		/**
		 * Adds a box to the main column on the Post and Page edit screens.
		 */
		function bidxcompetition_add_meta_box() {
		
			add_meta_box(
				'bidxcompetition_sectionid',
				__( 'Competition Settings', 'bidx_competition' ),
				array( $this, 'meta_box_callback' ),
				$this :: POST_TYPE,
				'side'
			);
		}
		
		/**
		 * Prints the box content.
		 * @param WP_Post $post The object for the current post/page.
		*/
		function meta_box_callback( $post ) {
		
			// Add an nonce field so we can check for it later. bidxcompetition_meta_box_nonce
			wp_nonce_field( 'bidxcompetition_meta_box', 'bidxcompetition_meta_box_nonce' );
		
			/*
			 * Use get_post_meta() to retrieve an existing value
			* from the database and use the value for the form.
			*/
			$startdate = get_post_meta( $post->ID, 'competition_startdate', true );
			$enddate = get_post_meta( $post->ID, 'competition_enddate', true );
			$type = get_post_meta( $post->ID, $this->COMPETITION_TYPE, true );
			if ( $type == null ) {
				$type = $this->COMPETITION_TYPE_OPEN;
			}
			?>
<p><?php _e('These settings are needed for a competition to work.','bidx-competition' ) ?></p>
<p><label for="competition_type"><?php _e( 'Competition Type', 'bidx_competition' ) ?></label>	
<select name="<?php echo $this->COMPETITION_TYPE ?>">
<?php 
foreach ( $this->competition_types  as $c_type ) {
	echo '<option name="' . $c_type  . '" >'. _e( $c_type,'bidx-competition' ) . '</option>';
} ?>
</select>
<p>
	<label for="<?php echo $this->COMPETITION_START_KEY ?>"><?php _e( 'Startdate (optional)', 'bidx_competition' ) ?></label>
	<input type="date" id="<?php echo $this->COMPETITION_START_KEY ?>" name="<?php echo $this->COMPETITION_START_KEY ?>" value="<?php echo esc_attr( $startdate ) ?>"/>
</p>
<p>
	<label for="<?php echo $this->COMPETITION_END_KEY ?>"><?php _e( 'Enddate (mandatory)', 'bidx_competition' ); ?></label> ';
	<input type="date" id="<?php echo $this->COMPETITION_END_KEY ?>" name="<?php echo $this->COMPETITION_END_KEY ?>" value="<?php echo esc_attr( $enddate ) ?>" />
</p>
<?php 
	}
	
	/**
	 * When the post is saved, saves our custom data.
	 * We need to verify this came from our screen and with proper authorization,
	 * because the save_post action can be triggered at other times.
	 * 
	 * Verification on dates checking startdate, enddate and now in the right order.
	 * 
	 * @param int $post_id The ID of the post being saved.
	 */
	function bidxcompetition_save_meta_box_data( $post_id ) {
	
		// Verify that the nonce is valid. bidxcompetition_meta_box_nonce
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
		$type = sanitize_text_field( $_POST[$this->COMPETITION_TYPE_KEY] );
		if ( ! in_array( $this->COMPETITION_TYPES, $type ) ) {
			//return WPError( __('Competition Type does not exist', 'bidx-competition' ) );
		}
		if ( ! isset( $_POST[$this->COMPETITION_END_KEY] ) ) {	
			return WPError( __('Enddate is mandatory and is not set', 'bidx-competition' ) );
		}
		$my_enddate = sanitize_text_field( $_POST[$this->COMPETITION_END_KEY] );
		if  ( abs( strtotime( $my_enddate ) - $now ) < 0 ) {
			return WPError( __('Enddate is in the past', 'bidx-competition' ) );
		}
		if ( isset( $_POST[$this->COMPETITION_START_KEY] ) ) {
			$my_startdate = sanitize_text_field( $_POST[$this->COMPETITION_START_KEY] );
			$diff = abs( strtotime( $my_enddate ) - strtotime( $my_startdate ) );
			if ( $diff < 0 ) {
				return WPError( __('Startdate and enddate not in the correct order', 'bidx-competition' ) );
			}			
		}
		update_post_meta( $post_id, $this->COMPETITION_START_KEY, $my_startdate );
		update_post_meta( $post_id, $this->COMPETITION_END_KEY, $my_enddate );
		update_post_meta( $post_id, $this->COMPETITION_TYPE_KEY , $type );
	}
}

?>
