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

/* If Network activate it performs action on Main site too, exclude that site */

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
    $loader = new ContentLoader ('pages');
    register_activation_hook (__FILE__, array ($loader, 'load'));
    register_deactivation_hook (__FILE__, array ($loader, 'unload'));

    if (!BidxCommon :: isWPInternalFunction ()) {
        //Mattijs 8/7/2013: would be nice if this array is populated from XML so you dont have to define your apps twice
        $ruleitems = array (
          'auth',
          'businessplan',
          'businesssummary',
          'company',
          'group',
          'mail',
          'media',
          'member',
          'mydashboard' => 'dashboard',
          'search',
          'login',
          'register',
          'resetpassword'
        );
        $shortcode = new BidxShortCode();
        $shortcode->addMappingArray ($ruleitems);

        //cleanup body tag
    }
//Bidx WP Hooks file
    require_once( BIDX_PLUGIN_DIR . '/../services/wp-service.php' );

add_filter ('body_class', 'my_class_names', 100000);

function my_class_names ($classes)
{

    return preg_replace ("/^\?bidx=/", 'bidx-', $classes);
}

?>
