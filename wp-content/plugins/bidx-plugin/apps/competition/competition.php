<?php

/**
* @author Altaf Samnani
* @version 1.0
*/
class competition
{
    static $deps = array( 'jquery', 'bootstrap', 'underscore', 'backbone', 'json2'
        , 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-reflowrower', 'bidx-industries','bidx-cover', 'bidx-data', 'bidx-i18n', 'bidx-tagsinput',
        'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods',
        'bidx-location', 'bidx-chosen', 'jquery-fitvids', 'jquery-raty', 'data-table', 'timer', 'typeahead'
    );

    /**
    * Constructor
    */
    function __construct()
    {
        add_action('wp_enqueue_scripts', array(&$this, 'register_competition_bidx_ui_libs'));
    }

    /**
    * Load the scripts and css belonging to this function
    */
    function register_competition_bidx_ui_libs()
    {
        /* Common mentoring functions & mentoring activities functions
        wp_register_script ('commenting', plugins_url ('../commenting/static/js/commenting.js', __FILE__), $deps, '20140307', TRUE);;
        wp_register_script ('bp-mentor', plugins_url ('../mentor/static/js/common-mentordashboard.js', __FILE__), $deps, '20140307', TRUE);
        $deps = array_merge( self :: $deps, array(  'bp-mentor', 'commenting' ) );
        */
        wp_register_script('competition', plugins_url('static/js/competition.js', __FILE__), self::$deps, '20130501', TRUE);

        $vendorDir = sprintf ('%s/../static/vendor', BIDX_PLUGIN_URI);

        //1. Load Js Libraries
        wp_register_script ('data-table', $vendorDir . '/DataTables-1.10.3/media/js/jquery.dataTables.js', array ('jquery'), '1.10.3', TRUE);
        wp_register_script ('typeahead', $vendorDir . '/typeahead.js-master/dist/typeahead.jquery.min.js', array ('jquery'), '0.10.5', TRUE);
        wp_register_script('timer',       '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.2/moment.min.js', array(), '20130501', TRUE);

        $deps = array_merge( self :: $deps, array(  'timer','data-table' ) );

        wp_register_script('competition', plugins_url('static/js/competition.js', __FILE__), $deps, '20130501', TRUE);
    }

    /**
    * Load the content.
    * Dynamic action needs to be added here
    * @param $atts
    */
    function load($atts) {

        /* 1 Template Rendering */
        require_once(BIDX_PLUGIN_DIR .'/templatelibrary.php');
        $view = new TemplateLibrary(BIDX_PLUGIN_DIR.'/competition/templates/');

        $sessionData = BidxCommon::$staticSession;

        $businessSummaryId = null;

        if (isset ($atts) && isset ($atts['id']))
        {
            $competitionId = $atts['id'];
        } else if (isset ($sessionData->competitionId))
        {
            $competitionId = $sessionData->competitionId;
        }

        if ( !is_null( $competitionId )) {
            /* 2. Service Business Summary (entity)*/
            require_once( BIDX_PLUGIN_DIR .'/../services/competition-service.php' );
            $competitionObj = new CompetitionService( );

            /* 3. Render Services for Initial View Display */
            $competitionData = $competitionObj->getCompetitionDetails( $competitionId );


            /*echo "<pre>";
            print_r($competitionData);
            echo "</pre>";exit;*/

            $view->data = $competitionData->data;

            $jsData     = json_decode(json_encode($competitionData->data), true);

            wp_localize_script ('bidx-data', '__bidxCompetition', $jsData);

        }

        /*************** Is investor or groupadmin *****************/
        $sessionSvc             = new SessionService( );
        $isFrontendSessionSet   = $sessionSvc->isFrontendSessionSet( );
        $template               = 'competition-anonymous.phtml';

        if( $isFrontendSessionSet )
        {
            $template = 'competition.phtml';
        }

        $view->render( $template );
    }
}

?>
