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

class Bidx_Admin_Admin
{
	public $ruleitems;

	function __construct()
	{
		$this->logger = Logger::getLogger (__CLASS__);

		add_action ('admin_menu', array(&$this, 'group_admin_menu'));
	}

	function group_admin_menu( )
	{
		$adminHookXml     =   BIDX_PLUGIN_DIR . '/../pages/admin.xml';



        //try /catch / log ignore
        $document = simplexml_load_file( $adminHookXml );

        $this->logger->trace( 'Start processing file : ' . $document );

        $items = $document->xpath ( '//item' );
        $this->logger->trace( 'Found items : ' . sizeof( $items ) );

        foreach ( $items as $item )
        {
        	$fileName   =  strtolower( $item->menu);
        	require_once( BIDX_PLUGIN_DIR . "/../admin/{$fileName}/{$fileName}.php" );

			$className	=	'Bidx_Admin_'.ucfirst($item->menu);

        	$adminTab	=	new $className ( $item );
        }


	}

}

$bidxAdminClass = new Bidx_Admin_Admin ();

?>