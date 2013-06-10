<?php
require_once(BIDX_PLUGIN_DIR .'/../apps/common.php' );

/**
 *
 * @author Altaf Samnani
 * @version 1.0
 */
class memberprofile {

	static $deps = array( 'jquery', 'jquery-ui', 'bootstrap', 'underscore', 'backbone', 'json2',
			'gmaps-places', 'holder', 'bidx-form', 'bidx-utils', 'bidx-api-core', 'bidx-common' );

 	public $scriptInject ;

 	/**
   * Constructor
   */
  function __construct() {
    $subDomain = $this->getBidxSubdomain();

    $bidCommonObj = new BidxCommon($subDomain);
    $this->scriptInject = $bidCommonObj->getScriptJs($subDomain);

    add_action('wp_enqueue_scripts', array(&$this, 'register_memberprofile_bidx_ui_libs'));
    add_action('wp_head', array(&$this, 'addJsVariables'));
  }

   function addJsVariables() {
	echo "<script>
	      window.bidx = window.bidx || {};
	      window.bidx.api = {
	        settings: {
	                  servicesPath:   '/wp-content/plugins/bidx-plugin/static/js/bidxAPI/services/'
	                }
	        };
	    </script>";

     echo $this->scriptInject;
   }

	/**
	 * Register scripts and styles
	 */
	function register_memberprofile_bidx_ui_libs() {

		wp_register_script( 'entrepreneurprofile', plugins_url( 'static/js/entrepreneurprofile.js', __FILE__ ), array(), '20130501', TRUE );

		$deps = array_merge( self :: $deps, array( 'entrepreneurprofile' ) );

	  	wp_register_script( 'memberprofile', plugins_url( 'static/js/memberprofile.js', __FILE__ ), $deps, '20130501', TRUE );
	  	wp_register_style( 'memberprofile', plugins_url( 'static/css/memberprofile.css', __FILE__ ), array(), '20130501', 'all' );
	  	wp_enqueue_style( 'memberprofile' );
	}

   /**
	 * Grab the subdomain portion of the URL. If there is no sub-domain, the root
	 * domain is passed back. By default, this function *returns* the value as a
	 * string.
	 *
	 * @param bool $echo optional parameter prints the response directly to
	 * the screen.
	 */
	function getBidxSubdomain($echo = false) {
		$hostAddress = explode( '.', $_SERVER ["HTTP_HOST"] );
		if ( is_array($hostAddress) ) {
			if ( eregi( "^www$", $hostAddress [0] ) ) {
				$passBack = 1;
			}
			else {
				$passBack = 0;
			}
			if ( $echo == false ) {
				return ( $hostAddress [$passBack] );
			}
			else {
				echo ( $hostAddress [$passBack] );
			}
		}
		else {
			return ( false );
		}
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

	    $view->bidxGroupDomain = $memberData->bidxGroupDomain;
	    $view->sessionData = BidxCommon::$staticSession;

      	$view->render('member.phtml');
	}
}
