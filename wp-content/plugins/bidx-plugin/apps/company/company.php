<?php

/**
 *
 * @author Arne de Bree
 * @version 1.0
 */
class company
{

    public $scriptInject;

    // Added by Tarek
    public $company_name_for_title_tag = '';

    static $deps = array ('jquery', 'jquery-ui-widget','bootstrap', 'underscore', 'backbone', 'json2', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                            'bidx-reflowrower',  'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods', 'bidx-chosen', 'bidx-reflowrower','google-jsapi');

    /**
     * Constructor
     */
    function __construct ()
    {
        add_action ('wp_enqueue_scripts', array (&$this, 'register_company_bidx_ui_libs'));
    }

    /**
     * Registers the search specific javascript and css files
     */
    public function register_company_bidx_ui_libs ()
    {
        wp_register_script ('company', plugins_url ('static/js/company.js', __FILE__), self::$deps, '20130501', TRUE);
    }

    //Added by Tarek
    function company_wp_title( $title, $sep ) {

        $new_title = $title . $sep . $company_name_for_title_tag;

        return $new_title;
    }

    /**
     * Load the content.
     * @param $atts attributes from the shorttag
     */
    function load ($atts)
    {

        // 1. Template Rendering
        require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
        require_once( BIDX_PLUGIN_DIR . '/../services/company-service.php' );

        $view               = new TemplateLibrary (BIDX_PLUGIN_DIR . '/company/templates/');
        $sessionData        = BidxCommon::$staticSession;
        $view->sessionData  = $sessionData;
        $companyId          = null;
        $command            = null;
        $view->companyTitle = false;

        //2. Service company
        $companySvc = new CompanyService( );


        //3. Determine the view needed
        if (isset ($atts) && isset ($atts['view'])){
            $command = $atts['view'];
        }

        if (isset ($atts) && isset ($atts['id']))   {
            $companyId          = $atts['id'];
        } else if (isset ($sessionData->companyId)) {
            $companyId          = $sessionData->companyId;
        }

        switch ($command) {
            case 'list-companies' :
                // TODO: Chris will lookup what API to use for listing the companies of a member
                return $view->render ('company-list.phtml');
                break;

            default :

                if ($companyId) {
                    $view->company = $companySvc->getCompanyDetails ($companyId);
                    $view->companyTitle = true;
                    // Added by Tarek
                    $company_name_for_title_tag = $view->company->name;
                }

                // Added by Tarek
                add_filter( 'wp_title', 'company_wp_title', 10, 2 );

                $view->noheader = $atts['noheader'];

                return $view->render ('company.phtml');
        }
    }

}
