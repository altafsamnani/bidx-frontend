<?php 
/**
 * Invokes loader of binaries on the same proxy
 */

$parse_uri = explode( 'wp-content', $_SERVER['SCRIPT_FILENAME'] );
require_once( $parse_uri[0] . 'wp-load.php' );
require_once("bidx-cbi-plugin.php");

$cbi = new CBIShortCode();
$cbi->loadBinary();

?>