<?php

/**
 *
 * @author Arne de Bree
 * @version 1.0
 */
class company
{

    public $scriptInject;

    static $deps = array ('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2','gmaps-places', 'holder', 'bidx-form', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                              'jquery-validation', 'jquery-validation-jqueryui-datepicker', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods', 'bidx-chosen');

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
        wp_register_style ('company', plugins_url ('static/css/company.css', __FILE__), array (), '20130501', 'all');
        wp_enqueue_style ('company');
    }

    /**
     * Load the content.
     * @param $atts attributes from the shorttag
     */
    function load ($atts)
    {

        // 1. Template Rendering
        require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
        $view = new TemplateLibrary (BIDX_PLUGIN_DIR . '/company/templates/');
        $view->sessionData = BidxCommon::$staticSession;

        //2. Service company
        require_once( BIDX_PLUGIN_DIR . '/../services/company-service.php' );
        $companySvc = new CompanyService( );

        // 3. Determine the view needed
        $command = null;
        if (isset ($atts) && isset ($atts['view'])) {
            $command = $atts['view'];
        }


        $sessionData = BidxCommon::$staticSession;

        $companyId = null;
        if (isset ($atts) && isset ($atts['id'])) {
            $companyId = $atts['id'];
        } else if (isset ($sessionData->companyId)) {
            $companyId = $sessionData->companyId;
        }

        switch ($command) {
            case 'list-companies' :
                // TODO: Chris will lookup what API to use for listing the companies of a member
                return $view->render ('company-list.phtml');
            default :
                if ($companyId) {
                    $view->company = $companySvc->getCompanyDetails ($companyId);
                }
                $view->noheader = $atts['noheader'];
                return $view->render ('company.phtml');
        }
    }

}
