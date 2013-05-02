<?php
/*
Plugin Name: bidXplugin 
Plugin URI: http://bidx.net/plugin/bidXplugin
Description: Wordpress plugin for adding bidX functionality to a website.
Version: 0.1
Author: bidX development team
Author URI: http://bidx.net/plugin/bidXplugin
License: Commercial
*/

//Startpage
add_filter('wp_title', 'set_page_title');

function set_page_title($title) {
	if (is_front_page()) {
		//check if session
		//redirect action here
	}
	else {
		return $title;
	}
}

//Memberprofile app
add_rewrite_rule('^profile/([^/]*)/?','apps/memberprofile/memberprofile.php?member_id=$matches[1]','top');
add_rewrite_rule('^profile/?','apps/memberprofile/memberprofile.php','top');

//Businessplan app
add_rewrite_rule('^businessplan/([^/]*)/?','apps/businessplan/businessplan.php?bp_id=$matches[1]','top');
add_rewrite_rule('^businessplan/?','apps/businessplan/businessplan.php','top');

//Dashboard app
add_rewrite_rule('^dashboard/([^/]*)/?','apps/dashboard/dashboard.php?dashboard_id=$matches[1]','top');
add_rewrite_rule('^dashboard/?','apps/dashboard/dashboard.php','top');

//Search app
add_rewrite_rule('^search/([^/]*)/?','apps/search/search.php?q=$matches[1]','top');
add_rewrite_rule('^search/?','apps/search/search.php','top');

?>