<?php
/**
 *  Initial setup and constants
 */
// post thumbnail support
add_theme_support ('post-thumbnails');

// adds the post thumbnail to the RSS feed
function cwc_rss_post_thumbnail ($content)
{
    global $post;
    if (has_post_thumbnail ($post->ID)) {
        $content = '<p>' . get_the_post_thumbnail ($post->ID) .
            '</p>' . get_the_content ();
    }
    return $content;
}

add_filter ('the_excerpt_rss', 'cwc_rss_post_thumbnail');
add_filter ('the_content_feed', 'cwc_rss_post_thumbnail');

// custom menu support
add_theme_support ('menus');
if (function_exists ('register_nav_menus')) {
    register_nav_menus (
        array (
          'header-menu' => 'Header Menu',
          'sidebar-menu' => 'Sidebar Menu',
          'footer-menu' => 'Footer Menu',
          'logged-in-menu' => 'Logged In Menu'
        )
    );
}

// custom background support
add_custom_background ();

// custom header image support
define ('NO_HEADER_TEXT', true);
define ('HEADER_IMAGE', '%s/images/default-header.png'); // %s is the template dir uri
define ('HEADER_IMAGE_WIDTH', 1068); // use width and height appropriate for your theme
define ('HEADER_IMAGE_HEIGHT', 300);

// gets included in the admin header
function admin_header_style ()
{
    ?><style type="text/css">
        #headimg {
            width: <?php echo HEADER_IMAGE_WIDTH; ?>px;
            height: <?php echo HEADER_IMAGE_HEIGHT; ?>px;
        }
    </style><?php
}

add_custom_image_header ('', 'admin_header_style');

// adds Post Format support
// learn more: http://codex.wordpress.org/Post_Formats
// add_theme_support( 'post-formats', array( 'aside', 'gallery','link','image','quote','status','video','audio','chat' ) );
// removes detailed login error information for security
add_filter ('login_errors', create_function ('$a', "return null;"));

// removes the WordPress version from your header for security
function wb_remove_version ()
{
    return '<!--built on bidx.net -->';
}

add_filter ('the_generator', 'wb_remove_version');


// Removes Trackbacks from the comment cout
add_filter ('get_comments_number', 'comment_count', 0);

function comment_count ($count)
{
    if (!is_admin ()) {
        global $id;
        $comments_by_type = &separate_comments (get_comments ('status=approve&post_id=' . $id));
        return count ($comments_by_type['comment']);
    } else {
        return $count;
    }
}

// invite rss subscribers to comment
function rss_comment_footer ($content)
{
    if (is_feed ()) {
        if (comments_open ()) {
            $content .= 'Comments are open! <a href="' . get_permalink () . '">Add yours!</a>';
        }
    }
    return $content;
}

// custom excerpt ellipses for 2.9+
function custom_excerpt_more ($more)
{
    return 'Read More &raquo;';
}

add_filter ('excerpt_more', 'custom_excerpt_more');

// no more jumping for read more link
function no_more_jumping ($post)
{
    return '<p><p/><a href="' . get_permalink ($post->ID) . '" class="btn btn-flat flat-color btn-rounded btn-sm">' . '&nbsp; Continue Reading ' . '<i class="fa fa-long-arrow-right"></i></a>';
}

add_filter ('excerpt_more', 'no_more_jumping');

// category id in body and post class
function category_id_class ($classes)
{
    global $post;
    foreach ((get_the_category ($post->ID)) as $category)
        $classes [] = 'cat-' . $category->cat_ID . '-id';
    return $classes;
}

add_filter ('post_class', 'category_id_class');
add_filter ('body_class', 'category_id_class');

// adds a class to the post if there is a thumbnail
function has_thumb_class ($classes)
{
    global $post;
    if (has_post_thumbnail ($post->ID)) {
        $classes[] = 'has_thumb';
    }
    return $classes;
}

add_filter ('post_class', 'has_thumb_class');

//post thumbnail support
add_action ('after_setup_theme', 'theme_setup');

function theme_setup ()
{
    if (function_exists ('add_theme_support')) {
        add_image_size ('bidx_thumb', 64, 64, true);
        add_image_size ('bidx_medium', 310, 195, true);
        add_image_size ('bidx_large', 735, 300, true);
    }
}
