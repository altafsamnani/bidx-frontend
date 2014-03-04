<?php

/**
 * Custom functions
 */
/**
 * Add custom post types
 */
add_action ('init', 'bidx_create_post_types');

function bidx_create_post_types ()
{
    create_post_type ();
    create_post_type ('group');
    create_post_type ('competition');
    create_post_type ('testimonial');
    create_post_type ('team');
}

function create_post_type ($post_type = 'staff')
{

    $args = array (
      'label' => ucwords($post_type),
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
      'supports' => array ('title', 'editor', 'thumbnail', 'excerpt')
    );
    register_post_type ($post_type, $args);
}

function bidx_language_selector ()
{//btn btn-flat flat-link navbar-btn pull-right
    $test = apply_filters ('active_plugins', get_option ('active_plugins'));

    $plugin_var = 'sitepress-multilingual-cms/sitepress.php';
    if (in_array ($plugin_var, apply_filters ('active_plugins', get_option ('active_plugins')))) {
        echo '
   
    <ul id="" class="btn btn-flat nav navbar-text pull-right">
     <li class="dropdown menu-item">
      <a href="#" class="dropdown-toggle flat-link" data-toggle="dropdown">' . strtoupper (ICL_LANGUAGE_NAME) . '</a>
       <ul class="dropdown-menu">';

        $languages = icl_get_languages ('skip_missing=0&orderby=code');
        if (!empty ($languages)) {
            foreach ($languages as $l) {
                echo ($l['active'] == 0 ? "<li><a href='" . $l['url'] . "'>" .
                    strtoupper ($l['native_name']) .
                    "</a></li>" : NULL);
            }
        }
        echo '
       </ul>
     </li>
    </ul>    
    ';
    }
}
