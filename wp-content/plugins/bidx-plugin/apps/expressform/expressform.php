<?php


class expressform {

    /**
     * Constructor
     * Registers hooks for ajax requests and security related material
     * Also registers the scripts for expressform.
     */

    static $deps = array ('facebook-campaign', 'jquery', 'bootstrap', 'underscore', 'backbone', 'json2', 'bidx-utils', 'bidx-industries', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                        'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');


    function __construct() {

        add_action( 'wp_enqueue_scripts', array( &$this, 'set_expressform_bidx_ui_libs' ) );
    }

    /**
     * Load the scripts and css belonging to this function
     */
    function set_expressform_bidx_ui_libs()
    {
        wp_register_script ('facebook-campaign', plugins_url( 'static/js/facebook.js', __FILE__ ), array(), '20160202', TRUE );
        wp_register_script( 'expressform', plugins_url( 'static/js/expressform.js', __FILE__ ), self::$deps, '20160202', TRUE );
    }

    /**
     * Load the content.
     * Dynamic action needs to be added here
     * @param $atts
     */
    function load($atts) {
        $siteUrl = get_site_url();
        $subdomain = BidxCommon::get_bidx_subdomain( false, $siteUrl );

        // 1. Template Rendering
        require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
        $view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/expressform/templates/' );
        // 2. Determine the view needed

        // ob_start is necessary to capture the shortcode response. ob_get_Clean returns the captured content
        //
        ob_start();
        $view -> render('expressform.phtml');
        return ob_get_clean();

    }
}

?>