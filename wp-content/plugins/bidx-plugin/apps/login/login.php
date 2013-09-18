<?php
/**
 * Authentication and registration content loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @author Altaf Samnani (ajax functions)
 * @author msp (js app)
 * @version 1.0
 */
class login {

    /**
     * Constructor
     * Registers hooks for ajax requests and security related material
     * Also registers the scripts for login.
     */

    static $deps = array ('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2', 'holder', 'bidx-form', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                        'jquery-validation', 'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');


    function __construct() {

        add_action( 'wp_enqueue_scripts', array( &$this, 'register_login_bidx_ui_libs' ) );
    }

    /**
     * Load the scripts and css belonging to this function
     */
    function register_login_bidx_ui_libs() {

        //$deps = array( 'bootstrap','memberprofile') ;
        //$deps = $this->getWidgetJsDependency('login');
        //$deps = array('bootstrap');
        wp_register_script( 'login', plugins_url( 'static/js/login.js', __FILE__ ), self::$deps, '20130501', TRUE );
        wp_register_style( 'login', plugins_url( 'static/css/login.css', __FILE__ ), array(), '20130501', 'all' );
        wp_enqueue_style( 'login' );
    }

    /**
     * Load the content.
     * Dynamic action needs to be added here
     * @param $atts
     */
    function load($atts) {
        // 1. Template Rendering
        require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
        $view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/login/templates/' );
        // 2. Determine the view needed


        $render    = array_key_exists( 'view', $atts ) ? $atts['view'] : "login";
        $view -> render( $render . '.phtml' );

    }
}

?>
