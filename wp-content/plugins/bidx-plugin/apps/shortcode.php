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
class BidxShortcode
{

    // determine if the scripts should be loaded
    static $add_script;
    // array of mappings for preloading
    static $mapping = array ();
    // name of the script id
    static $scriptIdArr = array ();
    // store translation vars
    static $transalationVars = array ();
    // hash value of app
    static $hash = null;

    /**
     * Constructor.
     * Registers the shortcode and initializes script dependencies
     */
    function __construct ()
    {
        $currentUser = wp_get_current_user ();


        Logger :: getLogger ('shortcode')->trace ('Constructing bidx shortcode instance for ' . get_bloginfo ());
        add_shortcode ('bidx', array (&$this, 'handle_bidx_shortcode'));
        add_action ('init', array (&$this, 'register_script'));
        add_action ('wp_footer', array (&$this, 'print_script'));


        // Style
        add_action ('init', array (&$this, 'load_style'));

        Logger :: getLogger ('shortcode')->trace ('Ready constructing bidx shortcode instance');
    }

    /**
     * Create a mapping for loading the needed content references
     * @param string $bidxaction name of the action
     * @param string $bidxclass optional another class file to be called else same as bidxaction
     */
    function addMapping ($bidxaction, $bidxclass = null)
    {

        if ($bidxclass === null) {
            $bidxclass = $bidxaction;
        }
        Logger :: getLogger ('shortcode')->trace ('Adding mapping ' . $bidxaction . ' for ' . $bidxclass);
        include $bidxaction . '/' . $bidxclass . '.php';
        $action = new $bidxclass();
        self :: $mapping[$bidxaction] = $action;
        Logger :: getLogger ('shortcode')->trace ('Instantiated ' . $bidxclass);
    }

    /**
     * Reads all the mappings at once
     * @param array $mappingArray array of mapping fields where per item the $value can be empty.
     */
    function addMappingArray ($mapping_array)
    {

        foreach ($mapping_array as $key => $value) {
            if ($value === null) {
                $value = $key;
            }
            self :: addMapping ($value);
        }
    }

    /**
     * Shortcode is called for a page.
     * If appname is not available a not found message is shown.
     * @param array $atts attributes as part og the shortcode mapping
     */
    function handle_bidx_shortcode ($atts)
    {

        //allow for printing the scripts at the footer
        self :: $add_script = true;

        Logger :: getLogger ('shortcode')->trace ('Shortcode called with ' . serialize ($atts));
        $appname = $atts['app'];

        self::$scriptIdArr
            [$appname] = $appname;

        if (array_key_exists ($appname, self::$mapping))
        {
            //Handle the i18n Data
            $bidxCommonObj = new BidxCommon();
            if (empty (self::$transalationVars))
            { // First Shortcode
                self::$transalationVars = $bidxCommonObj->getLocaleTransient (array ($appname), $static = true, $i18nGlobal = true);
            }
            else
            {   // More than 1 shortcode
                $appTranslationsArr = $bidxCommonObj->getLocaleTransient (array ($appname), $static = false, $i18nGlobal = false);
                if (isset ($appTranslationsArr['i18n'][$appname]))
                {
                    self::$transalationVars['i18n'][$appname] = $appTranslationsArr['i18n'][$appname];
                }
            }

            if ( isset ($atts["hash"] ) )
            {
                self::$hash = $atts["hash"];
            }

            $bidxCommonObj->setI18nData (self::$transalationVars);

            Logger :: getLogger ('shortcode')->trace ('Final scripts : ' . serialize (self::$scriptIdArr));

            $exec = self::$mapping[$appname];
            Logger :: getLogger ('shortcode')->trace ("Invoking bidX app '" . $appname . "'.");

            return $exec -> load ($atts);
        } else {
            Logger :: getLogger ('shortcode')->trace ("bidX app '" . $appname . "' does not exist.");
            return "Bidx app '" . $appname . "' does not exist.";
        }
    }

    /**
     * Load a css
     */
    function load_style()
    {
        $bidxStaticDir  = sprintf( '%s/../static',  BIDX_PLUGIN_URI );
        $bidxCssDir     = sprintf( '%s/../static/css', BIDX_PLUGIN_URI );

        if (BidxCommon :: isWPInternalFunction ()) {
            Logger :: getLogger ('shortcode')->trace ('Skipping enqueueing because of admin.');
        } else {

            // wp_register_style( 'bidx-plugin', $bidxCssDir . '/bidx-plugin.css', array(), '20131125', 'all' );
            // wp_enqueue_style( 'bidx-plugin' );

            // Temporary, probably needs to be moved into a bidx less file
            //
            // wp_register_style( 'bootstrap-datepicker', $bidxStaticDir . '/vendor/bootstrap-datepicker-1.3.0-rc.2/css/datepicker3.css', array(), '1.3.0-rc.2', 'all' );
            // wp_enqueue_style( 'bootstrap-datepicker' );
        }
    }

    /**
     *Get Current site language
     *
     * @return string $currentLanguage returns the current language
     */

    function getSiteLanguageOptions(  )
    {
        global $sitepress;
        $currentLanguage = '';

        if( $sitepress )
        {
            $currentLanguage = $sitepress->get_current_language();

            if( $currentLanguage && $currentLanguage === 'en')
            {
                $currentLanguage = '';
            }
        }
        $currentLanguage = ($currentLanguage)? $currentLanguage    :   NULL;
        return $currentLanguage;
    }



    /**
     * Register the scripts to be used.
     * We will load jquery and bootstrap as default :
     * 'jquery', 'jqueryui', 'bootstrap', 'underscore', 'backbone',
     * 'json2', 'bidx-fileupload', 'bidx-form', 'bidx-form-element',
     * 'bidx-location', 'bidx-utils', 'bidx-country-autocomplete'
     */
    function register_script ()
    {
        $bidxJsDir          =   sprintf ('%s/../static/js',     BIDX_PLUGIN_URI);
        $vendorDir          =   sprintf ('%s/../static/vendor', BIDX_PLUGIN_URI);
        $plugins_url        =   sprintf ('%s/',                 BIDX_PLUGIN_URI);
        $serverReferer      =   ( isset ( $_SERVER[ "HTTP_REFERER" ] )) ? $_SERVER[ "HTTP_REFERER" ] : NULL ; // To avoid in theme customization (iframe is detect here), dont load scripts and everything.

        if (BidxCommon :: isWPInternalFunction () || is_super_admin() || preg_match ( '/customize.php/i', $serverReferer ) ) {
            Logger :: getLogger ('shortcode')->trace ('Skipping enqueueing because of admin.');
        } else {
            $langLocale         = $this->getSiteLanguageOptions( );
            $sitepressDepArr    = ( $langLocale ) ? array('sitepress') : array( );

            //vendor scripts
           //s wp_register_script ('gmaps-places', '//maps.googleapis.com/maps/api/js?v=3&sensor=false&libraries=places', array (), '20130501', TRUE);
            wp_register_script ('google-jsapi', '//www.google.com/jsapi', array (), '20130501', TRUE);
            wp_register_script ('jquery-validation', $bidxJsDir . '/vendor/jquery.validate.js', array ('jquery'), '1.1.11', true);
            wp_register_script ('jquery-validation-additional-methods', $bidxJsDir . '/vendor/additional-methods.js', array ('jquery-validation'), '1.1.11', true);
            wp_register_script ('jquery-validation-bidx-additional-methods', $bidxJsDir . '/additional-methods.js', array ('jquery-validation'), '20130812', true);
            wp_register_script ('bootstrap-paginator', $bidxJsDir . '/vendor/bootstrap-paginator.js', array ('bootstrap', 'jquery'), '20131103', TRUE);
            wp_register_script ('jquery-raty', $vendorDir . '/raty-master/lib/jquery.raty.js', array ('jquery'), '2.7.0', TRUE);
            wp_register_script ('chosen', $vendorDir . '/chosen_v1.0.0/chosen.jquery.js', array ('jquery'), '20131111', TRUE);

            wp_register_script ('bidx-countto', $bidxJsDir . '/vendor/countTo.js', array('jquery') , '20131103', false );

            wp_register_script ('numeral', $vendorDir . '/numeral/min/numeral.min.js', array ('jquery'), '20151201', TRUE);

            wp_register_script ('responsive-pagination', $vendorDir . '/responsive-pagination/responsive-paginate.js', array ('jquery'), '20151215', TRUE);


            if( $langLocale )
            {
                wp_register_script ('bootstrap-datepicker-main', $vendorDir . "/bootstrap-datepicker-1.5.0-dist/js/bootstrap-datepicker.min.js", array ('bootstrap', 'jquery'), '1.5', TRUE);
                wp_register_script ('bootstrap-datepicker', $vendorDir . "/bootstrap-datepicker-1.5.0-dist/locales/bootstrap-datepicker.{$langLocale}.min.js", array ('bootstrap-datepicker-main'), '1.5', TRUE);

                wp_register_script ('bootstrap-datetimepicker-main', $vendorDir . "/bootstrap-datetimepicker-master/js/bootstrap-datetimepicker.js", array ('bootstrap', 'jquery'), '1', TRUE);
                wp_register_script ('bootstrap-datetimepicker', $vendorDir . "/bootstrap-datetimepicker-master/js/locales/bootstrap-datetimepicker.{$langLocale}.js", array ('bootstrap-datetimepicker-main'), '1.3.0-rc.2', TRUE);
            } else
            {
                wp_register_script ('bootstrap-datepicker', $vendorDir . "/bootstrap-datepicker-1.5.0-dist/js/bootstrap-datepicker.min.js", array ('bootstrap', 'jquery'), '1.5', TRUE);

                wp_register_script ('bootstrap-datetimepicker', $vendorDir . "/bootstrap-datetimepicker-master/js/bootstrap-datetimepicker.js", array ('bootstrap', 'jquery'), '1', TRUE);

            }

            wp_register_script ('bootstrap-switch', $vendorDir . "/bootstrap-switch-master/dist/js/bootstrap-switch.min.js", array ('bootstrap', 'jquery'), '3.3.2', TRUE);
            wp_register_script ('bootstrap-slider', $vendorDir . "/bootstrap-slider-master/dist/bootstrap-slider.min.js", array ('bootstrap', 'jquery'), '3.3.2', TRUE);

            wp_register_script ('jquery-fitvids', $bidxJsDir . '/vendor/jquery.fitvids.js', array ('jquery'), '20140321', TRUE);
            wp_register_script ('jquery-event-ue', $bidxJsDir . '/vendor/jquery.event.ue.js', array ('jquery'), '20140325', TRUE);
            wp_register_script ('jquery-udraggable', $bidxJsDir . '/vendor/jquery.udraggable.js', array ('jquery'), '20140325', TRUE);
            wp_register_script ('jquery-fakecrop', $bidxJsDir . '/vendor/jquery.fakecrop.js', array ('jquery'), '20140327', TRUE);

            // fileupload
            wp_register_script ('jquery-iframe-transport', $bidxJsDir . '/vendor/jquery.iframe-transport.js', array ('jquery'), '1.7', true);
            wp_register_script ('jquery-fileupload', $bidxJsDir . '/vendor/jquery.fileupload.js', array ('jquery', 'jquery-iframe-transport'), '5.32.2', true);

            //bidX scripts
            wp_register_script ('bidx-api-core', $bidxJsDir . '/bidxAPI/api-core.js', array ('jquery'), '20130501', TRUE);

            $sitepressArr = array_merge( array ('jquery', 'bootstrap-datepicker', 'bootstrap-datetimepicker','bootstrap-switch'), $sitepressDepArr  );
            wp_register_script ('bidx-utils', $bidxJsDir . '/utils.js', $sitepressArr, '20130501', TRUE);

            wp_register_script ('bidx-tagsinput', $bidxJsDir . '/bidx-tagsinput.js', array ('bidx-bootstrap-tagmanager', 'bidx-utils', 'bidx-data'), '20130703', TRUE);

            wp_register_script ('bidx-bootstrap-tagmanager', $bidxJsDir . '/bidx-bootstrap-tagmanager.js', array ('bootstrap', 'jquery-ui-widget'), '20130703', TRUE);

            wp_register_script ('bidx-common', $bidxJsDir . '/common.js', array ('bidx-utils', 'bidx-api-core', 'bidx-data', 'bidx-tagsinput', 'jquery-validation', 'bidx-i18n', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods', 'bootstrap-paginator'), '20130501', TRUE);
            wp_register_script ('bidx-globalchecks', $bidxJsDir . '/globalchecks.js', array ('bidx-utils', 'bidx-api-core', 'bidx-data', 'bidx-i18n'), '20150806', TRUE);
            wp_register_script ('bidx-elements', $bidxJsDir . '/bidx-elements.js', array ('bidx-utils', 'bidx-api-core', 'bidx-data', 'bidx-i18n'), '20150807', TRUE);
            wp_register_script ('bidx-interactions', $bidxJsDir . '/bidx-interactions.js', array ('bidx-utils', 'bidx-api-core', 'bidx-data', 'bidx-i18n'), '20150915', TRUE);
            wp_register_script ('bidx-controller', $bidxJsDir . '/controller.js', array ('bidx-utils', 'bidx-api-core', 'bidx-data', 'backbone'), '20130501', TRUE);

            wp_register_script ('bidx-reflowrower', $bidxJsDir . '/bidx-reflowrower.js', array ('jquery', 'jquery-ui-widget'), '20130501', TRUE);
            wp_register_script ('bidx-industries', $bidxJsDir . '/bidx-industries.js', array ('jquery', 'jquery-ui-widget'), '20141010', TRUE);
            wp_register_script ('bidx-tagging',  $bidxJsDir . '/bidx-tagging.js', array ('jquery','jquery-ui-widget'),  '20150501', TRUE);
            wp_register_script ('bidx-connect',  $bidxJsDir . '/bidx-connect.js', array ('jquery','jquery-ui-widget'),  '20150801', TRUE);
            wp_register_script ('bidx-cover', $bidxJsDir . '/bidx-cover.js', array ('jquery', 'jquery-ui-widget', 'jquery-ui-draggable'), '20141119', TRUE);
            wp_register_script ('bidx-data', $bidxJsDir . '/data.js', array ('jquery'), '20130626', TRUE);
            wp_register_script ('bidx-i18n', $bidxJsDir . '/i18n.js', array ('jquery'), '20130626', TRUE);
            wp_register_script ('bidx-delaykeyup', $bidxJsDir . '/bidx-delaykeyup.js', array ('jquery'), '20131103', TRUE);
            wp_register_script ('bidx-location', $bidxJsDir . '/bidx-location.js', array ('jquery', 'bidx-utils', 'jquery-ui-widget','google-jsapi'), '20130904', true);
            wp_register_script ('bidx-chosen',  $bidxJsDir . '/bidx-chosen.js', array ('jquery', 'chosen'),  '20131118', TRUE);
            wp_register_script ('bidx-mentor',  $plugins_url . '/mentor/static/js/common-mentordashboard.js', array ('jquery'), '20150713', TRUE);
            //wp_register_script ('bidx-swype',  'http://code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2.min.js', array ('jquery'), '20150713', TRUE);

            wp_enqueue_script ('bidx-common');
            wp_enqueue_script ('bidx-controller');

            ob_start ();
        }
    }

    /**
     * Conditionally print the script, only if added.
     */
    function print_script ()
    {
        $scriptArr = self::$scriptIdArr;

        /*         * ** Adding Translations to Js Variables before data.js */
        // 1. I18n  & Global Data

        wp_localize_script ('bidx-data', '__bidxI18nPreload', self::$transalationVars['i18n']); //http://www.ronakg.com/2011/05/passing-php-array-to-javascript-using-wp_localize_script/
        // 2. Static Data
        wp_localize_script ('bidx-data', '__bidxDataPreload', self::$transalationVars['static']); //http://www.ronakg.com/2011/05/passing-php-array-to-javascript-using-wp_localize_script/

        if (self::$hash) {
            //
            wp_localize_script ('bidx-data', '__bidxHash', self::$hash);
        }

        Logger::getLogger ('shortcode')->trace ('Footer print_script called');

        if ($scriptArr) {
            foreach ($scriptArr as $scriptVal) {
                if (!$scriptVal) {
                    Logger::getLogger ('shortcode')->trace ('DO NOT print_script : ' . $scriptVal);
                    return;
                }
                Logger :: getLogger ('shortcode')->trace ('Add script ok, printing scripts : ' . $scriptVal);
                wp_print_scripts ($scriptVal);
            }
        }
    }

}

?>
