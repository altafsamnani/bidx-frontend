<?php

/**
 *
 * @author Altaf Samnani
 * @version 1.0
 */
class content {

	static $deps = array( 'jquery', 'bootstrap', 'underscore', 'backbone', 'json2',
			'gmaps-places', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-reflowrower', 'bidx-data', 'bidx-i18n', 'bidx-tagsinput',
			'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods',
			'bidx-location','bidx-chosen', 'typeahead'
	);

 	/**
     * Constructor
     */
  	function __construct()
  	{
		add_action('wp_enqueue_scripts', array(&$this, 'register_member_bidx_ui_libs'));
  	}

	/**
	 * Register scripts and styles
	 */
	function register_member_bidx_ui_libs() {

	  	wp_register_script( 'content', plugins_url( 'static/js/content.js', __FILE__ ), self :: $deps, '20130501', TRUE );
        
	}

	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */
	function load($atts) {

	    return 1;
	}
}
