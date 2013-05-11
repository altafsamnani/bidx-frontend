<?php 
/**
 * Shortcode for loading bidX content in a page.
 * It ensures that frontend Javascript dependencies are only loaded when shortcode is used.
 * 
 * TODO css enable disablement
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
		
		Logger :: getLogger( 'shortcode' ) -> trace( 'Constructing bidx shortcode instance' );
		add_shortcode( 'bidx', array( &$this, 'handle_bidx_shortcode' ) );
 		add_action( 'init', array( &$this, 'register_script' ) );
		add_action( 'wp_footer', array( &$this, 'print_script' ) );
		Logger :: getLogger( 'shortcode' ) -> trace( 'Ready constructing bidx shortcode instance' );

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
		self :: $add_script = true;
		
		Logger :: getLogger( 'shortcode' ) -> trace( 'Shortcode called with ' . serialize( $atts ) );
		$appname = $atts['app'];
		self :: $script_id = $appname;
		
		//TODO: handle condition if appname is not available
		
		$exec = self :: $mapping[$appname];
		return $exec :: load( $atts );
	}
	
	/**
	 * Register the scripts to be used.
	 * We will load jquery and bootstrap as default
	 */
	 function register_script() {
		
	 	//'jquery', 'jqueryui', 'bootstrap', 'underscore', 'backbone', 'json2', 'bidx-fileupload', 'bidx-form', 'bidx-form-element', 'bidx-location', 'bidx-utils', 'bidx-country-autocomplete'
	 	
	 	//vendor scripts
		wp_register_script( 'jquery', plugins_url( '../static/vendor/jquery/jquery-1.9.1.js', __FILE__ ), array(), '20130501', TRUE );
		wp_register_script( 'jqueryui', plugins_url( '../static/vendor/jqueryUI/jqueryUI-1.10.2.js', __FILE__ ), array(), '20130501', TRUE );
		wp_register_script( 'bootstrap', plugins_url( '../static/vendor/bootstrap/js/bootstrap.min.js', __FILE__ ), array('jquery'), '20130501', TRUE );
		wp_register_script( 'underscore', plugins_url( '../static/vendor/underscore/underscore-1.4.4.js', __FILE__ ), array('jquery'), '20130501', TRUE );
		wp_register_script( 'backbone', plugins_url( '../static/vendor/backbone/backbone-1.0.0.js', __FILE__ ), array('jquery'), '20130501', TRUE );
		wp_register_script( 'json2', plugins_url( '../static/vendor/json2/json2.js', __FILE__ ), array('jquery'), '20130501', TRUE );

		//Bidx scripts
		wp_register_script( 'bidx-api-core', plugins_url( '../static/js/bidxAPI/api-core.js', __FILE__ ), array('jquery'), '20130501', TRUE );
		wp_register_script( 'bidx-fileupload', plugins_url( '../static/js/fileUpload.js', __FILE__ ), array('jquery'), '20130501', TRUE );
		wp_register_script( 'bidx-form', plugins_url( '../static/js/form.js', __FILE__ ), array('jquery'), '20130501', TRUE );
		wp_register_script( 'bidx-form-element', plugins_url( '../static/js/form-element.js', __FILE__ ), array('jquery'), '20130501', TRUE );
		wp_register_script( 'bidx-location', plugins_url( '../static/js/location.js', __FILE__ ), array('jquery'), '20130501', TRUE );
		wp_register_script( 'bidx-utils', plugins_url( '../static/js/utils.js', __FILE__ ), array('jquery'), '20130501', TRUE );
 		wp_register_script( 'bidx-country-autocomplete', plugins_url( '../static/js/country-autocomplete.js', __FILE__ ), array('jquery'), '20130501', TRUE );
	 }
	
	/**
	 * Conditionally print the script, only if added.
	 */
	 function print_script() {
	 	
	 	Logger::getLogger('shortcode') -> trace( 'Footer print_script called' );	 	
		if ( ! self::$add_script ) {
			Logger::getLogger('shortcode') -> trace( 'DO NOT print_script : ' . self::$script_id );
			return;
		}
		Logger :: getLogger('shortcode') -> trace( 'Add script ok, printing scripts : ' . self::$script_id );
		wp_print_scripts( self::$script_id );
	}
}
?>