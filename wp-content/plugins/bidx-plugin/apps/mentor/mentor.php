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
                $mentorProfile = $sessionSvc->isHavingProfile ('bidxMentorProfile');
               
                /*************** Mentor **********************/
                if ($mentorProfile ) {

                    $view->isMentor = true;
                    wp_register_script ('mentor', plugins_url ('static/js/mentor-mentordashboard.js', __FILE__), self::$deps, '20140307', TRUE);                    
           
                } 

                /*************** Entrpreneur *****************/
                $mentorEntrpreneurProfile = $sessionSvc->isHavingProfile ('bidxEntrepreneurProfile');
                
                if ($mentorEntrpreneurProfile ) {
                    
                    $view->isEntrpreneur = true;
                    wp_register_script ('mentor-mentordashboard', plugins_url ('static/js/mentor-mentordashboard.js', __FILE__), self::$deps, '20140307', TRUE);                    
                    wp_register_script ('mentor', plugins_url ('static/js/entrepreneur-mentordashboard.js', __FILE__), array('mentor-mentordashboard'), '20140307', TRUE);                    
                   
                } 

                $template = 'dashboard/dashboard.phtml' ;

                break;


        }

        (isset ($template)) ? $view->render ($template) : '';

    }

}

?>
