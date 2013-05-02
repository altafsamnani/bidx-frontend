<?php
/*
Plugin Name: bidx-plugin 
Plugin URI: http://bidx.net/plugin/bidx-plugin
Description: Wordpress plugin for adding bidX functionality to a website.
Version: 0.1.1
Author: bidX development team
Author URI: http://bidx.net/plugin/bidx-plugin
License: Commercial
*/

//Startpage
//Should redirect from frontpage to /dashboard if user is authenticated
add_filter('init', 'validateFrontpageLogin');
function validateFrontpageLogin() {
	if (is_front_page() && is_user_logged_in()) {
		wp_redirect('/dashboard/');
	}	
}

//
//Rewrites for urls
//
add_action('init', 'add_bidx_plugin_rewrites');
function add_bidx_plugin_rewrites() {
	
	//Memberprofile app
	add_rewrite_rule( '^member/([^/]*)/?', plugins_url( 'apps/memberprofile/memberprofile.php?member_id=$matches[1]' ), 'top' );
	add_rewrite_rule( '^member/?', plugins_url( 'apps/memberprofile/memberprofile.php'),'top');
	
	//Businessplan app
	add_rewrite_rule( '^businessplan/([^/]*)/?', plugins_url( 'apps/businessplan/businessplan.php?bp_id=$matches[1]'), 'top' );
	add_rewrite_rule( '^businessplan/?', plugins_url( 'apps/businessplan/businessplan.php'), 'top' );
	
	//Dashboard app
	add_rewrite_rule( '^home/([^/]*)/?', plugins_url( 'apps/dashboard/dashboard.php?dashboard_id=$matches[1]'), 'top' );
	add_rewrite_rule( '^home/?', plugins_url( 'apps/dashboard/dashboard.php' ), 'top' );
	
	//Search app
	add_rewrite_rule( '^search/([^/]*)/?', plugins_url( 'apps/search/search.php?q=$matches[1]'), 'top' );
	add_rewrite_rule( '^search/?', plugins_url( 'apps/search/search.php'), 'top' );
	
}
?>