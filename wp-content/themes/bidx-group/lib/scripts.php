<?php
/**
 * Enqueue scripts and stylesheets
 *
 * Enqueue stylesheets in the following order:
 * 1. /theme/assets/css/main.min.css
 *
 * Enqueue scripts in the following order:
 * 1. jquery-1.11.0.min.js via Google CDN
 * 2. /theme/assets/js/vendor/modernizr-2.7.0.min.js
 * 3. /theme/assets/js/main.min.js (in footer)
 */
function roots_scripts() {
  // wp_enqueue_style('bootstrap',                   get_template_directory_uri() . '/assets/css/bootstrap.css', false, null);
  wp_enqueue_style('bootstrap-datepicker',        get_template_directory_uri() . '/../../plugins/bidx-plugin/static/vendor/bootstrap-datepicker-1.3.0-rc.2/css/datepicker3.css', false, null);
  // wp_enqueue_style('bidx-plugin',                 get_template_directory_uri() . '/../../plugins/bidx-plugin/static/css/bidx-plugin.css', false, null);

  if( is_page_template('page-cbi.php') ) {
    wp_enqueue_style('cbi',                     get_template_directory_uri() . '/../../plugins/bidx-plugin/static/css/cbi.css', false, null);
  }

  wp_register_script( 'bootstrap',                get_template_directory_uri() . '/assets/js/bootstrap.min.js',                       array( 'jquery' ),      '3.0.2',            true );

  wp_register_script( 'bidx-checkbox',            get_template_directory_uri() . '/assets/js/bidx-checkbox.js',                       array( 'jquery' ),      '0.0.2',            true );
  wp_register_script( 'bidx-radio',               get_template_directory_uri() . '/assets/js/bidx-radio.js',                          array( 'jquery' ),      '0.0.2',            true );
  wp_register_script( 'jquery-tagsinput',         get_template_directory_uri() . '/assets/js/vendor/jquery.tagsinput.js',             array( 'jquery' ),      '1.3.3',            true );
  wp_register_script( 'jquery-placeholder',       get_template_directory_uri() . '/assets/js/vendor/jquery.placeholder.js',           array( 'jquery' ),      '2.0.7',            true );
  wp_register_script( 'jquery-stacktable',        get_template_directory_uri() . '/assets/js/vendor/jquery.stacktable.js',            array( 'jquery' ),      '20130610',         true );

  wp_register_script( 'base64',                   get_template_directory_uri() . '/assets/js/vendor/base64.js',                       false,                  '20130619',         true );

  wp_register_script( 'noty',                     get_template_directory_uri() . '/assets/noty/jquery.noty.js',                       array( 'jquery' ),      '2.0.3',            true );
  wp_register_script( 'noty-layout-top',          get_template_directory_uri() . '/assets/noty/layouts/top.js',                       array( 'noty' ),        '2.0.3',            true );
  wp_register_script( 'noty-layout-center',       get_template_directory_uri() . '/assets/noty/layouts/center.js',                    array( 'noty' ),        '2.0.3',            true );
  wp_register_script( 'noty-theme-default',       get_template_directory_uri() . '/assets/noty/themes/default.js',                    array( 'noty' ),        '2.0.3',            true );



  // jQuery is loaded using the same method from HTML5 Boilerplate:
  // Grab Google CDN's latest jQuery with a protocol relative URL; fallback to local if offline
  // It's kept in the header instead of footer to avoid conflicts with plugins.
  if (!is_admin() && current_theme_supports('jquery-cdn')) {
    wp_deregister_script('jquery');
    wp_register_script('jquery', '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js', array(), null, false);
    add_filter('script_loader_src', 'roots_jquery_local_fallback', 10, 2);
  }

  if (is_single() && comments_open() && get_option('thread_comments')) {
  wp_enqueue_script('comment-reply');
  }

  wp_register_script('modernizr', get_template_directory_uri() . '/assets/js/vendor/modernizr-2.7.0.min.js', array(), null, false);
  // wp_register_script('roots_scripts', get_template_directory_uri() . '/assets/js/scripts.min.js', array(), '0fc6af96786d8f267c8686338a34cd38', true);
  
  wp_enqueue_script( 'jquery-ui-widget' );
  wp_enqueue_script( 'jquery-touch-punch' );
  wp_enqueue_script( 'bootstrap' );
  wp_enqueue_script( 'bidx-checkbox' );
  wp_enqueue_script( 'bidx-radio' );
  wp_enqueue_script( 'jquery-tagsinput' );
  wp_enqueue_script( 'jquery-placeholder' );
  wp_enqueue_script( 'jquery-stacktable' );
  wp_enqueue_script( 'json2' );
  wp_enqueue_script( 'base64' );
  wp_enqueue_script( 'noty-layout-top' );
  wp_enqueue_script( 'noty-layout-center' );
  wp_enqueue_script( 'noty-theme-default' );
  wp_enqueue_script( 'modernizr' );
  wp_enqueue_script( 'jquery' );
  wp_enqueue_script( 'roots_scripts' );
}
add_action('wp_enqueue_scripts', 'roots_scripts', 100);

// http://wordpress.stackexchange.com/a/12450
function roots_jquery_local_fallback($src, $handle = null) {
  static $add_jquery_fallback = false;

  if ($add_jquery_fallback) {
  echo '<script>window.jQuery || document.write(\'<script src="' . get_template_directory_uri() . '/assets/js/vendor/jquery-1.11.0.min.js"><\/script>\')</script>' . "\n";
  $add_jquery_fallback = false;
  }

  if ($handle === 'jquery') {
  $add_jquery_fallback = true;
  }

  return $src;
}
add_action('wp_head', 'roots_jquery_local_fallback');

/**
 * Adds the Google Analytics code
 * 
 * TODO configure this to add the customizer set UA fields
 */
function roots_google_analytics() { ?>
<script>
  (function(b,o,i,l,e,r){b.GoogleAnalyticsObject=l;b[l]||(b[l]=
  function(){(b[l].q=b[l].q||[]).push(arguments)});b[l].l=+new Date;
  e=o.createElement(i);r=o.getElementsByTagName(i)[0];
  e.src='//www.google-analytics.com/analytics.js';
  r.parentNode.insertBefore(e,r)}(window,document,'script','ga'));
  ga('create','<?php echo GOOGLE_ANALYTICS_ID; ?>');ga('send','pageview');
</script>

<?php }
if (GOOGLE_ANALYTICS_ID && !current_user_can('manage_options')) {
  add_action('wp_footer', 'roots_google_analytics', 20);
}
