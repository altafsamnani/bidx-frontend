<?php
/**
 * Authentication and registration content loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @author Altaf Samnani (ajax functions)
 * @author msp (js app)
 * @version 1.0
 */
class account {

    /**
     * Constructor
     * Registers hooks for ajax requests and security related material
     * Also registers the scripts for register.
     */

    static $deps = array ('jquery', 'bootstrap', 'underscore', 'backbone', 'json2', 'bidx-location', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                        'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');


    function __construct() {

        add_action( 'wp_enqueue_scripts', array( &$this, 'set_register_bidx_ui_libs' ) );
    }

    /**
     * Load the scripts and css belonging to this function
     */
    function set_register_bidx_ui_libs() {

        //$deps = array( 'bootstrap','memberprofile') ;
        //$deps = $this->getWidgetJsDependency('register');
        //$deps = array('bootstrap');
        wp_register_script( 'account', plugins_url( 'static/js/account.js', __FILE__ ), self::$deps, '20131017', TRUE );
        /*wp_register_style( 'register', plugins_url( 'static/css/register.css', __FILE__ ), array(), '20130501', 'all' );*/
        wp_enqueue_style( 'account' );
    }

    /**
     * Load the content.
     * Dynamic action needs to be added here
     * @param $atts
     */
    function load($atts) {
        // 1. Template Rendering
        require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
        $view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/account/templates/' );
        // 2. Determine the view needed


        $render    = array_key_exists( 'view', $atts ) ? $atts['view'] : "account";

        // ob_start is necessary to capture the shortcode response. ob_get_Clean returns the captured content
        //
        ob_start();
        $view -> render( $render . '.phtml' );
        return ob_get_clean();


    }
}

?>
