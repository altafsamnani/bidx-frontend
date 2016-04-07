<?php


class expressform {

    /**
     * Constructor
     * Registers hooks for ajax requests and security related material
     * Also registers the scripts for expressform.
     */


    static $deps = array( 'jquery', 'bootstrap', 'underscore', 'backbone', 'json2',
        'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-globalchecks', 'bidx-elements', 'bidx-interactions', 'bidx-reflowrower', 'bidx-industries','bidx-cover', 'bidx-data', 'bidx-i18n', 'bidx-tagsinput',
        'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods',
        'bidx-location', 'bidx-chosen', 'jquery-fitvids', 'jquery-raty'
    );


    function __construct() {

        add_action( 'wp_enqueue_scripts', array( &$this, 'set_expressform_bidx_ui_libs' ) );
    }

    /**
     * Load the scripts and css belonging to this function
     */
    function set_expressform_bidx_ui_libs()
    {
       // wp_register_script ('facebook-campaign', plugins_url( 'static/js/facebook.js', __FILE__ ), array(), '20160202', TRUE );
        wp_register_script( 'expressform', plugins_url( 'static/js/expressform.js', __FILE__ ), self::$deps, '20160202', TRUE );
    }

    /**
     * Load the content.
     * Dynamic action needs to be added here
     * @param $atts
     */
    function load($atts)
    {
        // 1. Template Rendering
        require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
        $view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/expressform/templates/' );

        require_once( BIDX_PLUGIN_DIR .'/../services/member-service.php' );
        $memberObj = new MemberService( );

        require_once( BIDX_PLUGIN_DIR .'/../services/businesssummary-service.php' );
        $businessSummaryObj         =   new BusinessSummaryService( );

        $session                    =   BidxCommon::$staticSession;

        $sessionData                =   $session->data;

        // 3. Service Business Summary (entity)
        $bidxBusinessSummary        =   $sessionData->wp->entities->bidxBusinessSummary;

        if ( isset ($session->requestedBusinessSummaryId ) )
        {
            $businessSummaryId = $session->requestedBusinessSummaryId;

            $businessSummaryResult      =   $businessSummaryObj->getSummaryDetails( $businessSummaryId );
        }
        else
        {
            $businessSummaryResult      =   $businessSummaryObj->getExpressFormSubmission( $bidxBusinessSummary );
        }

        // 2. Render Member Profile Services for Initial View Display
        $memberResult               =   $memberObj->getMemberDetails(  );

        $memberData                 =   (isset($memberResult->data)) ? $memberResult->data:NULL;

        $businessData               =   (isset($businessSummaryResult->data)) ? $businessSummaryResult->data:NULL;

         if ( isset( $businessSummaryResult -> data -> bidxMeta -> bidxCompletionMesh) ) {
                $completeness = $businessSummaryResult -> data -> bidxMeta -> bidxCompletionMesh;

                //TODO : structurally fix this using the scoring service
                $view->completenessScore = round($completeness);
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


        // 4. Determine the view needed
        $view->sessionData          =   $sessionData;
        $view->businessSummaryData  =   $businessData;
        $view->memberData           =   $memberData;

        //Localize to js variables, currently to use focusexpertise for mentoring to display match
        $jsParams = array(
                            'member'    => $view->memberData
                        ,   'business'  => $view->businessSummaryData
                        ,   'usdIdr'   => BIDX_USD_IDR
                        );

        wp_localize_script ('bidx-data', '__bidxExpressForm', $jsParams);

        $view -> render('expressform.phtml');

    }
}

?>