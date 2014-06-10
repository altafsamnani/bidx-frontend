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

require_once 'lib/bidxcompetition.php';
require_once 'lib/bidxcompetitionwidget.php';

register_activation_hook ( __FILE__, array ( BidxCompetition, 'load' ) );
register_deactivation_hook ( __FILE__, array ( BidxCompetition, 'unload' ) );

	