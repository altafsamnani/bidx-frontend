<?php
	
/**
 * Load the central wp-load file to start the page loading from theme
 */
$absolute_path = __FILE__;
$path_to_file = explode( 'wp-content', $absolute_path );
$path_to_wp = $path_to_file[0];
require_once( $path_to_wp.'/wp-load.php' );

/**
 * Generic resource includes for Javascript and CSS
 * according to: http://wp.tutsplus.com/articles/how-to-include-javascript-and-css-in-your-wordpress-themes-and-plugins/
 */	
function register_generic_bidx_ui_libs()
{
	//load script : name (unique name), location (relative to plugin url), deps (other libs), version (date), footer
	wp_register_script( 'jquery', plugins_url( 'static/vendor/jquery/jquery-1.9.1.js' ), array(), '20130501', TRUE );
	wp_enqueue_script( 'jquery' );
	
	wp_register_script( 'bootstrap', plugins_url( 'static/vendor/bootstrap/js/bootstrap.min.js' ), array('jquery'), '20130501', TRUE );
	wp_enqueue_script( 'bootstrap' );
	
	wp_register_script( 'country-autocomplete', plugins_url( 'static/js/country-autocomplete.js' ), array('jquery'), '20130501', TRUE );
	wp_enqueue_script( 'country-autocomplete' );
	
	wp_register_script( 'fileupload', plugins_url( 'static/js/fileUpload.js' ), array('jquery'), '20130501', TRUE );
	wp_enqueue_script( 'bootstrap' );
	
	wp_register_script( 'form-element', plugins_url( 'static/js/form-element.js' ), array('jquery'), '20130501', TRUE );
	wp_enqueue_script( 'form-element' );
	
	wp_register_script( 'form', plugins_url( 'static/js/form.js' ), array('jquery'), '20130501', TRUE );
	wp_enqueue_script( 'form' );
	
	wp_register_script( 'location', plugins_url( 'static/js/location.js' ), array('jquery'), '20130501', TRUE );
	wp_enqueue_script( 'location' );
	
	//load css : name (unique name), location (relative to plugin url), deps (other libs), version (date), media type (all, print, screen, handheld)
	wp_register_style( 'bootstrap', plugins_url( 'static/vendor/bootstrap/css/bootstrap.min.css' ), array(), '20130501', 'all' );
	wp_enqueue_style( 'bootstrap' );
	
	wp_register_style( 'bootstrap-responsive', plugins_url( 'static/vendor/bootstrap/css/bootstrap-responsive.min.css' ), array(), '20130501', 'all' );
	wp_enqueue_style( 'bootstrap-responsive' );
}
add_action('wp_enqueue_scripts', 'register_generic_bidx_ui_libs');

?>