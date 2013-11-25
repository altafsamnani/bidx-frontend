<?php

/**
* @author Arne de Bree
* @version 1.0
*/
class businesssummary
{
    static $deps = array( 'jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2',
        'gmaps-places', 'holder', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-reflowrower', 'bidx-data', 'bidx-i18n', 'bidx-tagsinput',
        'jquery-validation', 'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods',
        'bidx-location', 'bidx-chosen'
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
        wp_register_script('businesssummary', plugins_url('static/js/businesssummary.js', __FILE__), self :: $deps, '20130501', TRUE);
        wp_register_style('businesssummary', plugins_url('static/css/businesssummary.css', __FILE__), array(), '20130501', 'all');
        wp_enqueue_style('businesssummary');
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
        } else if (isset ($sessionData->businessSummaryId)) {
            $businessSummaryId = $sessionData->businessSummaryId;
        }

        if ( !is_null( $businessSummaryId )) {
            /* 2. Service Business Summary (entity)*/
            require_once( BIDX_PLUGIN_DIR .'/../services/businesssummary-service.php' );
            $businessSummaryObj = new BusinessSummaryService( );

            /* 3. Render Services for Initial View Display */
            $businessSummaryData = $businessSummaryObj->getSummaryDetails( );

            $view->data = $businessSummaryData->data;
        }

        $view->render('businesssummary.phtml');
    }
}

?>
