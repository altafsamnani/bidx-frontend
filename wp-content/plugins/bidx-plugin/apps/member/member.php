<?php

/**
 *
 * @author Altaf Samnani
 * @version 1.0
 */
class member {

	static $deps = array( 'jquery', 'bootstrap', 'underscore', 'backbone', 'json2'
			,'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-reflowrower', 'bidx-data', 'bidx-i18n', 'bidx-tagsinput',
			'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods',
			'bidx-location','bidx-chosen', 'typeahead', 'jquery-event-ue', 'jquery-udraggable','google-jsapi'
	);

 	/**
     * Constructor
     */
  	function __construct()
  	{
		add_action('wp_enqueue_scripts', array(&$this, 'register_member_bidx_ui_libs'));
  	}

	/**
	 * Register scripts and styles
	 */
	function register_member_bidx_ui_libs() {

		wp_register_script( 'entrepreneurprofile', 	plugins_url( 'static/js/entrepreneurprofile.js', 	__FILE__ ), array(), '20130501', TRUE );
		wp_register_script( 'investorprofile', 		plugins_url( 'static/js/investorprofile.js', 		__FILE__ ), array(), '20130701', TRUE );
		wp_register_script( 'memberprofile',		plugins_url( 'static/js/memberprofile.js', 			__FILE__ ), array(), '20130808', TRUE );
		wp_register_script( 'mentorprofile',		plugins_url( 'static/js/mentorprofile.js', 			__FILE__ ), array(), '20131111', TRUE );
		wp_register_script( 'mentoringrequest',		plugins_url( 'static/js/mentoringrequest.js', 		__FILE__ ), array(), '20140411', TRUE );

		$deps = array_merge( self :: $deps, array(  	'memberprofile'
													,	'entrepreneurprofile'
												 	,	'investorprofile'
													,	'mentorprofile'
													,	'mentoringrequest'
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
		$command = $atts['view'];

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
			    /* 2. Service MemberProfile*/
			    require_once( BIDX_PLUGIN_DIR .'/../services/member-service.php' );
			    $memberObj = new MemberService( );

			    /* 3. Render Member Profile Services for Initial View Display */
			    $memberData = $memberObj->getMemberDetails(  );

			    $view->data = (isset($memberData->data)) ? $memberData->data:NULL;

			    $view->bidxGroupDomain = (isset($memberData->bidxGroupDomain)) ? $memberData->bidxGroupDomain : NULL;
			    $view->sessionData = BidxCommon::$staticSession;

	      		$view->render('member.phtml');
		}
	}
}
