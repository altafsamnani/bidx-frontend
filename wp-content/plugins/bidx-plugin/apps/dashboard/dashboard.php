<?php

/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class dashboard
{

    static $deps = array ('bidx-tagsinput', 'bidx-common', 'bidx-globalchecks', 'bidx-elements', 'bidx-interactions', 'bidx-i18n', 'jquery-validation',
      'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods', 'bidx-mentor');

    /**
     * Constructor
     */
    function __construct ()
    {
        add_action ('wp_enqueue_scripts', array (&$this, 'register_dashboard_bidx_ui_libs'));

        /* Wordpress Control Panel Scripts */
        add_action ('admin_enqueue_scripts', array (&$this, 'register_wp_dashboard_bidx_ui_libs'));
    }

    /**
     * Register scripts and styles
     */
    function register_dashboard_bidx_ui_libs ()
    {

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

                case 'invite-members':

                    break;

                case 'getting-started':

                    break;

                //Will be working on this
                case 'group-settings' :
                    // roots_scripts ();
                    $companyDepArr = array ('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                      'jquery-validation', 'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods', 'bidx-chosen');

                    $groupDepArr = array ('jquery', 'bootstrap', 'bidx-location', 'bidx-utils', 'bidx-api-core', 'company');

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
            case 'investor-dashboard':
                wp_register_script ('dashboard', plugins_url ('static/js/investor-dashboard.js', __FILE__), self::$deps, '20130715', TRUE);
                $sessionSvc = new SessionService( );
                $investorProfile = $sessionSvc->isHavingProfile ('bidxInvestorProfile');
                $view->groupOwnersIdsArr = $sessionSvc->getGroupOwnerIds ();

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
                $entrepreneurProfile = $sessionSvc->isHavingProfile ('bidxEntrepreneurProfile');
                $view->groupOwnersIdsArr = $sessionSvc->getGroupOwnerIds ();

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
                            $template = 'groupowner/monitoring.phtml';
                            break;

                        case 'invite-members' :
                            $template = 'groupowner/invite-members.phtml';
                            break;

                        case 'getting-started' :
                            $template = 'groupowner/getting-started.phtml';
                            break;

                        case 'group-settings' :
                            require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
                            $groupSvc = new GroupService( );
                            $view->group = $groupSvc->getGroupDetails ();

                            $template = 'groupowner/group-settings.phtml';
                            break;
                        case 'competition' :
                            $template = 'groupowner/competition.phtml';

                    }
                }
                break;
            case 'competition-settings' :
                $view->isCompetition = get_option ('skipso-competition');
                $view->skipsoJudgeEmails = str_replace (",", "\n", get_option ('skipso-judge-emails'));
                $view->skipsoBackendEmails = str_replace (",", "\n", get_option ('skipso-backend-emails'));

                $view->skipsoFrontendUrl = get_option ('skipso-frontend-url');
                $view->skipsoBackendUrl = get_option ('skipso-backend-url');
                $view->skipsoJudgeUrl = get_option ('skipso-judge-url');

                $view->skipsoFrontendLogoutUrl = get_option ('skipso-frontend-logout');
                $view->skipsoBackendLogoutUrl = get_option ('skipso-backend-logout');
                $view->skipsoJudgeLogoutUrl = get_option ('skipso-judge-logout');

                $template = 'groupowner/competition-settings.phtml';
                break;

            case 'general-settings' :

                $view->groupNews = get_option ('group-news');
		if ( get_option ( 'bidx-ssoredirect-url' ) ) {
                	$view->ssoRedirect = true;
		} else {
			$view->ssoRedirect = false;
		}

                $view->ssoRedirectUrl = get_option( 'bidx-ssoredirect-url' );

                $template = 'groupowner/general-settings.phtml';
                break;

            default:

                $template = 'my-dashboard.phtml';
                break;
        }

        //echo $template;
        (isset ($template)) ? $view->render ($template) : '';
    }

}

?>
