<?php
require_once(BIDX_PLUGIN_DIR .'/../apps/common.php' );

class memberprofile {

	static $deps = array('jquery', 'jqueryui', 'bootstrap', 'underscore', 'backbone', 'json2', 'bidx-fileupload', 'bidx-form', 'bidx-form-element', 'bidx-location', 'bidx-utils', 'bidx-country-autocomplete', 'bidx-api-core');

 	/**
	 * Constructor
	 */
  	function __construct() {

    //$bidCommonObj = new BidxCommon();
    BidxCommon::checkSession();
    //$bidCommonObj->checkSession();
   
		add_action( 'wp_enqueue_scripts', array( &$this, 'register_memberprofile_bidx_ui_libs' ) );

     
     
      //$resultDisplay = $this->injectJsVariables($sessionData, $data); //




        }
	
	/**
	 * Register scripts and styles
	 */
	function register_memberprofile_bidx_ui_libs() {		
	  wp_register_script( 'memberprofile', plugins_url( 'static/js/memberprofile.js', __FILE__ ), self :: $deps, '20130501', TRUE );
	  wp_register_style( 'memberprofile', plugins_url( 'static/css/memberprofile.css', __FILE__ ), array(), '20130501', 'all' );
	  wp_enqueue_style( 'memberprofile' );
	}



/**
 * Add script block to footer
 */
function bidx_memberprofile_add_to_footer() {

echo "<script>
      window.bidx = bidx || {};
      window.bidx.api = {
        settings: {
                  servicesPath:   '../../static/js/bidxAPI/services/'
                }
        };
    </script>";

}
	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */
	function load($atts) {

   
    /* 1 Template Rendering */
     require_once(BIDX_PLUGIN_DIR .'/templatelibrary.php');
     $view = new TemplateLibrary(BIDX_PLUGIN_DIR.'/memberprofile/templates/');

    /* 2. Service MemberProfile*/
    require_once( BIDX_PLUGIN_DIR .'/../services/member-service.php' );
    $memberObj = new MemberService( );

  
    
    /* 3. Render Member Profile Services for Initial View Display */
    $memberData = $memberObj->getMemberDetails(  );
    $view->data = $memberData->data;

    /* 4. Call the Display Component */
    add_action( 'wp_footer', array( &$this ,'bidx_memberprofile_add_to_footer' ) );
		require_once ( BIDX_PLUGIN_DIR . '/memberprofile/memberprofile_component.php' );
	}

  
}
