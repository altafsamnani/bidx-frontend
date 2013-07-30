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


//do not do this when site is bidx.net
$loader = new ContentLoader( 'pages' );
register_activation_hook( __FILE__, array( $loader, 'load' ) );
register_deactivation_hook( __FILE__, array( $loader, 'unload' ) );

if ( !BidxCommon :: isWPInternalFunction() ) {
	//Mattijs 8/7/2013: would be nice if this array is populated from XML so you dont have to define your apps twice
	$ruleitems = array(
			'member' => 'memberprofile',
			'businessplan',
			'company',
			'mydashboard' => 'dashboard',
			'search',
			'group',
			'auth',
			'mail'
	);
	$shortcode = new BidxShortCode();
	$shortcode -> addMappingArray( $ruleitems );
    
	//cleanup body tag

}

add_filter( 'body_class','my_class_names', 100000 );

function my_class_names($classes) {
	
	return preg_replace( "/^\?bidx=/", 'bidx-',  $classes );
	
}

add_filter('init','bidx_plugin_init');

function bidx_plugin_init() {
//
//    $ruleitems = array(
//			'member' => 'memberprofile',
//			'businessplan',
//			'company',
//			'mydashboard' => 'dashboard',
//			'search',
//			'group',
//			'auth',
//			'inbox');
//    foreach( $ruleitems as $key => $val ) {
//
//    $plugin_dir = basename(dirname(__FILE__)).'/apps/'.$val.'/languages';
//
//    load_plugin_textdomain( 'bidx-plugin', false, $plugin_dir );
//    }
    $domain = 'bidx';
    $abs_rel_path = WP_CONTENT_DIR.'/languages';
   // $path = ABSPATH . trim( $abs_rel_path, '/' );
    $locale = apply_filters( 'plugin_locale', get_locale(), $domain );
    $mofile = $abs_rel_path . '/'. $locale . '.mo';
 
    load_textdomain( $domain, $mofile );
   // load_plugin_textdomain( 'bidx-plugin', $plugin_dir );

}


?>
