<?php

/**
 *
 * @author Arne de Bree
 * @version 1.0
 */
class media {

    static $deps = array( 'jquery', 'bootstrap', 'underscore', 'backbone', 'json2',
            'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-reflowrower', 'bidx-data', 'bidx-i18n', 'bidx-tagsinput', 'bidx-chosen',
            'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods',
            'jquery-fileupload'
    );

    static $loads = 0;


    /**
   * Constructor
   */
  function __construct() {


    add_action('wp_enqueue_scripts', array(&$this, 'register_bidx_ui_libs'));
  }

    /**
     * Register scripts and styles
     */
    function register_bidx_ui_libs() {
        wp_register_script( get_class(), plugins_url( 'static/js/media.js', __FILE__ ), self::$deps, '20130501', TRUE );
    }

    /**
     * Load the content.
     * Dynamic action needs to be added here
     * @param $atts
     */
    function load($atts) {

        self::$loads += 1;

        if ( self::$loads > 1 ) {
            return;
        }

        /* 1 Template Rendering */
        require_once(BIDX_PLUGIN_DIR .'/templatelibrary.php');
        $view = new TemplateLibrary(BIDX_PLUGIN_DIR.'/media/templates/');

        $view->sessionData = BidxCommon::$staticSession;

        $view->render('media.phtml');
    }
}
