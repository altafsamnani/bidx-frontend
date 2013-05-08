<?php 
/**
 * Shortcode for loading bidX content in a page.
 * It ensures that frontend Javascript dependencies are only loaded when shortcode is used.
 * 
 * TODO css enable disablement
 * TODO identify shortcode appname (get the terms sorted)
 * 
 * @author Jaap Gorjup
 * @version 1.0
 */

class BidxShortcode {

	// determine if the scripts should be loaded
	static $add_script;
	// name of the script id
	static $script_id;	
	// array of mappings for preloading
	static $mapping = array();
	
	/**
	 * Constructor.
	 * Registers the shortcode and initializes script dependencies
	 */
	function __construct() {
		Logger :: getLogger('shortcode') -> trace( 'Constructing bidx shortcode instance' );
		add_shortcode('bidx', array(__CLASS__, 'handle_bidx_shortcode'));
		add_action('init', array(__CLASS__, 'register_script'));
		add_action('wp_footer', array(__CLASS__, 'print_script'));
		Logger :: getLogger('shortcode') -> trace( 'Ready constructing bidx shortcode instance' );
	}
	
	/**
	 * Create a mapping for loading the needed content references
	 * @param string $bidxaction name of the action
	 * @param string $bidxclass optional another class file to be called else same as bidxaction
	 */
	function addMapping($bidxaction, $bidxclass = null) {
		
		if ($bidxclass === null) {
			$bidxclass = $bidxaction;
		}
		Logger :: getLogger('shortcode') -> trace( 'Adding mapping ' . $bidxaction . ' for '. $bidxclass );
		include $bidxaction . '/' . $bidxclass . '.php';
		$action = new $bidxclass();
		self :: $mapping[$bidxaction] = $action;
		Logger :: getLogger('shortcode') -> trace( 'Instantiated ' . $bidxclass );
	}
	
	/**
	 * Reads all the mappings at once
	 * @param array $mappingArray array of mapping fields where per item the $value can be empty.
	 */
	function addMappingArray($mapping_array) {
		foreach ($mapping_array as $key => $value) {
			if ($value === null) {
				$value = $key;
			}
			self :: addMapping($value);
		}
	}
	
	/**
	 * Shortcode is called for a page
	 * @param array $atts
	 */
	 function handle_bidx_shortcode($atts) {
		//allow for printing the scripts at the footer
		self::$add_script = true;
		Logger :: getLogger( 'shortcode' ) -> trace( 'Shortcode called with ' . serialize( $atts ) );
		$appname = $atts['app'];
		self::$script_id = $appname;
		$exec = self :: $mapping[$appname];
		return $exec :: load( $atts );
	}
	
	/**
	 * Register the scripts to be used.
	 * We will load jquery and bootstrap as default
	 */
	 function register_script() {
		
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
	
	/**
	 * Conditionally print the script, only if added.
	 */
	 function print_script() {
	 	Logger :: getLogger('shortcode') -> trace( 'Footer print_script called' );	 	
		if ( ! self::$add_script ) {
			return;
		}
		Logger :: getLogger('shortcode') -> trace( 'Add script ok, printing scripts' );
		wp_print_scripts(self :: $script_id);
	}
}
?>