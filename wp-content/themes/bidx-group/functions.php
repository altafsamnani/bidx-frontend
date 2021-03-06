<?php
/**
 * Theme includes
 */
require_once locate_template('custom-redirect.php');
require_once locate_template('/lib/variables.php');           // Utility functions
require_once locate_template('/lib/utils.php');           // Utility functions
require_once locate_template('/lib/init.php');            // Initial theme setup and constants
require_once locate_template('/lib/wrapper.php');         // Theme wrapper class
require_once locate_template('/lib/sidebar.php');         // Sidebar class
require_once locate_template('/lib/config.php');          // Configuration
//can be used for the getting started when a new group is created
//require_once locate_template('/lib/activation.php');    // Theme activation
require_once locate_template('/lib/titles.php');          // Page titles
require_once locate_template('/lib/cleanup.php');         // Cleanup
require_once locate_template('/lib/nav.php');             // Custom nav modifications
require_once locate_template('/lib/gallery.php');         // Custom [gallery] modifications
require_once locate_template('/lib/comments.php');        // Custom comments modifications
require_once locate_template('/lib/rewrites.php');        // URL rewriting for assets
require_once locate_template('/lib/htaccess.php');        // HTML5 Boilerplate .htaccess
require_once locate_template('/lib/relative-urls.php');   // Root relative URLs
require_once locate_template('/lib/widgets.php');         // Sidebars and widgets
require_once locate_template('/lib/scripts.php');         // Scripts and stylesheets
require_once locate_template('/lib/customizer.php');      // Customizer functions
require_once locate_template('/lib/custom.php');          // Custom functions

//BIDX-1352 : added menu for non-authenticated page menu on top
function bidx_register_my_menu() {
    register_nav_menu('primary_notloggedin_navigation', 'Primary navigation for a non-logged in user');
}
add_action( 'init', 'bidx_register_my_menu' );
