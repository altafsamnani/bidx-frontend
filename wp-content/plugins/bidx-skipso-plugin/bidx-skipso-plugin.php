<?php
/*
  Plugin Name: bidx-skipso-plugin
  Plugin URI: http://bidx.net/plugin/bidx-skipso-plugin
  Description: Wordpress plugin for adding Skipso competition functions to a bidX website.
  Version: 0.1.0
  Author: bidX development team
  Author URI: http://bidx.net/plugin/bidx-skipso-plugin
  License: Commercial
 */

/**
 * FIXME add activation/deactivation
 * FIXME move configuration settings from bidx-plugin to here
 * TODO plugin execution hooks -> available for other plugins to work with
 * Generic bidx handlers (registration_data, login etc.)
 */
class BidxSkipsoPlugin {

	static function load() {
		
	}
	
	static function unload() {
		
	}
	
}

register_activation_hook ( __FILE__, array ( BidxSkipsoPlugin, 'load' ) );
register_deactivation_hook ( __FILE__, array ( BidxSkipsoPlugin, 'unload' ) );

	