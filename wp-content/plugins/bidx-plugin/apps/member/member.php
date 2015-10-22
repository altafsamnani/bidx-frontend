<?php

/**
 *
 * @author Altaf Samnani
 * @version 1.0
 */
class member {

	static $deps = array( 'jquery', 'bootstrap', 'underscore', 'backbone', 'json2'
			,'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-globalchecks', 'bidx-elements', 'bidx-interactions', 'bidx-reflowrower','bidx-industries', 'bidx-data', 'bidx-i18n', 'bidx-tagsinput',
			'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods',
			'bidx-location','bidx-chosen', 'bidx-tagging', 'bidx-connect', 'jquery-event-ue', 'jquery-udraggable','google-jsapi'
	);

 	/**
     * Constructor
     */
  	function __construct()
  	{
		//add_action('wp_enqueue_scripts', array(&$this, 'register_member_bidx_ui_libs')); #BIDX-2568
  	}

	/**
	 * Register scripts and styles
	 */
	static function register_member_bidx_ui_libs() {

		wp_register_script( 'entrepreneurprofile', 	plugins_url( 'static/js/entrepreneurprofile.js', 	__FILE__ ), array(), '20130501', TRUE );
		wp_register_script( 'investorprofile', 		plugins_url( 'static/js/investorprofile.js', 		__FILE__ ), array(), '20130701', TRUE );
		wp_register_script( 'memberprofile',		plugins_url( 'static/js/memberprofile.js', 			__FILE__ ), array(), '20130808', TRUE );
		wp_register_script( 'mentorprofile',		plugins_url( 'static/js/mentorprofile.js', 			__FILE__ ), array(), '20131111', TRUE );
		wp_register_script( 'mentoringrequest',		plugins_url( 'static/js/mentoringrequest.js', 		__FILE__ ), array(), '20140411', TRUE );
        wp_register_script( 'common-mentor',		plugins_url ('../mentor/static/js/common-mentordashboard.js', __FILE__), NULL , '20140307', TRUE);

		$deps = array_merge( self :: $deps, array(  	'memberprofile'
													,	'entrepreneurprofile'
												 	,	'investorprofile'
													,	'mentorprofile'
													,	'mentoringrequest'
													,	'common-mentor'
												 ) );

	  	wp_register_script( 'member', plugins_url( 'static/js/member.js', __FILE__ ), $deps, '20130501', TRUE );
	}

	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */
	function load($atts) {

	    /* 1 Template Rendering */
	    require_once(BIDX_PLUGIN_DIR .'/templatelibrary.php');
	    $view = new TemplateLibrary(BIDX_PLUGIN_DIR.'/member/templates/');

		// 3. Determine the view needed
		$command = ( isset( $atts['view'] ) ) ? $atts['view']: NULL;

		switch ( $command ) {
			case 'entrepreneur-profile-links':
				$view->render('entrepreneur-profile-links.phtml');
			break;

			case 'investor-profile-links':
				$view->render('investor-profile-links.phtml');
			break;

			case 'mentor-profile-links':
				$view->render('mentor-profile-links.phtml');
			break;

			default:
				add_action('wp_enqueue_scripts', self::register_member_bidx_ui_libs());
			    /* 2. Service MemberProfile*/
			    require_once( BIDX_PLUGIN_DIR .'/../services/member-service.php' );
			    $memberObj = new MemberService( );

			    /* 3. Render Member Profile Services for Initial View Display */
			    $memberData = $memberObj->getMemberDetails(  );

			    $view->data = (isset($memberData->data)) ? $memberData->data:NULL;

			    $sessionSvc = new SessionService( );

                /*************** Is investor or groupadmin *****************/
                $view->isLoggedInInvestor      = $sessionSvc->isHavingProfile ('bidxInvestorProfile');
                $view->isLoggedInGroupOwner    = $sessionSvc->isAdmin ( );


			    //Localize to js variables, currently to use focusexpertise for mentoring to display match
			    $jsParams = array('member' => $view->data);
			    wp_localize_script ('bidx-data', '__bidxMember', $jsParams);

			    $view->bidxGroupDomain = (isset($memberData->bidxGroupDomain)) ? $memberData->bidxGroupDomain : NULL;
			    $view->sessionData = BidxCommon::$staticSession;

	      		$view->render('member.phtml');
		}
	}
}
