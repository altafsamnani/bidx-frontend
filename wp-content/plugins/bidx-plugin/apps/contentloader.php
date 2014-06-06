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


        $bidCommonObj = new BidxCommon();
        $bidCommonObj->getBidxSessionAndScript ();
        $this->scriptInject = $bidCommonObj->getScriptJs ();

        add_action ('wp_head', array (&$this, 'addJsVariables'));

        $currentUser = wp_get_current_user ();

        if (in_array (WP_OWNER_ROLE, $currentUser->roles) || in_array (WP_ADMIN_ROLE, $currentUser->roles)) {

            add_action ('admin_head', array (&$this, 'addJsVariables'));
        }
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
    public function load( $post_type = null )
    {
        add_rewrite_tag( '%bidx%', '([^&/]+)' ); //main action per endpoint
        add_rewrite_tag( '%bidxparam1%', '([^&/]+)' ); //control parameter if available
        add_rewrite_tag( '%bidxparam2%', '([^&/]+)' ); //rest of url data if available

        $userID = $this->create_custom_role_capabilities( );

        $this->logger->trace( '$user : ' . $userID  );

        $rewrite_rules = array();

        $this->logger->trace( 'Start loading default data from location : ' . $this->location );
        foreach ( glob( BIDX_PLUGIN_DIR . '/../' . $this->location . '/*.xml' ) as $filename ) {
            //try /catch / log ignore
            $document = simplexml_load_file( $filename );

            $this->logger->trace( 'Start processing file : ' . $filename );

            $posts = $document->xpath ( '//post' );
            $this->logger->trace( 'Found posts : ' . sizeof( $posts ) );

            foreach ( $posts as $post )
            {

                $this->logger->trace( 'Handling the post named : ' . $post->name );

                $page = get_page_by_title( (string) $post->title, 'OBJECT', $document->posttype );

                $this->logger->trace( 'Checking for post : ' . $page -> ID );
                //$this->logger->trace( 'Checking for post : ' . $page );
                if ( $post->update == 'false' ) {

                    $this->logger->trace( 'Update is FALSE for post : ' . $post->name );

                    if ( $page -> ID ) {
                        wp_update_post( array(
                			'ID'           => $page -> ID,
                            'post_author'   => ($userID) ? $userID : 1
                		) );

                        $this->logger->trace( 'Post exist, skipping : ' . $post->name );
                        continue;
                    } else {
                    	$post_id = false;
                    }

                } else {

                	if ( $page ) {
                        $this->logger->trace( 'Post exist, for update : ' . $page->post_title . ' : '. $page->ID );
                        $post_id = $page -> ID;
                    }
                    else {
                    	$this->logger->trace( 'Post not found : ' . (string) $post->name );
                    	$post_id = false;
                    }
                }

                // default get $post content
                //
                $content = $post->content;

                // $msp: if htmpTemplate is available, replace the content with the source from the template file
                //
                if ( isset( $post->htmlTemplate ) && $post->htmlTemplate != '' ) {
                    $this->logger->trace( 'Getting content from htmlTemplate ' . $post->htmlTemplate . '.phtml' );
                    // open template file and get content
                    //
                    try {
                    	$stream = fopen( BIDX_PLUGIN_DIR . '/../'. $this->location . '/templates/'  . $post->htmlTemplate . '.phtml' , "r" );
                    	$fileContent = stream_get_contents( $stream );
                        $content = $this->replacePlaceHolders($fileContent);
                    	fclose( $stream );
                    } catch (Exception $e) {
                    	$this->logger->trace( 'Getting content from htmlTemplate ' . $post->htmlTemplate . ' FAILED' );
                    }
                    // ob_start();
                    // include BIDX_PLUGIN_DIR . '/../'. $this->location . '/templates/'  . $post->htmlTemplate . '.phtml';
                    // $content = ob_get_clean();
                }

                if ( $post_id ) {
                	$this->logger->trace( 'Post updating : ' . $post->name . ' : ' . $post_id);
                	wp_update_post( array(
                			'ID'           => $post_id,
                			'post_content' => $content,
                            'post_author'  => ($userID) ? $userID : 1
                		) );
                } else {
                	$this->logger->trace( 'Inserting new post : ' . $post->name );
                	$insertPostArr = array (
                				'post_content'  => $content
                			,   'post_name'     => $post->name
                			,   'post_status'   => 'publish'
                			,   'post_title'    => $post->title
                			,   'post_type'     => $document->posttype
                			,   'post_author'   => ($userID) ? $userID : 1
                	);

                	//$enPostArr = $insertPostArr;
                	//$enPostArr['post_name'] = $insertPostArr['post_name'].'_en';
                	//$post_id = wp_insert_post($enPostArr);

	                $post_id = wp_insert_post( $insertPostArr );
	                if (!$post_id) {
	                    wp_die ('Error creating page');
	                }
                }

                // set page as Home page
                //
                if ( isset ( $post->setHomePage ) && $post->setHomePage == 'true' ) {
	                update_option( 'show_on_front', 'page' );
	                update_option( 'page_on_front', $post_id );
                }

                if ( isset( $post->template ) ) {
                	$this->logger->trace ('Adding template on post ' . $post_id . ' named : ' . $post->template);
                	update_post_meta ($post_id, '_wp_page_template', (string) $post->template);
                }
                // $post_translated_id = $this->mwm_wpml_translate_post($post_id,$insertPostArr,'es' );

                if (isset ($post->mapping) && $post->mapping != '') {
                    $target = 'index.php?' . $document->posttype . '=' . $post->name;
                    $mappingOrig = (string) $post->mapping;

                    $this->logger->trace ('Adding the rewrite rule : ' . $mappingOrig . ' to ' . $target);
                    //check here that all values from SimpleXML are explicitly casted to string
                    //$enMapping = str_replace('^','^/en/',$mappingOrig);
                    //$enTarget = $target.'_en';

                    // $msp: do not add rewrites for pages because they will use wordpress default
                    //
                    if ( $document->posttype != 'page' ) {
                        $this->logger->trace ("Adding rewrite for " . $document->posttype );
                        add_rewrite_rule ($mappingOrig, $target, 'top');
                        $rewrite_rules[$mappingOrig] = $target;
                    } else {
                    	$this->logger->trace ("Skipping rewrite");
                    }

                    //$enMapping = str_replace('^','^/en/',$mappingOrig);
                    //$enTarget = $target.'_en';
                    //add_rewrite_rule( $enMapping, $enTarget, 'top' );
                    //$esMapping = str_replace('^','^/es/',$mappingOrig);
                    //$esTarget = $target.'_es';
                    //add_rewrite_rule( $esMapping, $esTarget, 'top' );
                    //$this -> logger -> trace( 'Adding the rewrite rule ES: ' . $esMapping . ' to ' . $target );
                }
            }
            // end for each post

            flush_rewrite_rules( false );

            add_option( 'BIDX_REWRITE_RULES', $rewrite_rules );
        }

        flush_rewrite_rules (false);

            //if manual writeout is needed
            //$this -> add_rewrite_rules();
// No Widgets to be added (have to find out if this is useful dynamically)
//             $widgets = $document->xpath ('//widget');
//             $this->logger->trace ('Adding the widgets : ' . sizeof ($widgets) . ' found');
//             foreach ($widgets as $widget) {
//                 $this->logger->trace ('Adding the widget named : ' . $widget->name);
//             }

// Manual actions for now : Navigation blocks to be added
//             $navigations = $document->xpath ('//navigation');
//             $this->logger->trace ('Adding the Navigation : ' . sizeof ($navigations) . ' found');
//             foreach ($navigations as $navigation) {
//                 $this->logger->trace ('Adding the navigation named : ' . $navigation->name);
//             }

            //Image resource blocks to be added
            //Navigation blocks to be added
//             $images = $document->xpath ('//images');
//             $this->logger->trace ('Adding the Image : ' . sizeof ($images) . ' found');
//             foreach ($images as $image) {

//                 $this->logger->trace ('Adding the navigation named : ' . $image->name);
//             }
     }
        // end for each xml file

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

        // Define title of translated post
        //$post_translated_title = get_post( $post_id )->post_title . ' (' . $lang . ')';
       // $insertPostArr['post_title'] = $insertPostArr['post_title'] . ' (' . $lang . ')';
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


        $this->logger->trace( sprintf('Language %s - %s %s: ' , $lang, $post_translated_id, $page['post_name'] ) );
        // Return translated post ID
        return $post_translated_id;
    }

    /**
     * Internal help function for faster debugging of rewrite rule errors.
     * Not for production usage
     * @param string $ep_mask use the default value
     */
//     private function add_rewrite_rules ($ep_mask = EP_NONE) {
//         global $wp_rewrite;
//         $wp_rewrite->matches = 'matches'; // this is necessary to write the rules properly
//         $new_rules = $wp_rewrite->generate_rewrite_rules (false, $ep_mask);
//         $this->logger->trace ($new_rules);
//         //$rules = get_option('rewrite_rules');
//         //$rules = array_merge($new_rules, $rules);
//         //update_option('rewrite_rules', $rules);
//     }

    /**
     * Remove the data from Wordpress
     * @param string $post_type optional unloading for only one post_type
     * @todo check all the non default post types for deletion
     */
    public function unload ($post_type = null) {

        $this->logger->trace ("Unloading default data from location : " . $this->location);
        global $wp_rewrite;
        $wp_rewrite->flush_rules(  );
        //flush_rewrite_rules ();

        //remove posts : bidx for now
        $post_type = 'bidx';

        $posts_array = get_posts (array (
          'post_type' => $post_type,
          'post_status' => 'publish',
          'nopaging' => true,
          'suppress_filters' => true)
        );
        if ($posts_array) {
            $this->logger->trace ('Removing ' . sizeof ($posts_array) . ' posts');
            foreach ($posts_array as $post) {

                $postid = $post->ID;
                wp_delete_post ($postid, true);
                $this->logger->trace ('Removed post id : ' . $postid);
            }

            $this->logger->trace ('bidX rules de-activation succeeded');
        }

        remove_role( WP_ADMIN_ROLE );
        remove_role( WP_OWNER_ROLE );
        remove_role( WP_MEMBER_ROLE );
        remove_role( WP_ANONYMOUS_ROLE );

        delete_option( 'BIDX_REWRITE_RULES' );
    }

    /**
     * Initialize post type
     * @param $post_type type that needs to created custom
     */
    public function codex_custom_init ()
    {
        $this->localeTextdomainInit ();
        //hardcoded for now
        $post_type = 'bidx';

        $this->logger->trace ('Initializing custom Post handler for contentloader: ' . $post_type);
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

        if ( $_POST [ 'icl_ajx_action' ] && !empty ( $_POST[ 'langs' ] ) )
        {
            // Include WPML API
            //include_once( WP_PLUGIN_DIR . '/sitepress-multilingual-cms/inc/wpml-api.php' );

            // Include WPML API
            include_once( WP_PLUGIN_DIR . '/sitepress-multilingual-cms/inc/wpml-api.php' );

            $this->logger->trace (sprintf ('POST data export: %s' , var_export ($_POST, true)));

            $langArr  = explode(',',$_POST['langs']);


            $filename = BIDX_PLUGIN_DIR . '/../pages/page.xml';

            $document = simplexml_load_file( $filename );

            $this->logger->trace( 'Start processing file : ' . $filename );

            $posts    = $document->xpath ( '//post' );

            $this->logger->trace( 'Found posts : ' . sizeof( $posts ) );

            foreach ( $posts as $post )
            {
                if ( $post->setTranslate == 'true' )
                {
                    $page               = (array) get_page_by_title( (string) $post->title, 'OBJECT', $document->posttype );
                    $postID             = $page['ID'];
                    $type               = $page['post_type'];

                    //$trid               = wpml_get_content_trid ( 'post_'.$type, $postID );

                    unset($page['ID']);

                    $pageTranslations = wpml_get_content_translations( 'post_'.$type, $postID);

                    $this->logger->trace( sprintf('translations %s' , var_export($pageTranslations, true) ) );

                    foreach( $langArr as $langVal)
                    {
                        if( !array_key_exists( $langVal, $pageTranslations ) )
                        {
                            /*$page['post_title'] = $page['post_title']."-".$langVal;
                            $page['post_name']  = $page['post_name']."_".$langVal;*/

                            $this->logger->trace( sprintf('Inserting new post : Language %s, %s' , $langVal , var_export($page, true) ) );

                           /* $contentId = wp_insert_post( $page );

                            wpml_add_translatable_content ( $type, $contentId, $langVal, $trid ); */

                            $this->mwm_wpml_translate_post ($postID, $page, $langVal);


                        }

                    }

                }
            }

        }
    }

    /**
     * Initialize Static Multilingual text domain data load
     * @param $post_type type that needs to created custom
     * @example http://geertdedeckere.be/article/loading-wordpress-language-files-the-right-way
     */

    function localeTextdomainInit ()
    {

        /*$plugin_var = 'sitepress-multilingual-cms/sitepress.php';

        //If WPML is active then fetch the language of WPML url params that we are getting
        if (in_array ($plugin_var, apply_filters ('active_plugins', get_option ('active_plugins')))) {

            require_once WP_PLUGIN_DIR . '/sitepress-multilingual-cms/sitepress.php';

            $sitepress          =   new SitePress();
            $current_lang       =   $sitepress->init();
            $current_url_locale =   $sitepress->get_locale(ICL_LANGUAGE_CODE);

        } else  // Else load the site default langualge from Settings->general->site language option
        {
            $current_url_locale =   get_locale ();
        }*/
        $current_url_locale =   get_locale ();
        /* 1. Load Textdomain for Bidx Static APIs */
        $domain         = 'static'; //we use _e('String','static') see staticdataservice.php
        $languagePath   = WP_CONTENT_DIR . '/languages';
        $locale         = apply_filters ('plugin_locale', $current_url_locale, $domain);
        $moStaticfile   = $languagePath . '/static/' . $locale . '.mo';
        load_textdomain ($domain, $moStaticfile);

        /* 2. Load Textdomain for Bidx Wp I18n */
        $domain         = 'i18n'; // we use _e('String','i18n')
        $locale         = apply_filters ('plugin_locale', $current_url_locale, $domain);
        $moi18nfile     = $languagePath . '/i18n/' . $locale . '.mo';
        load_textdomain ($domain, $moi18nfile);

        /* 3. Load Textdomain for Bidx Plugin */
        $domain         = 'bidxplugin'; // we use _e('String','i18n')
        $locale         = apply_filters ('plugin_locale', $current_url_locale, $domain);
        $moPluginfile   = $languagePath . '/plugins/' . $locale . '.mo';
        load_textdomain ($domain, $moPluginfile);
    }

    /**
     * If new Version update db options
     * @param $new_version New Version of Plugin then do actions
     * @example http://wp.smashingmagazine.com/2011/03/08/ten-things-every-wordpress-plugin-developer-should-know/
     */
    function isVersionUpdate ()
    {
        //if (get_option (BIDX_VERSION_KEY) != BIDX_VERSION_NUM) {

           // if (!function_exists ('flush_rules'))
           //     require_once(ABSPATH . "wp-includes/rewrite.php");
           //$this->unload ();
           //$this->load (); // Will update the version var in load function
        //}
    }

    /* Add Custom Role capabilities
     * @author Altaf Samnani
     * @version 1.0
     * @description  Assign Roles Capabilities
     *
     *
     * @param bool $return
     */

    function create_custom_role_capabilities ()
    {

        /*         * ********* Add Bidx Group Owner Group Admin Roles *************** */
        $blog_id                          = get_current_blog_id();
        $editorRole                       = get_role ('editor');
        $editorCaps                       = $editorRole->capabilities;
        $editorCaps['edit_theme_options'] = true;
        $editorCaps['editor']             = true; // Adding it for Zendesk access to act capability as a role because zendesk supports particular roles and Group Admin and Group Owner doesnt fall into that.
        $editorCaps['subscriber']         = true;
        //(!get_role(WP_ADMIN_ROLE)) ? add_role (WP_ADMIN_ROLE, 'Group Admin', $editorCaps): '';
        add_role (WP_ADMIN_ROLE, 'Group Admin', $editorCaps);

        //(!get_role(WP_OWNER_ROLE)) ? add_role (WP_OWNER_ROLE, 'Group Owner', $editorCaps): '';
        add_role (WP_OWNER_ROLE, 'Group Owner', $editorCaps);

        $new_user_caps_member = array ('read' => true );

        (!get_role(WP_MEMBER_ROLE)) ? add_role (WP_MEMBER_ROLE, 'Group Member', $new_user_caps_member): '';

        $new_user_caps_anonymous = array ('read' => true);
        (!get_role(WP_ANONYMOUS_ROLE)) ? add_role (WP_ANONYMOUS_ROLE, 'Group Anonymous', $new_user_caps_anonymous): '';






          /********* Add Bidx Group Owner Group Admin Roles **************** */
//        $users_query = new WP_User_Query (array ('role' => 'administrator', 'orderby' => 'display_name'));
//        $results = $users_query->get_results ();
        //$blogTitle = strtolower (get_bloginfo ());
          $blogUrl   = strtolower (get_site_url());
          $blogTitle = BidxCommon::get_bidx_subdomain(false,$blogUrl);
      //  foreach ($results as $user) {

       //     $user_id = $userID;

            //When creating directly from wordpress handle that case too
            $is_frm_bidx = (preg_match ("/groupadmin\z/i", $user->user_login)) ? true : false;
            $group_password = 'bidxGeeks9';
            //$group_admin_password = $user->user_login.'groupadmin';
            //Group Admin
            $group_admin_login = $blogTitle . WP_ADMIN_ROLE;
            $group_admin_email = $blogTitle . '_admin@bidx.net';

            //Group Owner
            $group_owner_login = $blogTitle . WP_OWNER_ROLE;
            $group_owner_email = $blogTitle . '_owner@bidx.net';

            //Group Member
            $group_member_login = $blogTitle . WP_MEMBER_ROLE;
            $group_member_email = $blogTitle . '_member@bidx.net';

            //Group Member
            $group_anonymous_login = $blogTitle . WP_ANONYMOUS_ROLE;
            $group_anonymous_email = $blogTitle . '_anonymous@bidx.net';
       // }


        //Add Group Owner Role
//        if ($is_frm_bidx) {
//            $user = new WP_User ($user_id);
//            $user->remove_role ('administrator');
//            $user->add_role ('groupowner');
//        } else {
            /* For Adding users to existing blog */
            //1.1 Check Groupowner User
            $userOwner = get_user_by('login', $group_owner_login);
            $this->logger->trace( '$userOwnerdump : ' .$group_owner_login  );
            //1.2 If Groupowner user doesnt exist then create it
            $user_id_owner = ($userOwner->ID) ? $userOwner->ID : wpmu_create_user ($group_owner_login, $group_password, $group_owner_email);


            //1.3 If useris not having
            (!in_array(WP_OWNER_ROLE,$userOwner->roles)) ? add_user_to_blog ($blog_id, $user_id_owner, WP_OWNER_ROLE):'';

       // }

        //2 Add Group Admin Role
        //2.1 Check Groupowner User
        $userAdmin = get_user_by('login', $group_admin_login);
        //2.2 If Groupowner user doesnt exist then create it
        $user_id_admin = ($userAdmin->ID) ? $userAdmin->ID : wpmu_create_user ($group_admin_login, $group_password, $group_admin_email);
        //2.3 If useris not having
        (!in_array(WP_ADMIN_ROLE,$userAdmin->roles)) ? add_user_to_blog ($blog_id, $user_id_admin, WP_ADMIN_ROLE):'';

        //3 Add Group Member Role
        //3.1 Check Groupmember User
        $userMember = get_user_by('login', $group_member_login);
        //3.2 If Groupmember user doesnt exist then create it
        $user_id_member = ($userMember->ID) ? $userMember->ID : wpmu_create_user ($group_member_login, $group_password, $group_member_email);
        //3.3 If useris not having
        (!in_array(WP_MEMBER_ROLE,$userMember->roles)) ? add_user_to_blog ($blog_id, $user_id_member, WP_MEMBER_ROLE):'';

        //4 Add Group Anonymous Role
        //4.1 Check Groupanonymous User
        $userAnonymous = get_user_by('login', $group_anonymous_login);
        //4.2 If Groupanonymous user doesnt exist then create it
        $user_id_anonymous = ($userAnonymous->ID) ? $userAnonymous->ID : wpmu_create_user ($group_anonymous_login, $group_password, $group_anonymous_email);
        //4.3 If useris not having
        (!in_array(WP_ANONYMOUS_ROLE,$userAnonymous->roles)) ? add_user_to_blog ($blog_id, $user_id_anonymous, WP_ANONYMOUS_ROLE):'';




        //wpmu_signup_user( $new_user_login, 'test@aa.com', array( 'add_to_blog' => $blog_id, 'new_role' => 'groupadmin' ) );
        //wp_insert_user( $user );

        return $user_id_owner;
    }

    /* Replace Place holders for templates
     * @author Altaf Samnani
     * @version 1.0
     * @description  Replace placeholders for templates
     *
     *
     * @param string $replacedContent
     */
    function replacePlaceHolders($content) {

        /* 1 Group Name*/
        $blogUrl         = strtolower (get_site_url());
        $blogTitle       = BidxCommon::get_bidx_subdomain(false,$blogUrl);

        $placeHolder[]   = '%group_name%';
        $replaceString[] = $blogTitle;



        $replacedContent = str_replace($placeHolder, $replaceString, $content );
        return $replacedContent;


    }

}
?>
