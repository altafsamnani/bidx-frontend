<?php

/**
 * All judging related functions.
 * 
 * Judges should be post_types that can be assigned to competitions
 * 
 * Register Judges using (bidx) e-mail address and add extra data to it. 
 * When these are logged in they can judge plans assigned to them.
 * Assigning of the plans to review can be set by the Group Owner.
 * 
 * Score is kept per business summary entering a competition.
 * 
 * @author Jaap Gorjup
 */
class CompetitionJudging {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'init',	array( $this, 'create_judges' ) );
	}
	
	/**
	 * Judges should be created, make sure to fix inconstency between Business Summary and UserID
	 * Add link to member profile page of judge using username
	 */
	function create_judges() {

		register_post_type( 'judge',
			array(
				'public' => true,
				'supports' => array( 'thumbnail', 'title', 'excerpt' ),
				'show_in_menu' => 'edit.php?post_type=competition',
				'menu_icon' => 'dashicons-awards',
				'exclude_from_search' => true,
				'labels'              => array(
							'name'                => _x( 'Judges', 'Judges', 'bidx_competition' ),
							'singular_name'       => _x( 'Judge', 'Judge', 'bidx_competition' ),
							'menu_name'           => __( 'Judges', 'bidx_competition' ),
							'parent_item_colon'   => __( 'Competitions:', 'bidx_competition' ),
							'all_items'           => __( 'All Judges', 'bidx_competition' ),
							'view_item'           => __( 'View Judge', 'bidx_competition' ),
							'add_new_item'        => __( 'Add New Judge', 'bidx_competition' ),
							'add_new'             => __( 'Add New', 'bidx_competition' ),
							'edit_item'           => __( 'Edit Judge', 'bidx_competition' ),
							'update_item'         => __( 'Update Judge', 'bidx_competition' ),
							'search_items'        => __( 'Search Judges', 'bidx_competition' ),
							'not_found'           => __( 'Judge not found', 'bidx_competition' ),
							'not_found_in_trash'  => __( 'Judge not found in Inactive', 'bidx_competition' ),
							'trash' 			  => __( 'Inactive', 'bidx_competition' ),
				),
			)
		);	
	}
	
	
	
	
	
	
}


?>