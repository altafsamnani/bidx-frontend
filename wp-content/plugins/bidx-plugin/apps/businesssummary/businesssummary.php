<?php

/**
* @author Arne de Bree
* @version 1.0
*/
class businesssummary
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
        add_action('wp_enqueue_scripts', array(&$this, 'register_businesssummary_bidx_ui_libs'));
    }

    /**
    * Load the scripts and css belonging to this function
    */
    function register_businesssummary_bidx_ui_libs()
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

        wp_register_script('businesssummary', plugins_url('static/js/businesssummary.js', __FILE__), self::$deps, '20130501', TRUE);
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

        if (isset ($atts) && isset ($atts['id']))
        {
            $businessSummaryId = $atts['id'];
        } else if (isset ($sessionData->requestedBusinessSummaryId))
        {
            $businessSummaryId = $sessionData->requestedBusinessSummaryId;
        }

        if ( !is_null( $businessSummaryId ))
        {
            /* 2. Service Business Summary (entity)*/
            require_once( BIDX_PLUGIN_DIR .'/../services/businesssummary-service.php' );
            $businessSummaryObj = new BusinessSummaryService( );

            /* 3. Render Services for Initial View Display */
            $businessSummaryData    = $businessSummaryObj->getSummaryDetails( $businessSummaryId );

            $competitionIds = $businessSummaryData->data->bidxMeta->bidxCompetitionIds;

            if (!empty($competitionIds))
            {
                $competitionDataArray = array();

                require_once( BIDX_PLUGIN_DIR .'/../services/competition-service.php' );
                foreach( $competitionIds as $id )
                {
                    $competitionObj = new CompetitionService( );
                    $competitionData = $competitionObj->getCompetitionDetails( $id );
                    array_push($competitionDataArray, $competitionData->data);
                }

                $competitionData        = $competitionObj->isHavingCompetitionRole( $competitionDataArray );
            }

            $view->data             = $businessSummaryData->data;

            //Localize to js variables, currently to use focusexpertise for mentoring to display match
            $jsParams = array('business' => $view->data);
            wp_localize_script ('bidx-data', '__bidxBusiness', $jsParams);

            $view->competitionData  = $competitionData;

            if ( isset( $businessSummaryData -> data -> bidxMeta -> bidxCompletionMesh) ) {
                $completeness = $businessSummaryData -> data -> bidxMeta -> bidxCompletionMesh;

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

            /* Fetch the detailed rating if needed. The count and average are available in
             * the Entity API as well, but if the current user can rate we need more details,
             * such as the user's rating, for which we need to make another API call.
             */
            if( $businessSummaryData->data->bidxMeta->bidxCanRate ) {
                require_once (BIDX_PLUGIN_DIR . '/../services/rating-service.php');
                $ratingServiceObj = new RatingService ();
                $ratingData = $ratingServiceObj->getRating ( $businessSummaryId );
                $view->rating = $ratingData->data;
            }
        }

        /*************** Is investor or groupadmin *****************/
        $sessionSvc             = new SessionService( );
        $isFrontendSessionSet   = $sessionSvc->isFrontendSessionSet( );
        $template               = 'businesssummary-anonymous.phtml';

        if( $isFrontendSessionSet )
        {
            $template = 'businesssummary.phtml';
        }

        //HACK for SEO
        /*$mystring = ob_get_contents();
        ob_end_clean();

        $mystring = preg_replace('/(<title>)(.*?)(<\/title>)/', '$1' . $businessSummaryData->data->name . '$3', $mystring);

        echo $mystring;*/

        $view->render( $template );
    }
}

?>
