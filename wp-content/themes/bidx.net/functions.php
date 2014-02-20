<?php
	// enables wigitized sidebars
	if ( function_exists('register_sidebar') )

	// Sidebar Widget
	// Location: the sidebar
	register_sidebar(
		array(
			'name'=>'Sidebar',
			'before_widget' => '<div class="widget widget-sidebar">',
			'after_widget' => '</div>',
			'before_title' => '<div class="subpage-title"><h5>',
			'after_title' => '</h5></div>',
		)
	);
	// Header Widget
	// Location: right after the navigation
	register_sidebar(array('name'=>'Header',
		'before_widget' => '<div class="widget-area widget-header"><ul>',
		'after_widget' => '</ul></div>',
		'before_title' => '<h4>',
		'after_title' => '</h4>',
	));
	// Footer Widget
	// Location: at the top of the footer, above the copyright
	register_sidebar(array('name'=>'Footer',
		'before_widget' => '<div class="widget-area widget-footer"><ul>',
		'after_widget' => '</ul></div>',
		'before_title' => '<h4>',
		'after_title' => '</h4>',
	));
	// The Alert Widget
	// Location: displayed on the top of the home page, right after the header, right before the loop, within the content area
	register_sidebar(array('name'=>'Alert',
		'before_widget' => '<div class="widget-area widget-alert"><ul>',
		'after_widget' => '</ul></div>',
		'before_title' => '<h4>',
		'after_title' => '</h4>',
	));

	// post thumbnail support
	add_theme_support( 'post-thumbnails' );
	// adds the post thumbnail to the RSS feed
	function cwc_rss_post_thumbnail($content) {
	    global $post;
	    if(has_post_thumbnail($post->ID)) {
	        $content = '<p>' . get_the_post_thumbnail($post->ID) .
	        '</p>' . get_the_content();
	    }
	    return $content;
	}
	add_filter('the_excerpt_rss', 'cwc_rss_post_thumbnail');
	add_filter('the_content_feed', 'cwc_rss_post_thumbnail');

	// custom menu support
	add_theme_support( 'menus' );
	if ( function_exists( 'register_nav_menus' ) ) {
	  	register_nav_menus(
	  		array(
	  		  'header-menu' => 'Header Menu',
	  		  'sidebar-menu' => 'Sidebar Menu',
	  		  'footer-menu' => 'Footer Menu',
	  		  'logged-in-menu' => 'Logged In Menu'
	  		)
	  	);
	}

	// custom background support
	add_custom_background();

	// custom header image support
	define('NO_HEADER_TEXT', true );
	define('HEADER_IMAGE', '%s/images/default-header.png'); // %s is the template dir uri
	define('HEADER_IMAGE_WIDTH', 1068); // use width and height appropriate for your theme
	define('HEADER_IMAGE_HEIGHT', 300);
	// gets included in the admin header
	function admin_header_style() {
	    ?><style type="text/css">
	        #headimg {
	            width: <?php echo HEADER_IMAGE_WIDTH; ?>px;
	            height: <?php echo HEADER_IMAGE_HEIGHT; ?>px;
	        }
	    </style><?php
	}
	add_custom_image_header( '', 'admin_header_style' );

	// adds Post Format support
	// learn more: http://codex.wordpress.org/Post_Formats
	// add_theme_support( 'post-formats', array( 'aside', 'gallery','link','image','quote','status','video','audio','chat' ) );

	// removes detailed login error information for security
	add_filter('login_errors',create_function('$a', "return null;"));

	// removes the WordPress version from your header for security
	function wb_remove_version() {
		return '<!--built on bidx.net -->';
	}
	add_filter('the_generator', 'wb_remove_version');


	// Removes Trackbacks from the comment cout
	add_filter('get_comments_number', 'comment_count', 0);
	function comment_count( $count ) {
		if ( ! is_admin() ) {
			global $id;
			$comments_by_type = &separate_comments(get_comments('status=approve&post_id=' . $id));
			return count($comments_by_type['comment']);
		} else {
			return $count;
		}
	}

	// invite rss subscribers to comment
	function rss_comment_footer($content) {
		if (is_feed()) {
			if (comments_open()) {
				$content .= 'Comments are open! <a href="'.get_permalink().'">Add yours!</a>';
			}
		}
		return $content;
	}

	// custom excerpt ellipses for 2.9+
	function custom_excerpt_more($more) {
		return 'Read More &raquo;';
	}
	add_filter('excerpt_more', 'custom_excerpt_more');
	// no more jumping for read more link
	function no_more_jumping($post) {
		return '<a href="'.get_permalink($post->ID).'" class="read-more">'.'&nbsp; Continue Reading &raquo;'.'</a>';
	}
	add_filter('excerpt_more', 'no_more_jumping');

	// category id in body and post class
	function category_id_class($classes) {
		global $post;
		foreach((get_the_category($post->ID)) as $category)
			$classes [] = 'cat-' . $category->cat_ID . '-id';
			return $classes;
	}
	add_filter('post_class', 'category_id_class');
	add_filter('body_class', 'category_id_class');

	// adds a class to the post if there is a thumbnail
	function has_thumb_class($classes) {
		global $post;
		if( has_post_thumbnail($post->ID) ) { $classes[] = 'has_thumb'; }
			return $classes;
	}
	add_filter('post_class', 'has_thumb_class');

	/**
	 * Add custom post types
	 */

	add_action ('init', 'bidx_create_post_types');

	function bidx_create_post_types() {
		create_post_type();
		create_post_type('group');
		create_post_type('competition');
		create_post_type('testimonial');
	}

	function create_post_type($post_type = 'staff') {

		$args = array (
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
				'supports' => array( 'title', 'editor', 'thumbnail', 'excerpt' )
		);
		register_post_type ($post_type, $args);

	}

?>


















<?php
/**
 * Cleaner walker for wp_nav_menu()
 *
 * Walker_Nav_Menu (WordPress default) example output:
 *   <li id="menu-item-8" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-8"><a href="/">Home</a></li>
 *   <li id="menu-item-9" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-9"><a href="/sample-page/">Sample Page</a></l
 *
 * Roots_Nav_Walker example output:
 *   <li class="menu-home"><a href="/">Home</a></li>
 *   <li class="menu-sample-page"><a href="/sample-page/">Sample Page</a></li>
 */
class Roots_Nav_Walker extends Walker_Nav_Menu {
    function check_current($classes) {
        return preg_match('/(current[-_])|active|dropdown/', $classes);
    }

    function start_lvl(&$output, $depth = 0, $args = array()) {
        $output .= "\n<ul class=\"dropdown-menu\">\n";
    }

    function start_el(&$output, $item, $depth = 0, $args = array(), $id = 0) {
        // new dBug($item);

        $item_html = '';
        parent::start_el($item_html, $item, $depth, $args);

        if ($item->is_dropdown && ($depth === 0)) {
            //$item_html = str_replace('<a', '<a class=""', $item_html ); //dropdown-toggle" data-toggle="dropdown" data-target="#"', $item_html);
            $item_html = str_replace('<a href="#">', '<a class="dropdown-toggle" href="'. $item->url .'" data-toggle="dropdown" data-target="#">', $item_html);
            $item_html = str_replace('</a>', ' <span class="fa fa-caret-down"></span></a>', $item_html);
        }
        elseif (stristr($item_html, 'li class="divider')) {
            $item_html = preg_replace('/<a[^>]*>.*?<\/a>/iU', '', $item_html);
        }
        elseif (stristr($item_html, 'li class="nav-header')) {
            $item_html = preg_replace('/<a[^>]*>(.*)<\/a>/iU', '$1', $item_html);
        }

        $output .= $item_html;
    }

    function display_element($element, &$children_elements, $max_depth, $depth = 0, $args, &$output) {
        $element->is_dropdown =  ((!empty($children_elements[$element->ID]) && (($depth + 1) < $max_depth)));

        if ($element->is_dropdown) {
            if ($depth === 0) {
                $element->classes[] = 'dropdown';
            } elseif ($depth === 1) {
                $element->classes[] = 'dropdown-submenu';
            }
        }

        parent::display_element($element, $children_elements, $max_depth, $depth, $args, $output);
    }
}

/**
 * Remove the id="" on nav menu items
 * Return 'menu-slug' for nav menu classes
 */
function roots_nav_menu_css_class($classes, $item) {
    $slug = sanitize_title($item->title);
    $classes = preg_replace('/(current(-menu-|[-_]page[-_])(item|parent|ancestor))/', 'active', $classes);
    $classes = preg_replace('/^((menu|page)[-_\w+]+)+/', '', $classes);

    $classes[] = 'menu-' . $slug;

    $classes = array_unique($classes);

    return array_filter($classes, 'is_element_empty');
}
add_filter('nav_menu_css_class', 'roots_nav_menu_css_class', 10, 2);
add_filter('nav_menu_item_id', '__return_null');

/**
 * Clean up wp_nav_menu_args
 *
 * Remove the container
 * Use Roots_Nav_Walker() by default
 */
function roots_nav_menu_args($args = '') {
    $roots_nav_menu_args['container'] = false;

    if (!$args['items_wrap']) {
        $roots_nav_menu_args['items_wrap'] = '<ul class="%2$s">%3$s</ul>';
    }

    if (current_theme_supports('bootstrap-top-navbar')) {
        $roots_nav_menu_args['depth'] = 3;
    }

    if (!$args['walker']) {
        $roots_nav_menu_args['walker'] = new Roots_Nav_Walker();
    }

    return array_merge($args, $roots_nav_menu_args);
}
add_filter('wp_nav_menu_args', 'roots_nav_menu_args');
show_admin_bar( false );

?>
