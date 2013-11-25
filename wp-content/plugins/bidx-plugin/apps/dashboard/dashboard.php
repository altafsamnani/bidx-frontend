<?php

/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class dashboard
{

    static $deps = array ('bidx-tagsinput', 'bidx-common', 'bidx-i18n', 'jquery-validation',
      'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');

    /**
     * Constructor
     */
    function __construct ()
    {
        add_action ('wp_enqueue_scripts', array (&$this, 'register_dashboard_bidx_ui_libs'));

        /* Wordpress Control Panel Scripts*/
        add_action ('admin_enqueue_scripts', array (&$this, 'register_wp_dashboard_bidx_ui_libs'));

    }

    /**
     * Register scripts and styles
     */
    function register_dashboard_bidx_ui_libs ()
    {
        //Adding js in Load function as we need it different for investor/entrpreneur/groupadmin(wordpress)
        wp_register_style ('dashboard', plugins_url ('static/css/dashboard.css', __FILE__), array (), '20130715', 'all'); /* should load mail css, not all other css files from other apps */
        wp_enqueue_style ('dashboard');

    }

    /* Load Group Owner/Admin Dashboard Widget Css Scripts
    * @author Altaf Samnani
    * @version 1.0
    *
    */
    function register_wp_dashboard_bidx_ui_libs ()
    {
        $menuTitle       = strtolower (str_replace (" ", "", get_admin_page_title ()));
        $currentUser     = wp_get_current_user ();
        $isBidxAdminPage = false;

        if (in_array (WP_ADMIN_ROLE, $currentUser->roles) || in_array (WP_OWNER_ROLE, $currentUser->roles) ) {

            switch ($menuTitle) {

                case 'monitoring':
                    roots_scripts();

                    $mailDepArr = array ('bidx-tagsinput','bootstrap-paginator', 'bidx-delaykeyup','bidx-common', 'bidx-i18n', 'jquery-validation',
                      'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');

                    /* Style */
                    wp_register_style ('monitoring', '/wp-content/plugins/bidx-plugin/apps/dashboard/static/css/monitoring.css', array (), '20130715', TRUE);
                    wp_enqueue_style ('monitoring');

                    /* Script */
                    wp_register_script ('monitoring', '/wp-content/plugins/bidx-plugin/apps/dashboard/static/js/monitoring.js', $mailDepArr, '20130715', TRUE);

                    break;

                case 'invite-members':

                    /* Style */
                    wp_register_style ('invite-members', '/wp-content/plugins/bidx-plugin/apps/dashboard/static/css/invite-members.css', array (), '20130715', TRUE); /* should load mail css, not all other css files from other apps */
                    wp_enqueue_style ('invite-members');

                    break;

                 case 'getting-started':

                    /* Style */
                    wp_register_style ('getting-started', '/wp-content/plugins/bidx-plugin/apps/dashboard/static/css/getting-started.css', array (), '20130715', TRUE); /* should load mail css, not all other css files from other apps */
                    wp_enqueue_style ('getting-started');

                    break;


                //Will be working on this
                case 'support':
                    $mailDepArr = array ('bidx-tagsinput', 'bidx-common', 'bidx-i18n', 'jquery-validation',
                      'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');

                    /* Style */
                    wp_register_style ('mail', '/wp-content/plugins/bidx-plugin/apps/mail/static/css/mail.css', array (), '20130715', TRUE); /* should load mail css, not all other css files from other apps */
                    wp_register_style ('support', '/wp-content/plugins/bidx-plugin/apps/mail/static/css/support.css', array ('mail'), '20130715', TRUE); /* should load mail css, not all other css files from other apps */
                    wp_enqueue_style ('support');

                    /* Script */
                    wp_register_script ('support', '/wp-content/plugins/bidx-plugin/apps/mail/static/js/mail.js', $mailDepArr, '20130715', TRUE);

                    break;

                case 'group-settings' :
                    $companyDepArr = array ('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2', 'gmaps-places', 'holder', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                      'jquery-validation', 'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods', 'bidx-location');
                    $groupDepArr = array ('jquery', 'bootstrap', 'bidx-location', 'bidx-utils', 'bidx-api-core','company');

                    /* Style */
                    wp_register_style ('group', '/wp-content/plugins/bidx-plugin/apps/group/static/css/group.css', array (), '20130501', 'all');
                    wp_register_style ('group-settings', '/wp-content/plugins/bidx-plugin/apps/dashboard/static/css/group-settings.css', array ( 'group' ), '20130715', TRUE); /* should load mail css, not all other css files from other apps */
                    wp_enqueue_style ('group-settings');

                    /* Script */
                    wp_register_script ('company', '/wp-content/plugins/bidx-plugin/apps/company/static/js/company.js', $companyDepArr, '20130501', TRUE);
                    wp_register_script ('group-settings', '/wp-content/plugins/bidx-plugin/apps/group/static/js/group.js', $groupDepArr, '20130501', TRUE);

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
        $view = new TemplateLibrary (BIDX_PLUGIN_DIR . '/dashboard/templates/');

        $sessionData = BidxCommon::$staticSession;
        $view->sessionData = $sessionData;

        //2. Service Group
        //require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
        //$groupSvc = new GroupService( );
        // 3. Determine the view needed
        $command = $atts['view'];

        switch ($command) {
            case 'my-dashboard':
                $template = 'my-dashboard.phtml';
                break;
            case 'investor-dashboard':
                wp_register_script ('dashboard', plugins_url ('static/js/investor-dashboard.js', __FILE__), self::$deps, '20130715', TRUE);
                $sessionSvc = new SessionService( );
                $investorProfile = $sessionSvc->isHavingProfile( 'bidxInvestorProfile' );
                $view->groupOwnersIdsArr     = $sessionSvc->getGroupOwnerIds( );

                if ($investorProfile) {

                    $investorDashboard = get_option ('investor-startingpage', 1); // Getting investor dashboard option not show help page or not 0 - dashboard page 1 - help page default 2- select as starting page option
                    $view->startingPage = 0;
                    if ($investorDashboard) {
                        ($investorDashboard != 2 ) ? update_option ('investor-startingpage', 0) : $view->startingPage = $investorDashboard;

                    }

                    $template = 'investor/dashboard.phtml';
                } else {
                    $view->return_404 ();
                }
                break;
            case 'entrepreneur-dashboard':
                wp_register_script ('dashboard', plugins_url ('static/js/entrepreneur-dashboard.js', __FILE__), self::$deps, '20130715', TRUE);
                $sessionSvc = new SessionService( );
                $entrepreneurProfile = $sessionSvc->isHavingProfile( 'bidxEntrepreneurProfile' );
                $view->groupOwnersIdsArr     = $sessionSvc->getGroupOwnerIds( );

                if ($entrepreneurProfile) {

                    $entrepreneurDashboard = get_option ('entrepreneur-startingpage', 1); // Getting investor dashboard option not show help page or not 0 - dashboard page 1 - help page default 2- select as starting page option
                    $view->startingPage = 0;
                    if ($entrepreneurDashboard) {
                        ($entrepreneurDashboard != 2 ) ? update_option ('entrepreneur-startingpage', 0) : $view->startingPage = $entrepreneurDashboard;
                    }

                    $template = 'entrepreneur/dashboard.phtml';
                } else {
                    $view->return_404 ();
                }
                break;
            case 'group-dashboard':
                //wp_register_script ('dashboard', plugins_url ('static/js/investor-dashboard.js', __FILE__), self::$deps, '20130715', TRUE);
                if (isset ($view->sessionData->data) && isset ($view->sessionData->data->currentGroup)) {
                    $menu = $atts['menu'];
                    switch ($menu) {
                        case 'monitoring':
                            require_once( BIDX_PLUGIN_DIR . '/../services/mail-service.php' );
                            $msgSvc = new MailService( );
                            $view->compose = $msgSvc->getMessageTemplate ('welcome');

                            require_once( BIDX_PLUGIN_DIR . '/../services/search-service.php' );
                            $service = new SearchService( );
                            $groupId = $view->sessionData->data->currentGroup;

                            /* Bidx Member Query */
                            $searchParams['q'] = '*:*';
                            $searchParams['fq'] = 'type:bidxMemberProfile AND groupIds:' . $groupId;
                            $searchParams['sort'] = 'created desc';
                            $searchParams['rows'] = '0';
                            $memberProfileQuery = $service->cookQuery ($searchParams);
                            $memberProfileResults = $service->getSearchResults ($memberProfileQuery);
                            $results->memberProfileCount = $memberProfileResults->data->numFound;



                            /* Bidx Entrepreneur Query */
                            $searchParams['fq'] = 'type:bidxEntrepreneurProfile AND groupIds:' . $groupId;
                            $entrepreneurProfileQuery = $service->cookQuery ($searchParams);
                            $entrepreneurResults = $service->getSearchResults ($entrepreneurProfileQuery);
                            $results->entrepreneurCount = $entrepreneurResults->data->numFound;

                            /* Bidx Investor Query */
                            $searchParams['fq'] = 'type:BidxInvestorProfile AND groupIds:' . $groupId;
                            $investorProfileQuery = $service->cookQuery ($searchParams);
                            $investorResults = $service->getSearchResults ($investorProfileQuery);
                            $results->investorCount = $investorResults->data->numFound;

                            $view->data = $results;


                            require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
                            $groupSvc = new GroupService( );
                            $view->members = $groupSvc->getLatestMembers ();
                            $template = 'groupowner/monitoring.phtml';
                            break;

                        case 'invite-members' :
                            $template = 'groupowner/invite-members.phtml';
                            break;
                        case 'getting-started' :
                            $template = 'groupowner/getting-started.phtml';
                            break;
                        case 'support' :
                            $template = 'groupowner/support.phtml';
                            break;
                        case 'group-settings' :

                            require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
                            $groupSvc = new GroupService( );
                            $view->group = $groupSvc->getGroupDetails ();

                            $template = 'groupowner/group-settings.phtml';
                            break;
                    }
                }


                break;
            default:

                $template = 'my-dashboard.phtml';
                break;
        }
        $view->render ($template);
    }

}

?>
