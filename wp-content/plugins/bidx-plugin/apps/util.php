<?php
/**
 * Utility file to be included in root plugin for
 * - easy configuration support
 * - autoloading support
 * - configuration of logger
 *
 * @author Jaap Gorjup
 * @version 1.0
 */

require 'vendor/log4php/Logger.php';
/* Almost irritatingly wordpress doesn’t load the current user and auth cookie vars until after plugins are loaded.
 * This means that you have to grab the current user by adding a callback to the action `plugins_loaded`.
 * In my case my plugin was providing hooks for other plugins,
 * and it needed to be able to provide the current user as a `WP_User` object before the `plugins_loaded` hook.
 * @Link http://wordpress.stackexchange.com/questions/4163/how-is-network-activate-different-from-activate-by-implementation
 * @Link http://david-coombes.com/wordpress-get-current-user-before-plugins-loaded/
 */
if (!function_exists ('wp_get_current_user'))
    require_once(ABSPATH . "wp-includes/pluggable.php");

wp_cookie_constants ();

/**
 * Generic paths
 */

if ( !defined( 'BIDX_THEME_DIR' ) ) {
	define( 'BIDX_THEME_DIR', ABSPATH . 'wp-content/themes/' . get_template() );
}
if ( !defined( 'BIDX_PLUGIN_NAME' ) ) {
	define( 'BIDX_PLUGIN_NAME', trim( dirname( plugin_basename( __FILE__ ) ), '/' ) );
}
if ( !defined( 'BIDX_PLUGIN_DIR') ) {
	define( 'BIDX_PLUGIN_DIR', WP_PLUGIN_DIR . '/' . BIDX_PLUGIN_NAME );
}
if ( !defined( 'BIDX_PLUGIN_URL' ) ) {
	define( 'BIDX_PLUGIN_URL', WP_PLUGIN_URL . '/' . BIDX_PLUGIN_NAME );
}
if ( !defined( 'BIDX_PLUGIN_URI' ) ) {
	define( 'BIDX_PLUGIN_URI', '/wp-content/plugins/' . BIDX_PLUGIN_NAME );
}
//Versioning config
if ( !defined( 'BIDX_VERSION_KEY') ) {
	define( 'BIDX_VERSION_KEY', 'BIDX_version' );
}
if ( !defined('BIDX_VERSION_NUM') ) {
	define( 'BIDX_VERSION_NUM', '0.1.2' );
}
/** OpenId Bidx URL **/
if ( !defined('BIDX_OPENID_URL') ) {
	define( 'BIDX_OPENID_URL', 'http://test.bidx.net/api/v1/openid/sso' );
    //define('BIDX_OPENID_URL','http://bas.bidx.net:8080/app/api/v1/openid/sso');
}

/***** Wordpress Roles for Bidx ******/
/* Wordpress Group Owner Role */
if ( !defined('WP_OWNER_ROLE') ) {
    define( 'WP_OWNER_ROLE', 'groupowner' );
}

/* Wordpress Group Admin Role */
if ( !defined('WP_ADMIN_ROLE') ) {
    define( 'WP_ADMIN_ROLE', 'groupadmin' );
}

/* Wordpress Group Member Role */
if ( !defined('WP_MEMBER_ROLE') ) {
    define( 'WP_MEMBER_ROLE', 'groupmember' );
}

/* Wordpress Group Anonymous Role */
if ( !defined('WP_ANONYMOUS_ROLE') ) {
    define( 'WP_ANONYMOUS_ROLE', 'groupanonymous' );
}

/******** Bidx API Roles **************/
/* Bidx Group Owner Role */
if ( !defined('BIDX_OWNER_ROLE') ) {
    define( 'BIDX_OWNER_ROLE', 'GroupOwner' );
}

/* Wordpress Group Admin Role */
if ( !defined('BIDX_ADMIN_ROLE') ) {
    define( 'BIDX_ADMIN_ROLE', 'GroupAdmin' );
}

/* Wordpress Group Member Role */
if ( !defined('BIDX_MEMBER_ROLE') ) {
    define( 'BIDX_MEMBER_ROLE', 'Member' );
}

/**** Bidx Login Priority who should login first ***/
if ( !defined('BIDX_LOGIN_PRIORITY') ) {
    //define( 'BIDX_LOGIN_PRIORITY', WP_OWNER_ROLE.'|'.WP_ADMIN_ROLE.'|'.WP_MEMBER_ROLE);
    define( 'BIDX_LOGIN_PRIORITY', BIDX_OWNER_ROLE.'|'.BIDX_ADMIN_ROLE.'|'.BIDX_MEMBER_ROLE);
}

//SLOW !!
//add_option( BIDX_VERSION_KEY, BIDX_VERSION_NUM );

/**
 * Logging configuration
 */

$logAppenders = array();

// CONSOLE
//
// $logAppenders[ 'console' ] = array(
// 		 'class' => 'LoggerAppenderConsole'
// 		,'params' => array (
// 			'target' => 'stderr'
// 		)
// 	);

// FILE
//
if (WP_DEBUG) {
	$log_file_name = BIDX_PLUGIN_DIR . '/plugin_debug.log';
	$level = 'TRACE';
} else {
	$log_file_name = BIDX_PLUGIN_DIR . '/var/log/bidx/plugin_debug.log';
	$level = 'ERROR';
}

$logAppenders[ 'file' ] = array(
		'class'		=> 'LoggerAppenderRollingFile',
		'layout'	=> array(
			'class'		=> 'LoggerLayoutPattern'
		   ,'layout'    => array(
	                        'class'	 => 'LoggerLayoutPattern'
	                       ,'params' => array(
	                        	'conversionPattern' => '%date %logger %-5level %msg%n'
	                        )
                		)
		 )
	     ,'params' => array(
				'file' 				=> $log_file_name,
				'maxFileSize' 		=> '5MB',
				'maxBackupIndex' 	=> 5
	       )
);

Logger::configure(
	array(
		'rootLogger'    => array(
			'appenders'     => array_keys( $logAppenders )
			,'level'        => $level
		)
	,'appenders' => $logAppenders
	)
);

Logger::getLogger ( 'util' ) -> trace("Defined BIDX_THEME_DIR : ". BIDX_THEME_DIR);
Logger::getLogger ( 'util' ) -> trace("Defined BIDX_PLUGIN_NAME : ". BIDX_PLUGIN_NAME);
Logger::getLogger ( 'util' ) -> trace("Defined BIDX_PLUGIN_DIR : ". BIDX_PLUGIN_DIR);
Logger::getLogger ( 'util' ) -> trace("Defined BIDX_PLUGIN_URL : ". BIDX_PLUGIN_URL);
Logger::getLogger ( 'util' ) -> trace("Defined BIDX_version : ". BIDX_VERSION_NUM);

// Do not show the default WordPress admin bar on top of the page after you have logged as admin
if (WP_DEVELOPMENT != true) {
	add_filter( 'show_admin_bar', '__return_false' );
}

/**
 * Add timeout for Bidx Services
 */
// function bidx_request_timeout_time($r) {
//   $r['timeout'] = 15; # new timeout
//   return $r;
// }
// add_filter('http_request_args', 'bidx_request_timeout_time', 100, 1);

// rewrite rule flush protection --> should be moved to the correct file


/**
 * This is added here to ensure that rewrites work fine.
 * Need to be placed in a different place later
 *
 */
add_filter('rewrite_rules_array', 'bidx_manage_rewrites');

function bidx_manage_rewrites( $rules ) {

	$bidx_rewrite_rules = get_option( 'BIDX_REWRITE_RULES' );
	Logger::getLogger ( 'util' ) -> trace( 'Stored Rewrite Rules : ');
	Logger::getLogger ( 'util' ) -> trace( $bidx_rewrite_rules );

	if ( isset( $bidx_rewrite_rules ) && is_array( $bidx_rewrite_rules ) ) {
    	foreach ( $rules as $rule => $rewrite ) {
    		if ( in_array( $bidx_rewrite_rules, $rule ) ) {
    			unset($bidx_rewrite_rules[$rule]);
    		}
    	}
    	$new_rules = $bidx_rewrite_rules + $rules;
    }
    else {
    	$new_rules = $rules;
    }

    return $new_rules;
}

?>
