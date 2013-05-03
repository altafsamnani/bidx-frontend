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

add_filter( 'init', 'validateFrontpageLogin' );
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
	//add_rewrite_rule('^'.$name.'/([^/]*)/[^]?','index.php?bidxaction='.$bidxaction.'&bidx_param1=$matches[1]&bidx_param2=$matches[2]', $target);
	add_rewrite_rule('^'.$name.'/([^/]*)/?','index.php?bidxaction='.$bidxaction.'&bidx_param1=$matches[1]', $target);
	add_rewrite_rule('^'.$name.'/?','index.php?bidxaction='.$bidxaction, $target);
}

function bidxplugin_router() {
	//retrieve bidx_action param
	//find file to include and execute
}

function bidxplugin_activate() {
	
	error_log('bidX rules activation started');
	
	add_rewrite_tag( '%bidx_action%', '([^&]+)' ); //main action per endpoint
	add_rewrite_tag( '%bidx_param1%', '([^&]+)' ); //control parameter if available
	add_rewrite_tag( '%bidx_param2%', '([^&]+)' ); //rest of url data if available
	
	add_bidx_rewrite_rule( 'member','memberprofile' );
	add_bidx_rewrite_rule( 'businessplan' );
	add_bidx_rewrite_rule( 'mydashboard', 'dashboard' );
	add_bidx_rewrite_rule( 'search' );
	
	//add handler for bidx_action where action is endpoint :
	//add_action('the_content', bidxplugin_router);
	
	error_log('Rewrite rules Bidx activation succeeded');

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