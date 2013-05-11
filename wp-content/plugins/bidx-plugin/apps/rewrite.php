<?php
/**
 * Holds all the rewrites for the apps
 * @author Jaap Gorjup
 * @version 1.0
 */

class BidxRewrite
{
	static $bidx_posttype = "bidx";
	static $ruleitems = array();
	
	/**
	 * Constructs the BidxRewrite item.
	 * The ruleitems array should consist of name values of rewrite names with optional another target class definition.
	 */
	public function __construct()
	{
		Logger :: getLogger('rewrite') -> trace( 'Constructing BidxRewrite' );
		add_action( 'init', array( $this, 'codex_custom_init' ) );	
	}
	
	/**
	 * Add the array of mapping functions
	 * @param array $ruleitems names and targets for the rewrites
	 */
	public static function addMappingArray($ruleitems)
	{
		BidxRewrite :: $ruleitems = $ruleitems;
		Logger :: getLogger('rewrite') -> trace( 'Added mapping array ' . serialize( BidxRewrite :: $ruleitems ) );
	}
	
	/**
	 * Adds the custom post type for publishing pages
	 * TODO : checkout if this is only called for registration of plugin instead every time
	 */
	public function codex_custom_init() {
		Logger :: getLogger('rewrite') -> trace( 'Initializing custom Post handler' );
	
		$args = array(
				'public' => true,
				'exclude_from_search' => true,
				'show_ui' => false, //for managing the plugin in the future?
				'show_in_menu' => false, //for managing the plugin in the future?
				'query_var' => true,
				'rewrite' => false, //handled manually for now
				'capability_type' => 'page',
				'_builtin' => false,
				'has_archive' => false,
				'hierarchical' => false,
				'menu_position' => null,
				'supports' => array( 'title' )
		);
		register_post_type(  BidxRewrite :: $bidx_posttype, $args );
		
		Logger :: getLogger( 'rewrite' ) -> trace( 'Custom Post handler ready' );
	}
	
	/**
	 * Register the rewrite rules as defined in the ruleitems
	 */
	public static function bidx_register_rewrite() {
		Logger :: getLogger( 'rewrite' ) -> trace( 'bidX rules activation started : ' . BidxRewrite :: $ruleitems );
		
		add_rewrite_tag( '%bidxaction%', '([^&/]+)' ); //main action per endpoint
		add_rewrite_tag( '%bidxparam1%', '([^&/]+)' ); //control parameter if available
		add_rewrite_tag( '%bidxparam2%', '([^&/]+)' ); //rest of url data if available
		
		foreach ( BidxRewrite :: $ruleitems as $name => $bidxaction ) {
			 BidxRewrite :: add_bidx_rewrite_rule( $name, $bidxaction );
		}
		
		Logger :: getLogger( 'rewrite' ) -> trace( 'Rewrite rules bidX activation succeeded' );
		
		flush_rewrite_rules();
	}
	
	/**
	 * Adds the rewrite rules and add them to the list linking to the bidx post type
	 * @param string $name can be an index number on an array, in that case bidxaction will be used
	 * @param string $bidxaction name of the action internally called (optionally)
	 * @param string $target target where the rewrite rule must be (top|bottom)
	 */
	public static function add_bidx_rewrite_rule($name, $bidxaction = null, $target = 'top')
	{
		Logger :: getLogger( 'rewrite' ) -> trace( 'Adding rewrite '.$name.' : '.$bidxaction );
		
		$bidx_posttype = BidxRewrite :: $bidx_posttype;
		
		if (is_numeric($name)) {
			$name = $bidxaction;
		}
		//3rd level optionals? check how the rest of the variables are added
		//	add_rewrite_rule('^' . $name . '/([^/]*)/[^]?','index.php?page_id=ID&post_type=' . $bidx_posttype . '&bidxaction='. $bidxaction. '&bidx_param1=$matches[1]&bidx_param2=$matches[2]', $target );
		add_rewrite_rule('^' . $name . '/([^/]*)/?','index.php?bidx=' . $bidxaction . '&post_type=' . $bidx_posttype . '&bidxaction=' . $bidxaction . '&bidxparam1=$matches[1]', $target );
		add_rewrite_rule('^' . $name . '/?','index.php?bidxaction=' . $bidxaction . '&bidx=' . $bidxaction . '&post_type=' . $bidx_posttype, $target );
		
		//Add the first post (possibly load these from pages directory instead) ?
		wp_insert_post( array(
				'post_content'   => '[bidx app="' . $bidxaction . '"]'
				,'post_name'      => $bidxaction
				,'post_status'    => 'publish'
				,'post_title'     => $name
				,'post_type'      => 'bidx'
				,'post_author'    => 1
				)
		);
	}
	
	
	/**
	 * Deregister the plugin.
	 * Remove the rules.
	 */
	public static function bidx_deregister_rewrite() {
		Logger :: getLogger( 'rewrite' ) -> trace( 'bidX rules de-activation started' );
		
		flush_rewrite_rules();
		//TODO check if rewrites are gone

		//remove posts		
		$posts_array = get_posts( array(
			'post_type'       => 'bidx',
			'post_status'     => 'publish',
			'suppress_filters' => true ) 
		);

		Logger :: getLogger( 'rewrite' ) -> trace( 'Removing posts' );
		foreach ( $posts_array as $post ) {
			$postid = $post->ID;
			wp_delete_post( $postid, true );
			Logger :: getLogger( 'rewrite' ) -> trace( 'Removed post id : '.$postid );
		}
		
		Logger :: getLogger( 'rewrite' ) -> trace( 'bidX rules de-activation succeeded' );
	}
	
}



?>