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
        'name'    => __('Public Front Top', 'bidxplugin'),
        'id'            => 'pub-front-top',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Public Front Body', 'bidxplugin'),
        'id'            => 'pub-front-body',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Public Front Sidebar', 'bidxplugin'),
        'id'            => 'pub-front-side',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Public Front Bottom', 'bidxplugin'),
        'id'            => 'pub-front-bottom',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Public Sidebar', 'bidxplugin'),
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
        'name'          => __('Private Front Top', 'bidxplugin'),
        'id'            => 'priv-front-top',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Private Front Body', 'bidxplugin'),
        'id'            => 'priv-front-body',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Private Front Sidebar', 'bidxplugin'),
        'id'            => 'priv-front-side',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Private Front Bottom', 'bidxplugin'),
        'id'            => 'priv-front-bottom',
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3>',
        'after_title'   => '</h3>',
    ));
    register_sidebar(array(
        'name'          => __('Private Sidebar', 'bidxplugin'),
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
* 2] active competitions  ==> in the competitions plugin
* 3] bidx search widget (quick access to search function) ==> in the plugin
* 4] bidx maps search widget (map view from a central location in a range) ==> in the plugin
*
* --------------------------
*/

// Load the Bidx Widgets
//
require_once locate_template('lib/widgets/carousel.php');
require_once locate_template('lib/widgets/sponsors.php');
require_once locate_template('lib/widgets/promo.php');
require_once locate_template('lib/widgets/button.php');
require_once locate_template('lib/widgets/latest_posts.php');
require_once locate_template('lib/widgets/latest_businesses.php');
require_once locate_template('lib/widgets/latest_members.php');
require_once locate_template('lib/widgets/starthere.php');
require_once locate_template('lib/widgets/video.php');
require_once locate_template('lib/widgets/multicolumn.php');
require_once locate_template('lib/widgets/post.php');
require_once locate_template('lib/widgets/competitioncounter.php');
require_once locate_template('lib/widgets/counter.php');

// Activate default widgets
//
require_once locate_template('lib/widgets/default.php');
