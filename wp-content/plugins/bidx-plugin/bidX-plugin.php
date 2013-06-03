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
//require ( BIDX_PLUGIN_DIR . '/rewrite.php' ); //to be removed
require ( BIDX_PLUGIN_DIR . '/contentloader.php' );
require ( BIDX_PLUGIN_DIR . '/shortcode.php' );
require ( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
require_once ( BIDX_PLUGIN_DIR . '/common.php' );

$loader = new ContentLoader( 'pages' );
register_activation_hook( __FILE__, array( $loader, 'load' ) );
register_deactivation_hook( __FILE__, array( $loader, 'unload' ) );

if (!BidxCommon :: isWPInternalFunction()) {
	$ruleitems = array(
			'member' => 'memberprofile',
			'businessplan',
			'company',
			'mydashboard' => 'dashboard',
			'search',
			'group',
			'auth'
	);
	$shortcode = new BidxShortCode();
	$shortcode -> addMappingArray($ruleitems);
}
?>
