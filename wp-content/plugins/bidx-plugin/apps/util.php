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
add_option( BIDX_VERSION_KEY, BIDX_VERSION_NUM );

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
$log_file_name = BIDX_PLUGIN_DIR . '/debug.log';

$logAppenders[ 'file' ] = array(
		'class'		=> 'LoggerAppenderDailyFile',
		'layout'	=> array(
			'class'		=> 'LoggerLayoutPattern'
		   ,'layout'    => array(
	                        'class'	 => 'LoggerLayoutPattern'
	                       ,'params' => array(
	                        	'conversionPattern' => '%date %logger %-5level %msg%n'
	                        )
                		),
                		
		)
	   ,'params' => array(
				'file'	=> $log_file_name
		)
); 

Logger::configure( 
	array(
		'rootLogger'    => array(
			'appenders'     => array_keys( $logAppenders )
			,'level'        => 'TRACE'
		)
	,'appenders' => $logAppenders
	)
);

Logger::getLogger ( 'util' ) -> trace("Defined BIDX_THEME_DIR : ". BIDX_THEME_DIR);
Logger::getLogger ( 'util' ) -> trace("Defined BIDX_PLUGIN_NAME : ". BIDX_PLUGIN_NAME);
Logger::getLogger ( 'util' ) -> trace("Defined BIDX_PLUGIN_DIR : ". BIDX_PLUGIN_DIR);
Logger::getLogger ( 'util' ) -> trace("Defined BIDX_PLUGIN_URL : ". BIDX_PLUGIN_URL);
Logger::getLogger ( 'util' ) -> trace("Defined BIDX_version : ". BIDX_VERSION_NUM);

?>