<?php

/**
 * Loads default data needed for the plugin into Wordpress.
 * Uses a definition xml setup based on pages schema.
 * All definition files should be in one location.
 *
 * @author Jaap Gorjup
 * @version 1.0
 *
 * @todo determine overwrite state of data
 */
class ContentLoader
{

    // location of the definition files
    private $location;
    // logger instance
    private $logger;
    //Session Js Script Inject
    public $scriptInject;

    /**
     * Construct the loader for a directory location
     * @param unknown $location full path to a directory containing xml files
     */
    public function __construct ($location)
    {

        $this->location = $location;
        $this->logger = Logger::getLogger ("contentloader");
        add_action ('init', array ($this, 'codex_custom_init'));

        //Load Multilingual text domain for static data
        $this->localeTextdomainInit ();

        $bidCommonObj = new BidxCommon();
        $bidCommonObj->getBidxSessionAndScript ();
        $this->scriptInject = $bidCommonObj->getScriptJs ();



        add_action ('wp_head', array (&$this, 'addJsVariables'));
    }

    function addJsVariables ()
    {
        echo "<script>
	      window.bidx = window.bidx || {};
	      window.bidx.api = {
	        settings: {
	                  servicesPath:   '/wp-content/plugins/bidx-plugin/static/js/bidxAPI/services/'
	                }
	        };
	    </script>";

        echo $this->scriptInject;
    }

    /**
     * Load the data into Wordpress.
     * Ensure that defined custom post types are created
     * @param string $post_type optional loading for only one post_type
     *
     * @todo language selector based on the language preference (how multiple languages are supported)
     */
    public function load ($post_type = null)
    {

        add_rewrite_tag ('%bidx%', '([^&/]+)'); //main action per endpoint
        add_rewrite_tag ('%bidxparam1%', '([^&/]+)'); //control parameter if available
        add_rewrite_tag ('%bidxparam2%', '([^&/]+)'); //rest of url data if available


        $this->logger->trace ('Start loading default data from location : ' . $this->location);
        foreach (glob (BIDX_PLUGIN_DIR . '/../' . $this->location . '/*.xml') as $filename) {
            //try /catch / log ignore
            $document = simplexml_load_file ($filename);

            $this->logger->trace ('Start processing file : ' . $filename);

            $posts = $document->xpath ('//post');
            $this->logger->trace ('Found posts : ' . sizeof ($posts));

            foreach ($posts as $post) {

                $this->logger->trace ('Adding the post named : ' . $post->name);

                if ($post->update == 'false') {

                    $this->logger->trace ('May not update the post : ' . $post->name);

                    $posts_array = get_posts (array (
                      'post_name' => (string) $post->name
                      , 'post_status' => 'publish'
                      , 'post_type' => $document->posttype
                      , 'nopaging' => true,
                      'suppress_filters' => false)
                    );
                    if (sizeof ($posts_array) > 0) {
                        break;
                        $this->logger->trace ('Post exist, skipping : ' . $post->name);
                    }
                }
                $insertPostArr = array (
                  'post_content' => $post->content
                  , 'post_name' => $post->name
                  , 'post_status' => 'publish'
                  , 'post_title' => $post->title
                  , 'post_type' => $document->posttype
                  , 'post_author' => 1
                );
                //$enPostArr = $insertPostArr;
                //$enPostArr['post_name'] = $insertPostArr['post_name'].'_en';
                //$post_id = wp_insert_post($enPostArr);
                $post_id = wp_insert_post ($insertPostArr);
                if (!$post_id) {
                    wp_die ('Error creating page');
                } else {
                    if (isset ($post->template)) {
                        $this->logger->trace ('Adding template on post ' . $post_id . ' named : ' . $post->template);
                        update_post_meta ($post_id, '_wp_page_template', $post->template);
                    }

                    // $post_translated_id = $this->mwm_wpml_translate_post($post_id,$insertPostArr,'es' );
                }

                if (isset ($post->mapping) && $post->mapping != '') {
                    $target = 'index.php?' . $document->posttype . '=' . $post->name;
                    $mappingOrig = (string) $post->mapping;

                    $this->logger->trace ('Adding the rewrite rule : ' . $mappingOrig . ' to ' . $target);
                    //check here that all values from SimpleXML are explicitly casted to string
                    //$enMapping = str_replace('^','^/en/',$mappingOrig);
                    //$enTarget = $target.'_en';
                    add_rewrite_rule ($mappingOrig, $target, 'top');

                    //$enMapping = str_replace('^','^/en/',$mappingOrig);
                    //$enTarget = $target.'_en';
                    //add_rewrite_rule( $enMapping, $enTarget, 'top' );
                    //$esMapping = str_replace('^','^/es/',$mappingOrig);
                    //$esTarget = $target.'_es';
                    //add_rewrite_rule( $esMapping, $esTarget, 'top' );
                    //$this -> logger -> trace( 'Adding the rewrite rule ES: ' . $esMapping . ' to ' . $target );
                }
            }

            flush_rewrite_rules (false);
            //if manual writeout is needed
            //$this -> add_rewrite_rules();
            //Widgets to be added
            $widgets = $document->xpath ('//widget');
            $this->logger->trace ('Adding the widgets : ' . sizeof ($widgets) . ' found');
            foreach ($widgets as $widget) {

                $this->logger->trace ('Adding the widget named : ' . $widget->name);
            }

            //Navigation blocks to be added
            $navigations = $document->xpath ('//navigation');
            $this->logger->trace ('Adding the Navigation : ' . sizeof ($navigations) . ' found');
            foreach ($navigations as $navigation) {

                $this->logger->trace ('Adding the navigation named : ' . $navigation->name);
            }

            //Image resource blocks to be added
            //Navigation blocks to be added
            $images = $document->xpath ('//images');
            $this->logger->trace ('Adding the Image : ' . sizeof ($images) . ' found');
            foreach ($images as $image) {

                $this->logger->trace ('Adding the navigation named : ' . $image->name);
            }
        }
    }

    /**
     * Creates a translation of a post (to be used with WPML)
     *
     * @param int $post_id The ID of the post to be translated.
     * @param string $post_type The post type of the post to be transaled (ie. 'post', 'page', 'custom type', etc.).
     * @param string $lang The language of the translated post (ie 'fr', 'de', etc.).
     * @link http://wordpress.stackexchange.com/questions/20143/plugin-wpml-how-to-create-a-translation-of-a-post-using-the-wpml-api
     * @return the translated post ID
     *  */
    function mwm_wpml_translate_post ($post_id, $insertPostArr, $lang)
    {


        // Include WPML API
        include_once( WP_PLUGIN_DIR . '/sitepress-multilingual-cms/inc/wpml-api.php' );

        // Define title of translated post
        //$post_translated_title = get_post( $post_id )->post_title . ' (' . $lang . ')';
        $insertPostArr['post_title'] = $insertPostArr['post_title'] . ' (' . $lang . ')';
        $insertPostArr['post_name'] = $insertPostArr['post_name'] . '_' . $lang;
        $post_type = $insertPostArr['post_type'];
        // Insert translated post

        $post_translated_id = wp_insert_post ($insertPostArr);

        // Get trid of original post
        $trid = wpml_get_content_trid ('post_' . $post_type, $post_id);

        // Get default language
        $default_lang = wpml_get_default_language ();

        // Associate original post and translated post
        global $wpdb;
        $wpdb->update ($wpdb->prefix . 'icl_translations', array ('trid' => $trid, 'language_code' => $lang, 'source_language_code' => $default_lang), array ('element_id' => $post_translated_id));

        // Return translated post ID
        return $post_translated_id;
    }

    /**
     * Internal help function for faster debugging of rewrite rule errors.
     * Not for production usage
     * @param string $ep_mask use the default value
     */
    private function add_rewrite_rules ($ep_mask = EP_NONE)
    {
        global $wp_rewrite;
        $wp_rewrite->matches = 'matches'; // this is necessary to write the rules properly
        $new_rules = $wp_rewrite->generate_rewrite_rules (false, $ep_mask);
        $this->logger->trace ($new_rules);
        //$rules = get_option('rewrite_rules');
        //$rules = array_merge($new_rules, $rules);
        //update_option('rewrite_rules', $rules);
    }

    /**
     * Remove the data from Wordpress
     * @param string $post_type optional unloading for only one post_type
     * @todo check all the non default post types for deletion
     */
    public function unload ($post_type = null)
    {

        $this->logger->trace ("Unloading default data from location : " . $this->location);

        flush_rewrite_rules ();

        //remove posts : bidx for now
        $post_type = 'bidx';

        $posts_array = get_posts (array (
          'post_type' => $post_type,
          'post_status' => 'publish',
          'nopaging' => true,
          'suppress_filters' => true)
        );

        $this->logger->trace ('Removing ' . sizeof ($posts_array) . ' posts');
        foreach ($posts_array as $post) {

            $postid = $post->ID;
            wp_delete_post ($postid, true);
            $this->logger->trace ('Removed post id : ' . $postid);
        }

        $this->logger->trace ('bidX rules de-activation succeeded');
    }

    /**
     * Initialize post type
     * @param $post_type type that needs to created custom
     */
    public function codex_custom_init ()
    {

        //hardcoded for now
        $post_type = 'bidx';

        $this->logger->trace ('Initializing custom Post handler for contentloaderaltaf: ' . $post_type);
        if ($post_type != 'post' && $post_type != 'page') {
            $args = array (
              'public' => true,
              'exclude_from_search' => true,
              'show_ui' => true,
              'show_in_menu' => false,
              'query_var' => true,
              'rewrite' => false,
              'capability_type' => 'page',
              '_builtin' => false,
              'has_archive' => false,
              'hierarchical' => false,
              'menu_position' => null,
                //'supports' => array( 'title' )
            );
            $this->logger->trace ('Register action started for ' . $post_type);
            register_post_type ($post_type, $args);
        }

        $this->logger->trace ('Custom Post handler ready');
        $this->logger->trace (get_post_types ());
    }
    /**
     * Initialize Static Multilingual text domain data load
     * @param $post_type type that needs to created custom
     * @example http://geertdedeckere.be/article/loading-wordpress-language-files-the-right-way
     */
    function localeTextdomainInit ()
    {

        /* 1. Load Textdomain for Bidx Static APIs */
        $domain = 'static'; //we use _e('String','static') see staticdataservice.php
        $languagePath = WP_CONTENT_DIR . '/languages';
        $locale = apply_filters ('plugin_locale', get_locale (), $domain);
        $moStaticfile = $languagePath . '/static/' . $locale . '.mo';
        load_textdomain ($domain, $moStaticfile);

        /* 2. Load Textdomain for Bidx Wp I18n */
        $domain = 'i18n'; // we use _e('String','i18n')
        $locale = apply_filters ('plugin_locale', get_locale (), $domain);
        $moi18nfile = $languagePath . '/i18n/' . $locale . '.mo';
        load_textdomain ($domain, $moi18nfile);

        /* 2. Load Textdomain for Bidx Plugin */
        $domain = 'bidxplugin'; // we use _e('String','i18n')
        $locale = apply_filters ('plugin_locale', get_locale (), $domain);
        $moPluginfile = $languagePath . '/plugins/' . $locale . '.mo';
        load_textdomain ($domain, $moPluginfile);

    }

}

?>
