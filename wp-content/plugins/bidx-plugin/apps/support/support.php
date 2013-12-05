<?php

/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
require_once( BIDX_PLUGIN_DIR . '/../services/support-service.php' );
class support
{

    static $deps = array ('bidx-tagsinput', 'bidx-common', 'bidx-i18n', 'jquery-validation',
      'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');

    static $supportSvc ;
    /**
     * Constructor
     */
    function __construct ()
    {
        self::$supportSvc = new SupportService(); //  Have to execute here, because its constructor injects scripts

        /* Wordpress Control Panel Scripts */
        add_action ('admin_enqueue_scripts', array (&$this, 'register_wp_dashboard_bidx_ui_libs'));
    }

    /* Load Group Owner/Admin Dashboard Widget Css Scripts
     * @author Altaf Samnani
     * @version 1.0
     *
     */

    function register_wp_dashboard_bidx_ui_libs ()
    {
        $menuTitle = strtolower (str_replace (" ", "", get_admin_page_title ()));
        $currentUser = wp_get_current_user ();
        $isBidxAdminPage = false;

        if (in_array (WP_ADMIN_ROLE, $currentUser->roles) || in_array (WP_OWNER_ROLE, $currentUser->roles)) {

            switch ($menuTitle) {

                //Will be working on this

                case 'support':
                    roots_scripts ()
;

                    $mailDepArr = array ('bootstrap-paginator', 'bidx-common', 'bidx-i18n', 'jquery-validation',
                      'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');

                    /* Style */
                    //wp_register_style ('mail', '/wp-content/plugins/bidx-plugin/apps/mail/static/css/mail.css', array (), '20130715', TRUE); /* should load mail css, not all other css files from other apps */
                    wp_register_style ('support', '/wp-content/plugins/bidx-plugin/apps/support/static/css/support.css', array (), '20130715', TRUE); /* should load mail css, not all other css files from other apps */
                    wp_enqueue_style ('support');

                    /* Script */
                    wp_register_script ('support', '/wp-content/plugins/bidx-plugin/apps/support/static/js/support.js', $mailDepArr, '20130715', TRUE);

                    break;
            }
        }
    }

    /**
     * Load the content.
     * Dynamic action needs to be added here
     * @param $atts
     */
    function load ($atts)
    {
        //return file_get_contents ( BIDX_PLUGIN_DIR . '/dashboard/static/templates/default.html' );

        /* 1 Template Rendering */
        require_once(BIDX_PLUGIN_DIR . '/templatelibrary.php');
        $view = new TemplateLibrary (BIDX_PLUGIN_DIR . '/support/templates/');

        $sessionData = BidxCommon::$staticSession;
        $view->sessionData = $sessionData;
        global $current_user;

        //2. Service Group
        //require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
        //$groupSvc = new GroupService( );
        // 3. Determine the view needed
        $command = $atts['view'];



        //wp_register_script ('dashboard', plugins_url ('static/js/investor-dashboard.js', __FILE__), self::$deps, '20130715', TRUE);
        if (isset ($view->sessionData->data) && isset ($view->sessionData->data->currentGroup)) {
            $menu = $atts['view'];
            switch ($menu) {
                case 'support' :
                    $template = 'support.phtml';
                    break;

                case 'view-zendesk-tickets' :
                    $auth = self::$supportSvc->bidx_zendesk_forced_login('altaf.samnani@bidnetwork.org', 'Admin1234!');
                    ob_start ();
                    self::$supportSvc->addBidxZendDisplay ('tickets-widget');
                    $view->zendeskView = ob_get_clean ();
                    $template = $menu.'.phtml';
                    break;


                case 'create-zendesk-tickets' :
                    $auth = self::$supportSvc->bidx_zendesk_forced_login('altaf.samnani@bidnetwork.org', 'Admin1234!');
                    ob_start ();
                    self::$supportSvc->addBidxZendDisplay ('contact-form');
                    $view->zendeskView = ob_get_clean ();
                    $template = $menu.'.phtml';
                    break;

            }
        }

        //echo $template;
        (isset ($template)) ? $view->render ($template) : '';
    }

}

?>
