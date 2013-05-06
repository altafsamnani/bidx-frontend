<?php
/*
Plugin Name: bidx-plugin 
Plugin URI: http://bidx.net/plugin/bidx-plugin
Description: Wordpress plugin for adding bidX functionality to a website.
Version: 0.1.2
Author: bidX development team
Author URI: http://bidx.net/plugin/bidx-plugin
License: Commercial
*/

//Generic config for paths
if ( !defined( 'BIDX_THEME_DIR' ) ) {
	define( 'BIDX_THEME_DIR', ABSPATH . 'wp-content/themes/' . get_template() );
}
if ( !defined( 'BIDX_PLUGIN_NAME' ) ) {
	define( 'BIDX_PLUGIN_NAME', trim( dirname( plugin_basename( __FILE__ ) ), '/' ) );
}
if ( !defined( 'BIDX_PLUGIN_DIR') ) {
	define( 'BIDX_PLUGIN_DIR', WP_PLUGIN_DIR . '/' . BIDX_PLUGIN_NAME );
}
if ( !defined( 'BIDX_PLUGIN_URL' ) ) {
	define( 'BIDX_PLUGIN_URL', WP_PLUGIN_URL . '/' . BIDX_PLUGIN_NAME );
}
//Versioning config
if ( !defined( 'BIDX_VERSION_KEY') ) {
	define( 'BIDX_VERSION_KEY', 'BIDX_version' );
}
if ( !defined('BIDX_VERSION_NUM') ) {
	define( 'BIDX_VERSION_NUM', '0.1.2' );
}
add_option( BIDX_VERSION_KEY, BIDX_VERSION_NUM );

//Startpage
//Should redirect from frontpage to /dashboard if user is authenticated
add_filter( 'init', 'validate_frontpage_login' );
function validate_frontpage_login() {
	if ( is_front_page() && is_user_logged_in() ) {
		wp_redirect( '/dashboard/' );
	}	
}

//Rewrites for urls
//Claims url pattern for the bidx applications
function add_bidx_rewrite_rule($name, $bidxaction = null, $target = 'top')
{
	if ($bidxaction === null) {
		$bidxaction = $name;
	}
	//3rd level optionals?
	//add_rewrite_rule('^'.$name.'/([^/]*)/[^]?','index.php?post_type=bidx&bidxaction='.$bidxaction.'&bidx_param1=$matches[1]&bidx_param2=$matches[2]', $target);
	add_rewrite_rule('^'.$name.'/([^/]*)/?','index.php?post_type=bidx&bidxaction='.$bidxaction.'&bidx_param1=$matches[1]', $target);
	add_rewrite_rule('^'.$name.'/?','index.php?post_type=bidx&bidxaction='.$bidxaction, $target);
}

function bidxplugin_router() {
	//retrieve bidx_action param
	global $wp_query;
	$bidxaction = $wp_query->query_vars['bidxaction'];
	add_filter('the_content', array(&$this, 'filter_user_content'), 1);
	//find file to include and execute
}

function codex_custom_init() {
	error_log( 'Initializing custom Post handler' );
	
	$args = array(
			'public' => true,
			'exclude_from_search' => false,
			'show_ui' => true, //for managing the plugin in the future?
			'show_in_menu' => true, //for managing the plugin in the future?
			'query_var' => true,
			//			'rewrite' => false, //handled manually for now
			'rewrite' => array( 'slug' => 'bidx' ),
			'capability_type' => 'page',
			'has_archive' => false,
			'hierarchical' => false,
			'menu_position' => null,
			'supports' => array( 'title' )
	);
	register_post_type( 'bidx', $args );
	error_log( 'Custom Post handler ready' );	
}
add_action( 'init', 'codex_custom_init' );

function bidxplugin_activate() {

	error_log( 'bidX rules activation started' );
	
	add_rewrite_tag( '%bidx_action%', '([^&]+)' ); //main action per endpoint
	add_rewrite_tag( '%bidx_param1%', '([^&]+)' ); //control parameter if available
	add_rewrite_tag( '%bidx_param2%', '([^&]+)' ); //rest of url data if available
	
	add_bidx_rewrite_rule( 'member','memberprofile' );
	add_bidx_rewrite_rule( 'businessplan' );
	add_bidx_rewrite_rule( 'mydashboard', 'dashboard' );
	add_bidx_rewrite_rule( 'search' );
		
	error_log( 'Rewrite rules bidX activation succeeded' );
	
	flush_rewrite_rules();	
}

register_activation_hook( __FILE__, 'bidxplugin_activate' );

function bidxplugin_deactivate() {

	error_log('bidX rules de-activation started');	
	flush_rewrite_rules();
	//check if they are gone
	error_log('bidX rules de-activation succeeded');
}
register_deactivation_hook( __FILE__, 'bidxplugin_deactivate' );
?>