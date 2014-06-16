<?php
/*
  Plugin Name: bidx-competition-plugin
  Plugin URI: http://bidx.net/plugin/bidx-competition-plugin
  Description: Wordpress plugin for adding competition functions (local or Skipso) to a bidX website.
  Version: 0.1.0
  Author: bidX development team
  Author URI: http://bidx.net/plugin/bidx-competition-plugin
  License: Commercial
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once 'lib/database.php';
require_once 'lib/bidxcompetition.php';
require_once 'lib/bidxcompetitionwidget.php';

$competition = new BidxCompetition();
register_activation_hook ( __FILE__, array ( $competition, 'load' ) );
register_deactivation_hook ( __FILE__, array ( $competition, 'unload' ) );

	