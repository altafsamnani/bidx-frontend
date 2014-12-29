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
							'name'                => _x( 'Judges', 'Judges', 'bidxplugin' ),
							'singular_name'       => _x( 'Judge', 'Judge', 'bidxplugin' ),
							'menu_name'           => __( 'Judges', 'bidxplugin' ),
							'parent_item_colon'   => __( 'Competitions:', 'bidxplugin' ),
							'all_items'           => __( 'All Judges', 'bidxplugin' ),
							'view_item'           => __( 'View Judge', 'bidxplugin' ),
							'add_new_item'        => __( 'Add New Judge', 'bidxplugin' ),
							'add_new'             => __( 'Add New', 'bidxplugin' ),
							'edit_item'           => __( 'Edit Judge', 'bidxplugin' ),
							'update_item'         => __( 'Update Judge', 'bidxplugin' ),
							'search_items'        => __( 'Search Judges', 'bidxplugin' ),
							'not_found'           => __( 'Judge not found', 'bidxplugin' ),
							'not_found_in_trash'  => __( 'Judge not found in Inactive', 'bidxplugin' ),
							'trash' 			  => __( 'Inactive', 'bidxplugin' ),
				),
			)
		);
	}






}


?>