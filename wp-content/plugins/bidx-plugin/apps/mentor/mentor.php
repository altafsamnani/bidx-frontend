<?php

/**
 * Search class loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @version 1.0
 */
class mentor
{

    static $deps = array ('bidx-tagsinput', 'bidx-common', 'bidx-i18n', 'jquery-validation',
      'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods');



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
        $view = new TemplateLibrary (BIDX_PLUGIN_DIR . '/mentor/templates/');

        $sessionData = BidxCommon::$staticSession;
        $view->sessionData = $sessionData;

        $command = $atts['view'];


        switch ($command) {

            case 'entrepreneur' :
                wp_register_script ('mentor', plugins_url ('static/js/entrepreneur-mentordashboard.js', __FILE__), self::$deps, '20140307', TRUE);

                $sessionSvc = new SessionService( );
                $mentorProfile = $sessionSvc->isHavingProfile ('bidxMentorProfile');
                $view->groupOwnersIdsArr = $sessionSvc->getGroupOwnerIds ();

                if ($mentorProfile || true) {

                    $mentorDashboard = get_option ('mentor-startingpage', 1); // Getting investor dashboard option not show help page or not 0 - dashboard page 1 - help page default 2- select as starting page option
                    $view->startingPage = 0;
                    if ($mentorDashboard) {
                        ($mentorDashboard != 2 ) ? update_option ('mentor-startingpage', 0) : $view->startingPage = $mentorDashboard;
                    }

                    $template = 'mentor/dashboard.phtml';
                } else {
                    $view->return_404 ();
                }

                break;

            case 'groupowner' :
                wp_register_script ('mentor', plugins_url ('static/js/groupowner-mentordashboard.js', __FILE__), self::$deps, '20140307', TRUE);

                $sessionSvc = new SessionService( );
                $mentorProfile = $sessionSvc->isHavingProfile ('bidxMentorProfile');
                $view->groupOwnersIdsArr = $sessionSvc->getGroupOwnerIds ();

                if ($mentorProfile || true) {

                    $mentorDashboard = get_option ('mentor-startingpage', 1); // Getting investor dashboard option not show help page or not 0 - dashboard page 1 - help page default 2- select as starting page option
                    $view->startingPage = 0;
                    if ($mentorDashboard) {
                        ($mentorDashboard != 2 ) ? update_option ('mentor-startingpage', 0) : $view->startingPage = $mentorDashboard;
                    }

                    $template = 'mentor/dashboard.phtml';
                } else {
                    $view->return_404 ();
                }

                break;

            case 'mentor' :
                wp_register_script ('mentor', plugins_url ('static/js/mentor-mentordashboard.js', __FILE__), self::$deps, '20140307', TRUE);

                $sessionSvc = new SessionService( );
                $mentorProfile = $sessionSvc->isHavingProfile ('bidxMentorProfile');
                $view->groupOwnersIdsArr = $sessionSvc->getGroupOwnerIds ();

                if ($mentorProfile || true) {

                    $mentorDashboard = get_option ('mentor-startingpage', 1); // Getting investor dashboard option not show help page or not 0 - dashboard page 1 - help page default 2- select as starting page option
                    $view->startingPage = 0;
                    if ($mentorDashboard) {
                        ($mentorDashboard != 2 ) ? update_option ('mentor-startingpage', 0) : $view->startingPage = $mentorDashboard;
                    }

                    $template = 'mentor/dashboard.phtml';

                } else {
                    $view->return_404 ();
                }

                break;


        }

        (isset ($template)) ? $view->render ($template) : '';

    }

}

?>
