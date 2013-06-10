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

		Logger :: getLogger( 'shortcode' ) -> trace( 'Constructing bidx shortcode instance for ' . get_bloginfo() );
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
	 * Shortcode is called for a page.
	 * If appname is not available a not found message is shown.
	 * @param array $atts attributes as part og the shortcode mapping
	 */
	 function handle_bidx_shortcode($atts) {

		//allow for printing the scripts at the footer
		self :: $add_script = true;

		Logger :: getLogger( 'shortcode' ) -> trace( 'Shortcode called with ' . serialize( $atts ) );
		$appname = $atts['app'];
		self :: $script_id = $appname;

		if ( array_key_exists( $appname, self::$mapping ) ) {
			$exec = self::$mapping[$appname];
			Logger :: getLogger( 'shortcode' ) -> trace( "Invoking bidX app '" . $appname . "'." );
			return $exec :: load( $atts );
		}
		else {
			Logger :: getLogger( 'shortcode' ) -> trace( "bidX app '" . $appname . "' does not exist." );
			return "Bidx app '" . $appname . "' does not exist.";
		}

	}

	/**
	 * Register the scripts to be used.
	 * We will load jquery and bootstrap as default :
	 * 'jquery', 'jqueryui', 'bootstrap', 'underscore', 'backbone',
	 * 'json2', 'bidx-fileupload', 'bidx-form', 'bidx-form-element',
	 * 'bidx-location', 'bidx-utils', 'bidx-country-autocomplete'
	 */
	 function register_script() {

	 	if ( BidxCommon :: isWPInternalFunction() ) {
	 		Logger :: getLogger( 'shortcode' ) -> trace('Skipping enqueueing because of admin.');
	 	} else {

		 	//vendor scripts
		 	wp_deregister_script( 'jquery' );
			wp_register_script( 'jquery', BIDX_PLUGIN_URI . '/../static/vendor/jquery/jquery-1.9.1.js', array(), '20130501', TRUE );
			wp_register_script( 'jqueryui', BIDX_PLUGIN_URI . '/../static/vendor/jqueryUI/jqueryUI-1.10.2.js', array(), '20130501', TRUE );
			wp_register_script( 'bootstrap', BIDX_PLUGIN_URI . '/../static/vendor/bootstrap/js/bootstrap.min.js', array('jquery'), '20130501', TRUE );
			wp_deregister_script( 'underscore' );
			wp_register_script( 'underscore', BIDX_PLUGIN_URI . '/../static/vendor/underscore/underscore-1.4.4.js', array('jquery'), '20130501', TRUE );
			wp_deregister_script( 'backbone' );
			wp_register_script( 'backbone', BIDX_PLUGIN_URI . '/../static/vendor/backbone/backbone-1.0.0.js', array('underscore'), '20130501', TRUE );
			wp_register_script( 'json2', BIDX_PLUGIN_URI . '/../static/vendor/json2/json2.js', array('jquery'), '20130501', TRUE );
			wp_register_script( 'gmaps-places', '//maps.googleapis.com/maps/api/js?v=3&sensor=false&libraries=places', array(), '20130501', TRUE);
			wp_deregister_script( 'holder' );
			wp_register_script( 'holder', BIDX_PLUGIN_URI . '/../static/vendor/holder/holder-1.9.js', array(), '20130501', TRUE );

			//bidX scripts
			wp_register_script( 'bidx-api-core', BIDX_PLUGIN_URI . '/../static/js/bidxAPI/api-core.js', array('jquery'), '20130501', TRUE );
			wp_register_script( 'bidx-fileupload', BIDX_PLUGIN_URI . '/../static/js/fileUpload.js', array('jquery'), '20130501', TRUE );
			wp_register_script( 'bidx-form', BIDX_PLUGIN_URI . '/../static/js/form.js', array('jquery'), '20130501', TRUE );
			wp_register_script( 'bidx-form-element', BIDX_PLUGIN_URI . '/../static/js/form-element.js', array('jquery'), '20130501', TRUE );
			wp_register_script( 'bidx-location', BIDX_PLUGIN_URI . '/../static/js/location.js', array('jquery'), '20130501', TRUE );
			wp_register_script( 'bidx-utils', BIDX_PLUGIN_URI . '/../static/js/utils.js', array('jquery'), '20130501', TRUE );
	 		wp_register_script( 'bidx-country-autocomplete', BIDX_PLUGIN_URI . '/../static/js/country-autocomplete.js', array('jquery'), '20130501', TRUE );
	 		wp_register_script( 'bidx-common', BIDX_PLUGIN_URI . '/../static/js/common.js', array( 'bidx-utils', 'bidx-api-core' ), '20130501', TRUE );
	 		wp_register_script( 'bidx-controller', BIDX_PLUGIN_URI . '/../static/js/controller.js', array( 'bidx-utils', 'bidx-api-core' ), '20130501', TRUE );

	 		//enable backbone for now
	 		//@todo: remove this as soon as all functions are moved to shortcodes
	 		wp_enqueue_script('backbone');
	 		wp_enqueue_script('bidx-common');
	 		wp_enqueue_script('bidx-controller');
	 	}
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
