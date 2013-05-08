<?php

class memberprofile {

	/**
	 * Constructor
	 */
	function __construct() {
		add_action( 'wp_enqueue_scripts', array( &$this, 'register_memberprofile_bidx_ui_libs' ) );
	}

	/**
	 * Register scripts and styles
	 */
	function register_memberprofile_bidx_ui_libs() {
	  wp_register_script('memberprofile', plugins_url('static/js/memberprofile.js', __FILE__), array(bootstrap), '20130501', TRUE);
	  wp_enqueue_script('memberprofile');
	
	  wp_register_style('memberprofile', plugins_url('static/css/memberprofile.css', __FILE__), array('bootstrap', 'bootstrap-responsive'), '20130501', 'all');
	  wp_enqueue_style('memberprofile');
	}
	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */
	function load($atts) {
		require ( BIDX_PLUGIN_DIR . '/memberprofile/memberprofile_component.php' );
	}
}
