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
