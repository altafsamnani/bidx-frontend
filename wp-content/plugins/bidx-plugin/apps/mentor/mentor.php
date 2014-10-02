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
      'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods','bidx-chosen');



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

            case 'dashboard' :

                $sessionSvc = new SessionService( );

                /*************** Entrpreneur *****************/
                $isEntrpreneur = $sessionSvc->isHavingProfile ('bidxEntrepreneurProfile');
                $isMentor      = $sessionSvc->isHavingProfile ('bidxMentorProfile');
                $isGroupOwner  = $sessionSvc->isAdmin ( );

                if ( $isEntrpreneur || $isMentor || $isGroupowner ) {

                    $deps = self::$deps;

                    if( $isEntrpreneur  ) {

                        $view->isEntrpreneur = true;

                        /* Entrpreneur mentoring functions & mentoring activities functions */
                        wp_register_script ('entrepreneur-mentor', plugins_url ('static/js/entrepreneur-mentordashboard.js', __FILE__), array( ), '20140307', TRUE);

                        $deps[] = 'entrepreneur-mentor';
                    }

                    if( $isGroupOwner && false  ) {

                        $view->isGroupOwner = true;

                        /* Groupowner mentoring functions & mentoring activities functions */
                        wp_register_script ('groupowner-mentor', plugins_url ('static/js/groupowner-mentordashboard.js', __FILE__), array( ), '20140307', TRUE);

                        $deps[] = 'groupowner-mentor';
                    }

                    if( $isMentor ) {

                        $view->isMentor = true;

                        /* Mentor mentoring functions & mentoring activities functions */
                        wp_register_script ('mentor-mentor', plugins_url ('static/js/mentor-mentordashboard.js', __FILE__), array( ), '20140307', TRUE);

                        $deps[] = 'mentor-mentor';

                    }

                    /* Common mentoring functions & mentoring activities functions */
                    wp_register_script ('mentor', plugins_url ('static/js/common-mentordashboard.js', __FILE__), $deps, '20140307', TRUE);

                }

                $template = 'dashboard/main.phtml' ;

                break;

        }

        (isset ($template)) ? $view->render ($template) : '';

    }

}

?>
