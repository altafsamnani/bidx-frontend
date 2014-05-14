<?php
/**
* FRONT REGIONS LIST
* -----------------------------------
* Public / Private TOP
* Public / Private [ BODY - SIDEBAR ]
* Public / Private BOTTOM
* Public / Private MEMBER
*
*/

//
// Register sidebars and widgets
//
function bidx_widgets_init() {

    //
    // Public
    //
    register_sidebar(array(
        'name'    => __('Public Front Top', 'bidx_group_theme'),
        'id'            => 'pub-front-top',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Public Front Body', 'bidx_group_theme'),
        'id'            => 'pub-front-body',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Public Front Sidebar', 'bidx_group_theme'),
        'id'            => 'pub-front-side',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Public Front Bottom', 'bidx_group_theme'),
        'id'            => 'pub-front-bottom',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    )); 
    register_sidebar(array(
        'name'          => __('Public Member Sidebar', 'bidx_group_theme'),
        'id'            => 'pub-member-side',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    )); 

    //
    // Private
    //
    register_sidebar(array(
        'name'          => __('Private Front Top', 'bidx_group_theme'),
        'id'            => 'priv-front-top',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Private Front Body', 'bidx_group_theme'),
        'id'            => 'priv-front-body',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Private Front Sidebar', 'bidx_group_theme'),
        'id'            => 'priv-front-side',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Private Front Bottom', 'bidx_group_theme'),
        'id'            => 'priv-front-bottom',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    )); 
    register_sidebar(array(
        'name'          => __('Private Member Sidebar', 'bidx_group_theme'),
        'id'            => 'priv-member-side',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    )); 
}
add_action('widgets_init', 'bidx_widgets_init');


/**
* --------------------------
* bidx Widgets list
*  
* User Interface
* 1] Caroussel widget (stand-alone, select from media and optionally add call-to-action)
* 2] Testimonial widget (public testimonial information)
* 3] Big Quote widget (creates a big quote with name)
* 4] Post widget (select any post and add it)
* 5] Start Now or Join	
* 6] Sponsors
* 
* Information
* 1] bidx group changes (selector for members / businessplans / changes / all + view-type + amount 3-5)
* 2] active competitions (integrates with XML feed from Skipso)
* 3] bidx conversion widget (logged-in for access plan / profile + create new)
* 4] bidx search widget (quick access to search function)
* 5] bidx maps search widget (map view from a central location in a range)
* 
* --------------------------
*/

// Load the Bidx Widgets
require_once locate_template('lib/widgets/carousel.php');
