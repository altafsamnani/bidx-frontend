<?php
/**
 * Add custom post types
 */


/****** News & Event Type Functionality for WP Start *******************/

add_action ('init', 'bidxgroup_create_post_types');

function bidxgroup_create_post_types ()
{
    $groupNews = get_option ('group-news'); // If Group news is set through SuperAdmin Dashboard->Settings->bidX Settings then only display it
    if($groupNews) {
        creategroup_post_type (array('post_type' => 'news', 'label' => 'News and Events'));
    }
}

function creategroup_post_type ($post_arr)
{
    $post_type  = $post_arr[ 'post_type' ];
    $post_label = $post_arr[ 'label' ];
    $args = array (
      'label' => ucwords($post_label),
      'public' => true,
      'exclude_from_search' => false,
      'show_ui' => true,
      'show_in_menu' => true,
      'query_var' => true,
      'rewrite' => false,
      'capability_type' => 'post',
      '_builtin' => false,
      'has_archive' => false,
      'hierarchical' => false,
      'supports' => array ('title', 'editor', 'thumbnail', 'excerpt'),
      'taxonomies' => array()
    );
    $newsPostResult = register_post_type ($post_type, $args);

}

/*add_action('publish_news', 'add_news_category_automatically');

function add_news_category_automatically($post_ID)
{
  global $wpdb;

  if(!has_term('','category',$post_ID)) {
    // An array of IDs of categories we to add to this post.
    $cat_ids = array( );
    $term = get_term_by('slug', 'news', 'category');
    $cat_ids[] = $term->term_id;

    if(!empty($cat_ids))
    {
      wp_set_object_terms($post_ID, 'news', 'category');
    }
  }
}

add_action('do_meta_boxes', 'news_remove_metaboxes');

function news_remove_metaboxes()
{
  remove_meta_box( 'categorydiv', 'news', 'side' );
}*/


/****** News & Event Type Functionality for WP End *******************/



add_action ('init', 'bidx_create_custom_page_types');

function bidx_create_custom_page_types ()
{
    create_custom_page_type ();
}

function create_custom_page_type ($post_type = 'sponsors')
{

    $args = array (
      'label' => ucwords($post_type),
      'public' => true,
      'exclude_from_search' => true,
      'show_ui' => true,
      'show_in_menu' => true,
      'query_var' => true,
      'rewrite' => false,
      'capability_type' => 'page',
      '_builtin' => false,
      'has_archive' => false,
      'hierarchical' => false,
      'supports' => array ('title', 'editor', 'thumbnail', 'page-attributes')
    );
    register_post_type ($post_type, $args);
}




/**
 * Custom functions for Bidx
 *
 *
 */
/**
 * Applies the template replacement variables from Post vars
 *
 * @since April 16
 * @Author Altaf Samnani
 *
 * @param string $content  Template Content
 * @param string $content  Replaced Template Content
 */

require_once "class-wp-customize-control.php";

add_filter ('the_content', 'bidx_filter', 5);
add_filter('bidx', 'do_shortcode', 1);

function bidx_filter ($content)
{
    $formValues = $_POST;
    $hiddenElement = "";
    foreach ($formValues as $key => $value) {
        $varName = '[!' . strtoupper ($key) . '!]';
        if (strpos ($content, $varName)) {
            $content = str_replace ($varName, $value, $content);
        } else {
            $hiddenElement .= '<input type="hidden" name="' . $key . '" value="' . $value . '">';
        }
    }

    //Replace the redirect variable
    if (isset ($_GET['q'])) {
        $redirect = $_GET['q'];
        $content = str_replace ('[!Q!]', $redirect, $content);
    }

    //Replace the redirect variable
    if (isset ($_GET['q'])) {
        $redirect = $_GET['q'];
        $content = str_replace ('[!Q!]', $redirect, $content);
    }

    //echo $content;exit;
    //Add Status Messages if any
    //$content = bidx_get_status_msgs() . $content;

    // Add variables as hidden that cant be replaced from Post Variables to keep the previous state
    $content = str_replace ('</form>', $hiddenElement . '</form>', $content);

    return $content;
}


/**
 * Display Status Notifications.
 *
 * @author Altaf S
 * @since Jun 19 2013
 *
 *
 * @return string $statusMessages notification html
 * @access public
 * @example ?smsg = 4 &sparam=base64_enocde('key1=val1|key2=val2|key3=val3)
 * @Why keeping seperate because its run time and session clear in common.php because it needs before session call
   */
function bidx_get_status_msgs( ) {

    $statusMessages = '';
    $replaceString = NULL;
    //Add Error Status Msg
    if (isset ($_GET['emsg'])) {
        $textId = $_GET['emsg'];
        (!empty($_GET['eparam'])) ? $replaceString = base64_decode($_GET['eparam']) :'';
        $statusMsg = bidx_status_text ( $textId, $replaceString );
        $statusMessages = "<div class='alert alert-danger'>
                      <button data-dismiss='alert' class='close fa fa-times' type='button'></button>
                      {$statusMsg}
                    </div>";
       // $content = str_replace ('<!-- Msg -->', $statusMsgDiv, $content);
    }

    //Add Success Status Msg

    if (isset ($_GET['smsg'])) {
        $textId = $_GET['smsg'];
        (!empty($_GET['sparam'])) ? $replaceString = base64_decode($_GET['sparam']) :'';
        $statusMsg = bidx_status_text ( $textId, $replaceString );
        $statusMessages = "<div class='alert alert-success'>
                      <button data-dismiss='alert' class='close fa fa-times' type='button'></button>
                      {$statusMsg}
                    </div>";
        // $content = str_replace ('<!-- Msg -->', $statusMsgDiv, $content);
    }

    /* Message comes directly when we want to show error msg directly */
    if (isset ($_GET['edmsg'])) {

        $statusMessages = "<div class='alert alert-danger'>
                      <button data-dismiss='alert' class='close fa fa-times' type='button'></button>
                      ".base64_decode($_GET['edmsg']).
                      "</div>";

    }



    return $statusMessages;
}

/**
 * Getthe status notification text
 *
 * @author Altaf S
 * @since Jun 19 2013
 *
 * @param string $textId status notification id
 * @return string $statusMessages notification html
 * @access public
   */
function bidx_status_text ( $textId, $replaceString ) {

    switch($textId) {

    case '1' :
        $text = __("Your session expired. Please login again, sorry for any inconvenience and appreciate your patience.",'bidxgrouptheme');
        break;

    case '2' :
        $text = __("Welcome in the group!",'bidxgrouptheme');
        break;

    case '3' :
        $text = __("Successfully left the group!",'bidxgrouptheme');
        break;

    case '4' :
        $text = __("Thank you! You are successful registered as a member of the bidX platform and this group. Feel free to browse around and see what <!--groupname--> can offer you.",'bidxgrouptheme');
        break;

    case '5':
        $text = __('Successfully published!','bidxgrouptheme');
        break;

    case '6':
        $text = __('Request accepted!','bidxgrouptheme');
        break;

    case '7':
        $text = __('Request refused!','bidxgrouptheme');
        break;

    case '8':
        $text = __('You have successfully %action% the request!','bidxgrouptheme');
        break;

    default :
        $text = __('Add your notification message to custom.php with id ','bidxgrouptheme');

     }

     if( $replaceString ) {
         $keyValues = explode('|',$replaceString);
         foreach( $keyValues as $repValue) {
             $dispNote = explode("=", $repValue);
             $dispKey = '%'.$dispNote[0].'%';
             $dispVal = $dispNote[1];
             $text = str_replace($dispKey,$dispVal,$text);
         }

     }

    return $text;

}

/**
 * Add logo section with upload control to theme customizer
 *
 * @author msp
 * @since Sep 16 2013
 *
 * @param $wp_customize class
 * @return void
 * @access public
   */
function theme_customizer_logo( $wp_customize ) {

    $wp_customize->add_section( 'themeslug_logo_section' , array(
        'title'       => __( 'Logo', 'themeslug' ),
        'priority'    => 30,
        'description' => 'Upload a logo to replace the default site name and description in the header',
    ) );

    $wp_customize->add_setting( 'themeslug_logo' );

    $wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'themeslug_logo', array(
        'label'    => __( 'Logo', 'themeslug' ),
        'section'  => 'themeslug_logo_section',
        'settings' => 'themeslug_logo',
    ) ) );
}
add_action('customize_register', 'theme_customizer_logo');





/**
 * Add groupstyle section with textarea control theme customizer
 *
 * @author msp
 * @since Sep 16 2013
 *
 * @param $wp_customize class
 * @return void
 * @access public
   */
function theme_customizer_groupstyle( $wp_customize ) {
    $wp_customize->add_section( 'group_styles', array(
            'title'    => __( 'Group Styles' ),
            'priority' => 20,
    ) );
    $wp_customize->add_setting( 'group_styles', array(
        'default'        => 'Put your group css here',
    ) );


    $wp_customize->add_control( new Example_Customize_Textarea_Control( $wp_customize, 'group_styles', array(
        'label'   => 'Textarea Setting',
        'section' => 'group_styles',
        'settings'   => 'group_styles',
    ) ) );
}
add_action( 'customize_register', 'theme_customizer_groupstyle' );

/**
 * Add analytics section with textarea control theme customizer
 *
 * @author jaapgorjup
 * @since Apr 29 2014
 *
 * @param $wp_customize class
 * @return void
 * @access public
 */
function theme_customizer_analytics_codes( $wp_customize ) {
	$wp_customize->add_section( 'analytics_codes', array(
			'title'    => __( 'Google Analytics codes' ),
			'priority' => 20,
	) );
	$wp_customize->add_setting( 'analytics_codes', array(
			'default'        => '',
	) );


	$wp_customize->add_control( new Example_Customize_Textarea_Control( $wp_customize, 'analytics_codes', array(
			'label'   => 'Analytics codes comma separated',
			'section' => 'analytics_codes',
			'settings'   => 'analytics_codes',
	) ) );
}
add_action( 'customize_register', 'theme_customizer_analytics_codes' );

function add_footer_content( $wp_customize, $lang = '' )
{

  $wp_customize->add_section( 'footer'.$lang, array(
            'title'    => __( $lang. 'Footer' ),
            'priority' => ($lang == '') ? 91 : 93,
    ) );

  $wp_customize->add_setting( 'footer'.$lang, array(
      'default'        => '',
  ) );


  $wp_customize->add_control( new Example_Customize_Textarea_Control( $wp_customize, 'footer'.$lang, array(
      'label'   => $lang. 'Custom HTML for the footer',
      'section' => 'footer'.$lang,
      'settings'   => 'footer'.$lang,
  ) ) );

}

/**
 * Add footer section with textarea control theme customizer
 *
 * @author msp
 * @since Oct 01 2013
 *
 * @param $wp_customize class
 * @return void
 * @access public
   */
function theme_customizer_footer( $wp_customize ) {

    global $sitepress;

    add_footer_content( $wp_customize ); // Add default always

    if( $sitepress) {

      $langArr = $sitepress->get_active_languages();
      unset( $langArr['en'] );

      if( $langArr)
      {
        foreach( $langArr as $langKey => $langVal) {

          $lang   = ($langKey == 'en') ? '': '_'.$langKey; // If english add the original else front_content_%lang%

          add_footer_content( $wp_customize, $lang);
        }
      }
    }
}

add_action( 'customize_register', 'theme_customizer_footer' );

function add_frontend_content( $wp_customize, $lang = '' )
{

  $wp_customize->add_section( 'front_content'.$lang, array(
            'title'    => __( $lang. 'Front Main Content Area' ),
            'priority' => ($lang == '') ? 90 : 92,
    ) );

  $wp_customize->add_setting( 'front_content'.$lang, array(
      'default'        => '',
  ) );


  $wp_customize->add_control( new Example_Customize_Textarea_Control( $wp_customize, 'front_content'.$lang, array(
      'label'   => $lang. 'Custom HTML for the Front main content area',
      'section' => 'front_content'.$lang,
      'settings'   => 'front_content'.$lang,
  ) ) );

}

/**
 * Add front main content section with textarea control theme customizer
 *
 * @author msp
 * @since Oct 03 2013
 *
 * @param $wp_customize class
 * @return void
 * @access public
   */
function theme_customizer_front_content( $wp_customize ) {
    global $sitepress;

    add_frontend_content( $wp_customize ); // Add default always

    if( $sitepress) {

      $langArr = $sitepress->get_active_languages();
      unset( $langArr['en'] );

      if( $langArr)
      {
        foreach( $langArr as $langKey => $langVal) {

          $lang   = ($langKey == 'en') ? '': '_'.$langKey; // If english add the original else front_content_%lang%

          add_frontend_content( $wp_customize, $lang);
        }
      }
    }
}
add_action( 'customize_register', 'theme_customizer_front_content' );

/**
 * Add favicon section with upload control to theme customizer
 *
 * @author Altaf
 * @since Feb 28 2014
 *
 * @param $wp_customize class
 * @return void
 * @access public
   */
function theme_customizer_favicon( $wp_customize ) {

    $wp_customize->add_section( 'favicon_image' , array(
        'title'       => __( 'Favicon', 'bidxtheme' ),
        'description' => 'Upload a favicon',
    ) );

    $wp_customize->add_setting( 'favicon_image' );

    $wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'favicon_image', array(
        'label'    => __( 'Favicon', 'bidxtheme' ),
        'section'  => 'favicon_image',
        'settings' => 'favicon_image',
    ) ) );
}
add_action('customize_register', 'theme_customizer_favicon');


/**
 * Function get_custom_field_value() - retrieves the custom
 *
 * If $i is not provided, grap single value from custom field
 * If $i has been provided and is less then arary count, get array value corresponding to index $i
 *
 * @param  string $key
 * @param  number $i
 *
 * @return string
 */
function get_custom_field_value ( $key,  $i = null)
{

    $single = !$i ? true : false;
    $result = get_post_meta( get_the_ID(), $key , $single );

    // if multiple customfields with the same key are requested
    //
    if ( !$single ) {
        if ( $i < count( $result) ) {
            $value = $result[ $i ];
        } else {
            $value = "Error, requested array index " .  $i . " does not exist";
        }
    // if only one custom field value is requested
    //
    } else {
        $value = $result;
    }

    return $value;
}

function getLangPrefix( $sep = '' )
{
  global $sitepress;

  $siteLanguage = NULL;

  if( $sitepress )
  {
    $currentLanguage = $sitepress->get_current_language();

    if( $currentLanguage !== 'en')
    {
      $siteLanguage = $currentLanguage;
    } else
    {
      $sep = '';
    }
  }
   return $sep.$siteLanguage ;
}

function _pageuri( $contenPath )
{

  global $sitepress;

  $translatedContentId = NULL;

  if( $sitepress )
  {
    $currentLanguage = $sitepress->get_current_language();

    if( $currentLanguage && $currentLanguage != 'en')
    {
      require_once ABSPATH. "/wp-content/plugins/sitepress-multilingual-cms/inc/wpml-api.php";

      $pageByPath = get_page_by_path  ($contenPath );

      $translatedContent = wpml_get_content_translation ('post_'.$pageByPath->post_type, $pageByPath->ID, $currentLanguage);

      $translatedContentId = $translatedContent[$currentLanguage];

      $contenPath = ($translatedContentId) ? get_page_uri($translatedContentId) : $contenPath;
    }
  }

  return $contenPath;

}

function _l( $url = NULL )
{
  global $sitepress;
  $sep = '/';

  if( $sitepress )
  {
    $currentLanguage = $sitepress->get_current_language();

    if( $currentLanguage && $currentLanguage != 'en')
    {
      $sep = '';
    }
  }

  $returnUrl = get_home_url().$sep.$url;

  return $returnUrl;
}

function _wl( $url = NULL )
{
  global $sitepress;
  $sep        =   '/';
  $langParam  =   '';

  if( $sitepress )
  {
    $currentLanguage = $sitepress->get_current_language();
    if( $currentLanguage && $currentLanguage != 'en')
    {
      $langParam = '-'.$currentLanguage ;
      $sep = '';
    }
  }

  $returnUrl = get_home_url().$sep.$url.$langParam ;

  return $returnUrl;

}
function languages_list_footer()
{

  global $sitepress;
  if( $sitepress )
  {
    $currentLanguage  = $sitepress->get_current_language();
    $baseUrl          = str_replace( '/'.$currentLanguage.'/', "/", $_SERVER['REQUEST_URI'] );
    $languages        = icl_get_languages("skip_missing=0&orderby=code&link_empty_to=/{%lang}{$baseUrl}");
    if(!empty($languages))
    {
        $html   = '<div id="lang_sel_footer">
                      <ul>';

        foreach($languages as $l)
        {
            $html         .=   '<li>';
            $anchorStart  =   '';
            $anchorEnd    =   '';

            if($l['country_flag_url'])
            {
                if(!$l['active'])
                {
                  $anchorStart  =  '<a href="'.$l['url'].'">';
                  $anchorEnd    =  '</a>';
                }

                $imgHtml  =  '<img src="'.$l['country_flag_url'].'" class="iclflag" alt="'.$l['language_code'].'" />';
                $html     .=  $anchorStart.$imgHtml.$anchorEnd;

            }
              $nameHtml   =   icl_disp_language($l['native_name'], $l['translated_name']);
              $html      .=   $anchorStart.$nameHtml.$anchorEnd;

            $html        .= '</li>';
        }

        $html   .=    '</ul></div>';

        echo $html;
    }
  }
}



