<?php
/* Default Theme Variables */
if ( !defined( 'BIDX_LOGO_ALIGNMENT' ) ) {
  define( 'BIDX_LOGO_ALIGNMENT', 'left' );
}
if ( !defined( 'BIDX_SIDEBAR_ALIGNMENT' ) ) {
  define( 'BIDX_SIDEBAR_ALIGNMENT', 'right' );
}
if ( !defined( 'BIDX_TEXT_FONT') ) {
  define( 'BIDX_TEXT_FONT', 'Lato' );
}
if ( !defined( 'BIDX_HEADINGS_FONT') ) {
  define( 'BIDX_HEADINGS_FONT', 'Lato' );
}
if ( !defined( 'BIDX_MENU_FONT') ) {
  define( 'BIDX_MENU_FONT', 'Lato' );
}



/**
 * Show an admin notice if .htaccess isn't writable
 */
function roots_htaccess_writable() {
  if (!is_writable(get_home_path() . '.htaccess')) {
    if (current_user_can('administrator')) {
      add_action('admin_notices', create_function('', "echo '<div class=\"error\"><p>" . sprintf(__('Please make sure your <a href="%s">.htaccess</a> file is writable ', 'roots'), admin_url('options-permalink.php')) . "</p></div>';"));
    }
  }
}
add_action('admin_init', 'roots_htaccess_writable');

/**
 * Return WordPress subdirectory if applicable
 */
function wp_base_dir() {
  preg_match('!(https?://[^/|"]+)([^"]+)?!', site_url(), $matches);
  if (count($matches) === 3) {
    return end($matches);
  } else {
    return '';
  }
}

/**
 * Opposite of built in WP functions for trailing slashes
 */
function leadingslashit($string) {
  return '/' . unleadingslashit($string);
}

function unleadingslashit($string) {
  return ltrim($string, '/');
}

function add_filters($tags, $function) {
  foreach($tags as $tag) {
    add_filter($tag, $function);
  }
}

function is_element_empty($element) {
  $element = trim($element);
  return empty($element) ? false : true;
}

# Correct SSL Bug
function correct_url_ssl($url)
{
  if( function_exists('is_ssl') && is_ssl() )
  {
    return str_replace('http://', 'https://', $url);
  }
  return $url;
}
add_filter('wp_get_attachment_url', 'correct_url_ssl');
