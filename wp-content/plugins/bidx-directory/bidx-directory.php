<?php
/**
 * Created by PhpStorm.
 * User: Bilel BARHOUMI
 * Email: infobilel@gmail.com
 * Date: 15/02/2016
 * Time: 12:59
 */

/*
  Plugin Name: Bidx Directory Plugin
  Plugin URI: http://www.ibsit.net/plugin/bidx-directory-plugin
  Description: Wordpress plugin for adding financing directory functions to a bidX portal.
  Version: 0.1.0
  Author: IBS development team
  Author URI: http://www.ibsit.net
  License: Commercial
 */

defined('ABSPATH') or die('No script kiddies please!');

require_once 'lib/page-template.php';
require_once 'lib/financing-directory.php';
require_once 'lib/facility.php';
require_once 'lib/facility-update.php';
require_once 'lib/organisation.php';

$directory = new FinancingDirectory();

/* Runs when plugin is activated */
register_activation_hook(__FILE__, array($directory, 'load'));

/* Runs on plugin deactivation */
register_deactivation_hook(__FILE__, array($directory, 'unload'));