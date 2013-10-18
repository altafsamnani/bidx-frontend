<?php

/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class dashboard
{

    static $deps = array ('bidx-form', 'bidx-tagsinput', 'bidx-common', 'bidx-i18n', 'jquery-validation',
      'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');

    /**
     * Constructor
     */
    function __construct ()
    {
        add_action ('wp_enqueue_scripts', array (&$this, 'register_dashboard_bidx_ui_libs'));
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
                if ($investorProfile) {

                    $investorDashboard = get_option ('investor-startingpage', 1); // Getting investor dashboard option not show help page or not 0 - dashboard page 1 - help page default 2- select as starting page option

                    if ($investorDashboard) {
                        ($investorDashboard != 2 ) ? update_option ('investor-startingpage', 0) : $view->startingPage = $investorDashboard;
                        
                        $template = 'investor/help.phtml';
                    } else {
                        $template = 'investor/dashboard.phtml';
                    }
                } else {
                    $view->return_404 ();
                }
                break;
            case 'entrepreneur-dashboard':
                wp_register_script ('dashboard', plugins_url ('static/js/entrepreneur-dashboard.js', __FILE__), self::$deps, '20130715', TRUE);        
                $sessionSvc = new SessionService( );
                $entrepreneurProfile = $sessionSvc->isHavingProfile( 'bidxEntrepreneurProfile' );
            
                if ($entrepreneurProfile) {
                   
                    $entrepreneurDashboard = get_option ('entrepreneur-startingpage', 1); // Getting investor dashboard option not show help page or not 0 - dashboard page 1 - help page default 2- select as starting page option
                  
                    if ($entrepreneurDashboard) {
                        ($entrepreneurDashboard != 2 ) ? update_option ('entrepreneur-startingpage', 0) : $view->startingPage = $entrepreneurDashboard;
                        
                        $template = 'entrepreneur/help.phtml';
                    } else {
                        $template = 'entrepreneur/dashboard.phtml';
                    }
                } else {
                    $view->return_404 ();
                }
                break;
            case 'group-dashboard':
                wp_register_script ('dashboard', plugins_url ('static/js/investor-dashboard.js', __FILE__), self::$deps, '20130715', TRUE);
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
                            $template = 'group-dashboard.phtml';
                            break;

                        case 'invite' :
                            $template = 'invite-members.phtml';
                            break;
                        case 'gettingstarted' :
                            $template = 'getting-started.phtml';
                            break;
                        case 'support' :
                            $template = 'support.phtml';
                            break;
                        case 'groupsettings' :

                            require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
                            $groupSvc = new GroupService( );
                            $view->group = $groupSvc->getGroupDetails ();

                            $template = 'group-settings.phtml';
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