<?php
/**
 * Rank and Review.
 *
 * @version 1.0
 */
class review
{

    // TODO Arjan clean up
    static $deps = array ('jquery', 'jquery-ui-widget', 'bootstrap', 'underscore', 'backbone', 'json2', 'bidx-common', 'bidx-i18n', 'jquery-validation',
      'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods','bidx-chosen','jquery-raty');


    function __construct() {
        add_action( 'wp_enqueue_scripts', array( &$this, 'register_review_bidx_ui_libs' ) );
    }

    /**
     * Load the scripts and css belonging to this function
     */
    function register_review_bidx_ui_libs() {
        wp_register_script( 'review', plugins_url( 'static/js/review.js', __FILE__ ), self::$deps, '20141006', TRUE );
        wp_enqueue_style( 'review' );
    }

    /**
     * Load the content.
     * @param $atts
     */
    function load($atts) {
        // 1. Template Rendering
        require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
        $view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/review/templates/' );
        $view -> sessionData = BidxCommon::$staticSession;

        // 2. Determine the view needed
        $render    = array_key_exists( 'view', $atts ) ? $atts['view'] : "reviewSession";

        $view -> render( $render . '.phtml' );
    }
}

?>