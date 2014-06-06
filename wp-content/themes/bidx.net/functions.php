<?php
//Initialize the update checker.
//Disabled by Jaap
//
// require ABSPATH . 'wp-content/plugins/bidx-plugin/theme-updates/theme-update-checker.php';

// $theme_update_checker = new ThemeUpdateChecker(
// 	'bidx.net',                                            //Theme folder name, AKA "slug". 
// 	BIDX_THEME_METADATA_PATH //URL of the metadata file.
// );


load_theme_textdomain ('bidxtheme', WP_CONTENT_DIR . '/languages/themes');

require_once locate_template('/lib/utils.php');           // Utility functions
require_once locate_template ('/lib/init.php');            // Initial theme setup and constants
require_once locate_template ('/lib/nav.php');             // Custom nav modifications
require_once locate_template ('/lib/widgets.php');         // Sidebars and widgets
require_once locate_template ('/lib/custom.php');          // Custom functions


?>
