<?php
/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @author Mattijs Spierings
 * @version 1.0
 */
class mail {

    static $deps = array( 'bidx-common','bidx-i18n', 'jquery-validation',
            'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods', 'bidx-chosen'

    );

    /**
     * Constructor
     */
    function __construct() {
        add_action( 'wp_enqueue_scripts', array( &$this, 'register_mail_bidx_ui_libs' ) );
    }

    /**
     * Register scripts and styles
     */
    function register_mail_bidx_ui_libs()
    {
        wp_register_script( 'mail', plugins_url( 'static/js/mail.js', __FILE__ ), self::$deps, '20130715', TRUE );
    }

    /**
     * Load the content.
     * Dynamic action needs to be added here
     * @param $atts
     */
    function load($atts) {
        //return file_get_contents ( BIDX_PLUGIN_DIR . '/mail/static/templates/default.html' );

        /* 1 Template Rendering */
        require_once(BIDX_PLUGIN_DIR . '/templatelibrary.php');
        $view = new TemplateLibrary(BIDX_PLUGIN_DIR . '/mail/templates/');
        $view -> sessionData = BidxCommon::$staticSession;

        //2. Service Group
        //require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
        //$groupSvc = new GroupService( );

        // 3. Determine the view needed
        $command = $atts['view'];

        switch ($command) {
            default:
                $template = 'views.phtml';
                break;
        }
        $view->render($template);
    }
}

?>