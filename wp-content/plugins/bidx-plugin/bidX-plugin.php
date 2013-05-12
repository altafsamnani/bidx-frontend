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

//
//Generic config for paths
//
include ('apps/util.php' );

//
// Activation of frontend apps
//
require ( BIDX_PLUGIN_DIR . '/rewrite.php' );
require ( BIDX_PLUGIN_DIR . '/shortcode.php' );
require ( BIDX_PLUGIN_DIR . '/templatelibrary.php' );

$ruleitems = array( 
					'member' => 'memberprofile',
					'businessplan',
					'mydashboard' => 'dashboard',
					'search' 
				  );

$rewrite = new BidxRewrite();
$rewrite -> addMappingArray( $ruleitems );
register_activation_hook( __FILE__, array( 'BidxRewrite', 'bidx_register_rewrite' ) );
register_deactivation_hook( __FILE__, array( 'BidxRewrite', 'bidx_deregister_rewrite' ) );	

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