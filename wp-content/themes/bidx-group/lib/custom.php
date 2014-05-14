<?php

/**
 * --------------------
 * Configure WP-Less for using customizer data --> whenever theme panel data has changed.
 * Keep in mind that the customizer data is stored and when css file not available a recompile is needed
 * (Is this handled by WP_less)
 * 
 * Is done after plugins have been loaded.
 * 
 * TODO : wp-less not loaded ?? fallback to less.js but ensure that a warning is shown
 * For less fallback do ensure variables are set in JavaScript
 * 
 * <script>
  less.modifyVars({
  '@buttonFace': '#5B83AD',
  '@buttonText': '#D9EEF2'
});

  less = {
    env: "development", //production caches in localstorage
    logLevel: 2,
    async: false,
    fileAsync: false,
    poll: 1000,
    functions: {},
    dumpLineNumbers: "comments",
    relativeUrls: false,
    globalVars: {
      var1: '"string value"',
      var2: 'regular value'
    },
    rootpath: ":/a.com/"
  };


</script>
 * 
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




