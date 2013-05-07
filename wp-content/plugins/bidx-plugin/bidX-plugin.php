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

//Generic config for paths : standard util object?
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

require (BIDX_PLUGIN_DIR . '/apps/util.php');

//
// Activation of frontend apps
//
require (BIDX_PLUGIN_DIR . '/apps/rewrite.php');
require (BIDX_PLUGIN_DIR . '/apps/shortcode.php');

$ruleitems = array( 
	//				'member' => 'memberprofile',
	//				'businessplan',
	//				'mydashboard' => 'dashboard',
					'search' 
				  );

$rewrite = new BidxRewrite( $ruleitems );
register_activation_hook( __FILE__, array( &$rewrite, 'register_rewrite' ) );
register_deactivation_hook( __FILE__, array( &$rewrite, 'bidxplugin_deactivate' ) );

$shortcode = new BidxShortCode();
$shortcode -> addMappingArray($ruleitems);

//
// For the Startpage
// Should redirect from frontpage to /dashboard if user is authenticated
// @todo externalize this in redirection handler
//
add_filter( 'init', 'validate_frontpage_login' );
function validate_frontpage_login() {
// 	if ( is_front_page() && is_user_logged_in() ) {
// 		wp_redirect( '/dashboard/' );
// 	}
// 	global $wp, $wp_query;
}

?>