<?php
/**
 * Bidx Admin Page class.
 *
 *
 * The class takes the following arguments
 * - $hook 				- the hook of the 'parent' (menu top-level page).
 * - $title 			- the browser window title of the page
 * - $menu 				- the page title as it appears in the menu
 * - $permissions 		- the capability a user requires to see the page
 * - $slug 				- a slug identifier for this page
 * - $body_content_cb 	- (optional) a callback that prints to the page, above the metaboxes.
 *
 * Example use
 * $my_admin page = new Bidx_Admin_Page('my_hook','My Admin Page','My Admin Page', 'manage_options','my-admin-page')
 * Note -
 * JsLibraries are registered in shortcode.php through admin_init & admin_print_footer_scripts plz refer that
 *
 *
 */
require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );
include_once( ABSPATH . 'wp-admin/includes/plugin.php' );

class Bidx_Admin_Admin
{
	public $items;

	public $logger;

	public $menuTitle;

	public $adminPageArr;

	function __construct()
	{
		$currentUser 		= wp_get_current_user ();

		$this->logger 		= Logger::getLogger (__CLASS__);
		//Group admn / owner scripts
        if (in_array (WP_ADMIN_ROLE, $currentUser->roles) || in_array (WP_OWNER_ROLE, $currentUser->roles))
        {
        	$this->load_group_admin_xml( );

        	add_action ('admin_menu', array(&$this, 'group_admin_menu'));

            add_action ('admin_init', array (&$this, 'register_group_owner_admin_scripts'));

	        add_action ('admin_print_footer_scripts', array (&$this, 'bidx_group_admin_owner_footer'));

        }
	}

	function register_group_owner_admin_scripts ()
    {

        $this->menuTitle    = strtolower(get_admin_page_title ());

        if(in_array( $this->menuTitle, $this->adminPageArr))
        {
	        $bidxJsDir = sprintf ('%s/../static/js',    BIDX_PLUGIN_URI);
	        $vendorDir = sprintf ('%s/../static/vendor', BIDX_PLUGIN_URI);

	        wp_enqueue_style('bidx-admin-plugin', get_template_directory_uri() . '/../../plugins/bidx-plugin/static/css/bidx-plugin-admin.css', false, null);

	        wp_register_script ('google-jsapi', '//www.google.com/jsapi', array (), '20130501', TRUE);

	        wp_register_script ('jquery-validation', $bidxJsDir . '/vendor/jquery.validate.js', array ('jquery'), '1.1.11', true);

	        wp_register_script ('jquery-validation-additional-methods', $bidxJsDir . '/vendor/additional-methods.js', array ('jquery-validation'), '1.1.11', true);

	        wp_register_script ('jquery-validation-bidx-additional-methods', $bidxJsDir . '/additional-methods.js', array ('jquery-validation'), '20130812', true);

            wp_register_script ('jquery-fakecrop', $bidxJsDir . '/vendor/jquery.fakecrop.js', array ('jquery'), '20140327', TRUE);

            wp_register_script ('admin-chosen', $vendorDir . '/chosen_v1.0.0/chosen.jquery.js', array ('jquery'), '20131111', TRUE);



	        wp_register_script ('bidx-admin-api-core', $bidxJsDir . '/bidxAPI/api-core.js', array ('jquery' ), '20130501', TRUE);

	        wp_register_script ('bidx-admin-utils', $bidxJsDir . '/utils.js', array ('jquery' ), '20130501', TRUE);

	        wp_register_script ('bidx-admin-data', $bidxJsDir . '/data.js', array ( 'jquery' ), '20130626', TRUE);

	        $this->bidx_admin_print_i18nJs( );

	        wp_register_script ('bidx-admin-i18n', $bidxJsDir . '/i18n.js', array ('jquery' ) , '20130626', TRUE);

	        wp_register_script ('bidx-admin-common', $bidxJsDir . '/common.js', array ('bidx-admin-utils', 'bidx-api-core', 'bidx-admin-data' , 'jquery-validation', 'bidx-admin-i18n', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods'), '20130501', TRUE);

	        wp_register_script ('bidx-admin-controller', $bidxJsDir . '/controller.js', array ('bidx-admin-utils', 'bidx-admin-api-core', 'bidx-admin-data', 'backbone'), '20130501', TRUE);

            wp_register_script ('bidx-admin-chosen',  $bidxJsDir . '/bidx-chosen.js', array ('jquery', 'admin-chosen'),  '20131118', TRUE);

	        wp_enqueue_script ('bidx-admin-common');

	        wp_enqueue_script ('bidx-admin-controller');
        }

    }

    function bidx_group_admin_owner_footer ()
    {
        if(in_array( $this->menuTitle, $this->adminPageArr))
        {
    		wp_print_scripts ($this->menuTitle);
        }
    }

    function load_group_admin_xml()
    {

    	$adminHookXml     =   BIDX_PLUGIN_DIR . '/../pages/admin.xml';

        //try /catch / log ignore
        $document = simplexml_load_file( $adminHookXml );

        $this->logger->trace( 'Start processing file : ' . $document );

        $this->items = $document->xpath ( '//item' );

        $this->logger->trace( 'Found items : ' . sizeof( $this->items ) );


        foreach ( $this->items as $item )
        {
        	$dashboardPages =	(string) $item->title;
    		$this->adminPageArr[]   =   strtolower($dashboardPages);

        }
    }

	function group_admin_menu( )
	{
        foreach ( $this->items as $item )
        {
        	$fileName   =  strtolower( $item->title );

        	require_once( BIDX_PLUGIN_DIR . "/../admin/{$fileName}/{$fileName}.php" );

			$className	=	'Bidx_Admin_'.ucfirst($fileName);

        	$adminTab	=	new $className ( $item );
        }
	}

	function bidx_admin_print_i18nJs ( )
    {

        $bidxCommonObj = new BidxCommon();

        $appTranslationsArr = $bidxCommonObj->getLocaleTransient (array ($this->menuTitle), $static = true, $i18nGlobal = true);

        // 1. I18n  & Global Data
        wp_localize_script ('bidx-admin-data', '__bidxI18nPreload', $appTranslationsArr['i18n']); //http://www.ronakg.com/2011/05/passing-php-array-to-javascript-using-wp_localize_script/
        // 2. Static Data
        wp_localize_script ('bidx-admin-data', '__bidxDataPreload', $appTranslationsArr['static']); //http://www.ronakg.com/2011/05/passing-php-array-to-javascript-using-wp_localize_script/

    }

}

$bidxAdminClass = new Bidx_Admin_Admin ( );

?>