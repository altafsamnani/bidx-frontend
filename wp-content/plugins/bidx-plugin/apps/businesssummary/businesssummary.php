<?php

/**
* @author Arne de Bree
* @version 1.0
*/
class businesssummary
{
    static $deps = array( 'jquery', 'bootstrap', 'underscore', 'backbone', 'json2',
        'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-reflowrower', 'bidx-data', 'bidx-i18n', 'bidx-tagsinput',
        'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods',
        'bidx-location', 'bidx-chosen', 'jquery-fitvids', 'jquery-raty'
    );

    /**
    * Constructor
    */
    function __construct()
    {
        add_action('wp_enqueue_scripts', array(&$this, 'register_businesssummary_bidx_ui_libs'));
    }

    /**
    * Load the scripts and css belonging to this function
    */
    function register_businesssummary_bidx_ui_libs()
    {
        /* Common mentoring functions & mentoring activities functions */
     ;
        wp_register_script ('bp-mentor', plugins_url ('../mentor/static/js/common-mentordashboard.js', __FILE__), $deps, '20140307', TRUE);
        $deps = array_merge( self :: $deps, array(  'bp-mentor' ) );
        //$deps = self::$deps;

        wp_register_script('businesssummary', plugins_url('static/js/businesssummary.js', __FILE__), $deps, '20130501', TRUE);
    }

    /**
    * Load the content.
    * Dynamic action needs to be added here
    * @param $atts
    */
    function load($atts) {

        /* 1 Template Rendering */
        require_once(BIDX_PLUGIN_DIR .'/templatelibrary.php');
        $view = new TemplateLibrary(BIDX_PLUGIN_DIR.'/businesssummary/templates/');

        $sessionData = BidxCommon::$staticSession;

        $businessSummaryId = null;
        if (isset ($atts) && isset ($atts['id'])) {
            $businessSummaryId = $atts['id'];
        } else if (isset ($sessionData->requestedBusinessSummaryId)) {
            $businessSummaryId = $sessionData->requestedBusinessSummaryId;
        }

        if ( !is_null( $businessSummaryId )) {
            /* 2. Service Business Summary (entity)*/
            require_once( BIDX_PLUGIN_DIR .'/../services/businesssummary-service.php' );
            $businessSummaryObj = new BusinessSummaryService( );

            /* 3. Render Services for Initial View Display */
            $businessSummaryData = $businessSummaryObj->getSummaryDetails( $businessSummaryId );

            $view->data = $businessSummaryData->data;

            if ( isset( $businessSummaryData -> data -> completeness ) ) {
            	$completeness = $businessSummaryData -> data -> completeness;

            	//TODO : structurally fix this using the scoring service
            	$view->completenessScore = round(($completeness / 68)*100);
            	if ( $view->completenessScore < 30 ) {
            		$view->completenessColour = 'incomplete';
            	} else if ( $view->completenessScore < 60 ) {
            		$view->completenessColour = 'medium';
            	} else {
            		$view->completenessColour = 'good';
            	}
            }
            else {
            	$view->completenessScore = 0;
            	$view->completenessColour = 'red';
            }

            // TODO Arjan TODO Altaf use some admin setting
            $ratingEnabledForGroup = true;
            
            if ( $ratingEnabledForGroup )
            {
	            /* Fetch the entity rating. */
	            require_once( BIDX_PLUGIN_DIR .'/../services/rating-service.php' );
	            $ratingServiceObj = new RatingService( );
	            $ratingData = $ratingServiceObj->getRating( $businessSummaryId );
	            $view->rating = $ratingData->data;
            }
        }

        $view->render('businesssummary.phtml');
    }
}

?>
