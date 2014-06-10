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
 * FIXME determine if custom post type is needed or better everything in the database
 */
class BidxCompetition {
	
	/** constants for the competition **/
	const POST_TYPE = 'bidxcompetition';
	const COMPETITION_START_KEY = 'startdate';
	const COMPETITION_END_KEY = 'enddate';
	const COMPETITION_TYPE_KEY = 'type';	
	
	/**
	 * Register widget
	 * Validate BidxCompetition post type or else create it
	 */
	static function load() {
		if ( ! post_type_exists( self::POST_TYPE ) ) {
			add_action( 'init', 'create_competition' );
		}
		add_action( 'widgets_init', 'create_competition_widget' );
	}
	
	/**
	 * Create the custom post describing the competition
	 */
	function create_competition() {
		register_post_type ( self::POST_TYPE, array (
				'public' => true,
				'exclude_from_search' => true,
				'show_ui' => true,
				'show_in_menu' => true,
				'query_var' => true,
				'rewrite' => false,
				'capability_type' => 'post',
				'_builtin' => false,
				'has_archive' => false,
				'hierarchical' => false,
				'menu_position' => null,
		) );
	}
	
	function create_competition_widget() {
		register_widget( 'BidxCompetitionCounterWidget' );	
		register_widget( 'BidxCompetitionRegistrationWidget' );
	}	
	
	/**
	 * Hide the custom post type (do not remove)
	 */
	static function unload() {
		add_action( 'widgets_init', 'remove_competition_widget' );
	}

	function remove_competition_widget() {
		unregister_widget( 'BidxCompetitionCounterWidget' );
		unregister_widget( 'BidxCompetitionRegistrationWidget' );
	}	
	
}
?>
