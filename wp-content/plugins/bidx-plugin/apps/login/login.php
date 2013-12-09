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

    static $deps = array ('jquery', 'bootstrap', 'underscore', 'backbone', 'json2', 'holder', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                        'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');


    function __construct() {

        add_action( 'wp_enqueue_scripts', array( &$this, 'set_login_bidx_ui_libs' ) );
    }

    /**
     * Load the scripts and css belonging to this function
     */
    function set_login_bidx_ui_libs()
    {
        wp_register_script( 'login', plugins_url( 'static/js/login.js', __FILE__ ), self::$deps, '20130501', TRUE );
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
        $view->showLink = (isset($atts['link'])) ? $atts['link'] : "true";
        $view->redirectTo = isset($_GET['redirect_to']) ? $_GET['redirect_to'] : NULL ; // For SSO-Auth redirect_to = aHR0cHM6Ly9iaWR4Lm5ldC9hcHAvYXBpL3YxL29wZW5pZC9zc28=

        if(isset($atts['ssoauth'])) {
            $view->redirectTo = base64_encode(BIDX_OPENID_URL);
        }


        // ob_start is necessary to capture the shortcode response. ob_get_Clean returns the captured content
        //
        ob_start();
        $view -> render( $render . '.phtml' );
        return ob_get_clean();

    }
}

?>
