<?php

/**
 * --------------------
 * Configure WP-Less for using customizer data --> whenever theme panel data has changed.
 * Keep in mind that the customizer data is stored and when css file not available a recompile is needed
 * (Is this handled by WP_less)
 * 
 * Is done after plugins have been loaded.
 * 
 * --------------------
 */
function set_page_attributes_for_less( )
{
	$WPLessPlugin = WPLessPlugin::getInstance( );
	$WPLessPlugin -> setAttributes( get_theme_mods( ) );
}
add_action( 'plugins_loaded', 'set_page_attributes_for_less' ); 

/**
 * --------------------
 * Frontpage posts
 * Create a custom post for frontend items that can be attached.
 * 
 * Optionally allow attaching of existing posts for widgets,
 * In that case this chapter can be removed
 * 
 * --------------------
 */




