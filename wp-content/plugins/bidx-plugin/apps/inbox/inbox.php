<?php
/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class inbox {

    /**
     * Constructor
     */
    function __construct() {
        add_action( 'wp_enqueue_scripts', array( &$this, 'register_inbox_bidx_ui_libs' ) );
    }

    /**
     * Register scripts and styles
     */
    function register_inbox_bidx_ui_libs()
    {
        wp_register_script( 'inbox', plugins_url( 'static/js/inbox.js', __FILE__ ), array('bootstrap'), '20130501', TRUE ); 
        wp_register_style( 'inbox', plugins_url( 'static/css/inbox.css', __FILE__ ), array('bootstrap','bootstrap-responsive'), '20130501', 'all' );
    }

    /**
     * Load the content.
     * Dynamic action needs to be added here
     * @param $atts
     */

    function load($atts) {
        //return file_get_contents ( BIDX_PLUGIN_DIR . '/inbox/static/templates/default.html' );

        /* 1 Template Rendering */
        require_once(BIDX_PLUGIN_DIR . '/templatelibrary.php');
        $view = new TemplateLibrary(BIDX_PLUGIN_DIR . '/inbox/templates/');
        $view -> sessionData = BidxCommon::$staticSession;

        //2. Service Group
        //require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
        //$groupSvc = new GroupService( );
        
        // 3. Determine the view needed
        $command = $atts['view'];

        switch ($command) {
            case 'overview':
                $template = 'overview.phtml';
                break;
            default:
                $template = 'overview.phtml';
                break;
        }
        $view->render($template);

        

    }

    
}

?>