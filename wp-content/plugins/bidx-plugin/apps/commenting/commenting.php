<?php
/**
 * Commenting, including private notes, administrator annotations, and mentor/investor feedback.
 *
 * @version 1.0
 */
class commenting
{

    static $deps = array ('bidx-common', 'bidx-i18n', 'jquery-validation',
      'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods','bidx-chosen');


    function __construct() {

        add_action( 'wp_enqueue_scripts', array( &$this, 'set_register_bidx_ui_libs' ) );
    }

    /**
     * Load the scripts and css belonging to this function
     */
    function set_register_bidx_ui_libs() {
        wp_register_script( 'commenting', plugins_url( 'static/js/commenting.js', __FILE__ ), self::$deps, '20140911', TRUE );
        /*wp_register_style( 'register', plugins_url( 'static/css/commenting.css', __FILE__ ), array(), '20140911', 'all' );*/
        wp_enqueue_style( 'commenting' );
    }

    /**
     * Load the content.
     * Dynamic action needs to be added here
     * @param $atts
     */
    function load($atts) {
        // 1. Template Rendering
        require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
        $view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/commenting/templates/' );
        // 2. Determine the view needed

        $render    = array_key_exists( 'view', $atts ) ? $atts['view'] : "commenting";

        // ob_start is necessary to capture the shortcode response. ob_get_Clean returns the captured content
        //
        //ob_start();
        $view -> render( $render . '.phtml' );
        //return ob_get_clean();


    }
}

?>