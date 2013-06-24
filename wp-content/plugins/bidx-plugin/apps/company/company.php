<?php

require_once(BIDX_PLUGIN_DIR . '/../apps/common.php' );

/**
 *
 * @author Arne de Bree
 * @version 1.0
 */
class company
{

    static $deps = array ('jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2',
      'gmaps-places', 'holder', 'bidx-form',
      'bidx-utils', 'bidx-api-core', 'bidx-common');
    public $scriptInject;

    /**
     * Constructor
     */
    function __construct ()
    {
        //$subDomain = $this->getBidxSubdomain ();

       // $bidCommonObj = new BidxCommon ($subDomain);
        //$this->scriptInject = $bidCommonObj->getScriptJs ($subDomain);

        add_action ('wp_enqueue_scripts', array (&$this, 'register_company_bidx_ui_libs'));
    }

    /**
     * Registers the search specific javascript and css files
     */
    public function register_company_bidx_ui_libs ()
    {
        wp_register_script ('company', plugins_url ('static/js/company.js', __FILE__), self :: $deps, '20130501', TRUE);
        wp_register_style ('company', plugins_url ('static/css/company.css', __FILE__), array (), '20130501', 'all');
        wp_enqueue_style ('company');
    }

    /**
     * Grab the subdomain portion of the URL. If there is no sub-domain, the root
     * domain is passed back. By default, this function *returns* the value as a
     * string.
     *
     * @param bool $echo optional parameter prints the response directly to
     * the screen.
     */
    function getBidxSubdomain ($echo = false)
    {
        $hostAddress = explode ('.', $_SERVER ["HTTP_HOST"]);
        if (is_array ($hostAddress)) {
            if (eregi ("^www$", $hostAddress [0])) {
                $passBack = 1;
            } else {
                $passBack = 0;
            }
            if ($echo == false) {
                return ( $hostAddress [$passBack] );
            } else {
                echo ( $hostAddress [$passBack] );
            }
        } else {
            return ( false );
        }
    }

    /**
     * Load the content.
     * @param $atts attributes from the shorttag
     */
    function load ($atts)
    {

        // 1. Template Rendering
        require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
        $view = new TemplateLibrary (BIDX_PLUGIN_DIR . '/company/static/templates/');
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
            $bpSummary = true;
            $view->bpSummary = true;
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
                    ($bpSummary) ? $view->company->bidxCanEdit = false : '';
                }
                return $view->render ('company.phtml');
        }
    }

}
