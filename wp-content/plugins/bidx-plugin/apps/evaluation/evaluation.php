<?php

/**
* @author Arne de Bree
* @version 1.0
*/
class evaluation
{
    static $deps = array( 'jquery', 'bootstrap', 'underscore', 'backbone', 'json2',
        'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-globalchecks', 'bidx-elements', 'bidx-interactions', 'bidx-reflowrower', 'bidx-industries','bidx-cover', 'bidx-data', 'bidx-i18n', 'bidx-tagsinput',
        'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods',
        'bidx-location', 'bidx-chosen', 'bidx-connect', 'jquery-fitvids', 'jquery-raty'
    );

    /**
    * Constructor
    */
    function __construct()
    {
        add_action('wp_enqueue_scripts', array(&$this, 'register_evaluation_bidx_ui_libs'));
    }

    /**
    * Load the scripts and css belonging to this function
    */
    function register_evaluation_bidx_ui_libs()
    {
        $sessionData = BidxCommon::$staticSession;
        $businessSummaryId = $sessionData->requestedBusinessSummaryId;

        /* Common mentoring functions & mentoring activities functions */
        if( $businessSummaryId )
        {
            wp_register_script ('bp-mentor', plugins_url ('../mentor/static/js/common-mentordashboard.js', __FILE__), NULL , '20140307', TRUE);
            self::$deps[] = 'bp-mentor';

            wp_register_script ('commenting', plugins_url ('../commenting/static/js/commenting.js', __FILE__), NULL , '20140307', TRUE);;
            self::$deps[] = 'commenting';
        }

        //$deps = self::$deps;

        wp_register_script('evaluation', plugins_url('static/js/evaluation.js', __FILE__), self::$deps, '20130501', TRUE);

        /* Style 
        //wp_register_style ('mail', '/wp-content/plugins/bidx-plugin/apps/mail/static/css/mail.css', array (), '20130715', TRUE); 
        wp_register_style ('swype', 'http://code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2.min.css', array (), '20130715', TRUE); 
        wp_enqueue_style ('swype');*/
    }

     /**
    * Load the content.
    * Dynamic action needs to be added here
    * @param $atts
    */
    function load($atts) {

        /* 1 Template Rendering */
        require_once(BIDX_PLUGIN_DIR .'/templatelibrary.php');

        $view               =   new TemplateLibrary(BIDX_PLUGIN_DIR.'/evaluation/templates/');

        $sessionData        =   BidxCommon::$staticSession;

        $competitionData    =   (!empty($sessionData->competition) ) ? $sessionData->competition : NULL;

        $businessSummaryId  =   null;

       // $webapp             =   get_option('bidx-webapp');

      //  $competitionId      =   get_option('bidx-evaluation-competitionid');

        if ( $competitionData ) 
        {
            /* 2. Service Business Summary (entity)
            require_once( BIDX_PLUGIN_DIR .'/../services/competition-service.php' );

            $competitionObj = new CompetitionService( );

            //3. Render Services for Initial View Display 
            $competitionData = $competitionObj->getCompetitionDetails( $competitionId );*/

            $view->data = $competitionData;

            $jsData     = json_decode(json_encode($competitionData), true);

            wp_localize_script ('bidx-data', '__bidxCompetition', $jsData);

        }

        /*************** Is investor or groupadmin *****************/
        $sessionSvc             = new SessionService( );

        $isFrontendSessionSet   = $sessionSvc->isFrontendSessionSet( );

        if( $isFrontendSessionSet )
        {
            $template = 'evaluation.phtml';
            
            $view->render( $template );
        }
        else
        {
            $view->return_404 ();
        }

        
    }
}

?>
