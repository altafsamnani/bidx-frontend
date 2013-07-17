<?php
/**
* Enqueue scripts and stylesheets
*/
function roots_scripts() {
    wp_enqueue_style('roots_bootstrap',             get_template_directory_uri() . '/assets/css/bootstrap.css', false, null);
    wp_enqueue_style('roots_bootstrap_responsive',  get_template_directory_uri() . '/assets/css/bootstrap-responsive.css', array('roots_bootstrap'), null);
    wp_enqueue_style('flatui',                      get_template_directory_uri() . '/assets/FlatUI/css/flat-ui.css', false, null);
    wp_enqueue_style('main-style',                  get_template_directory_uri() . '/style.css', false, null);

    if (is_single() && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }

    // Do not load the internal jQuery, we do not want it to run in noConflict and we need 1.8.3 because of flatui plugins that have problems with 1.9+
    //
    wp_deregister_script( 'jquery' );
    wp_register_script( 'jquery',                   get_template_directory_uri() . '/assets/js/vendor/jquery-1.8.3.min.js',             false,                  '1.8.3',            true );

    // Load the jquery-ui that comes with FlatUI, just to make sure
    //
    wp_deregister_script( 'jquery-ui' );
    wp_register_script( 'jquery-ui',                get_template_directory_uri() . '/assets/js/vendor/jquery-ui-1.10.3.custom.js',  array( 'jquery' ),      '1.10.3-20130610',  true );

    // Upgrade underscore
    //
    wp_deregister_script( 'underscore' );
    wp_register_script( 'underscore',               get_template_directory_uri() . '/assets/js/vendor/underscore.js',                   false,                  '1.4.4',  true );

    // Upgrade backbone
    //
    wp_deregister_script( 'backbone' );
    wp_register_script( 'backbone',                 get_template_directory_uri() . '/assets/js/vendor/backbone.js',                     array( 'underscore' ),  '1.0.0',  true );

    wp_register_script( 'bootstrap',                get_template_directory_uri() . '/assets/js/vendor/bootstrap.min.js',                array( 'jquery' ),      '2.3.2',            true );

    wp_register_script( 'jquery-ui-touchpunch',     get_template_directory_uri() . '/assets/js/vendor/jquery.ui.touch-punch.js',        array( 'jquery-ui' ),   '0.2.2',            true );
    wp_register_script( 'bootstrap-select',         get_template_directory_uri() . '/assets/js/vendor/bootstrap-select.js',             array( 'bootstrap' ),   '20130610',         true );
    wp_register_script( 'bootstrap-switch',         get_template_directory_uri() . '/assets/js/vendor/bootstrap-switch.js',             array( 'bootstrap' ),   '1.3',              true );

    wp_register_script( 'flatui-checkbox',          get_template_directory_uri() . '/assets/FlatUI/js/flatui-checkbox.js',              array( 'jquery' ),      '0.0.2',            true );
    wp_register_script( 'flatui-radio',             get_template_directory_uri() . '/assets/FlatUI/js/flatui-radio.js',                 array( 'jquery' ),      '0.0.2',            true );
    wp_register_script( 'jquery-tagsinput',         get_template_directory_uri() . '/assets/js/vendor/jquery.tagsinput.js',             array( 'jquery' ),      '1.3.3',            true );
    wp_register_script( 'jquery-placeholder',       get_template_directory_uri() . '/assets/js/vendor/jquery.placeholder.js',           array( 'jquery' ),      '2.0.7',            true );
    wp_register_script( 'jquery-stacktable',        get_template_directory_uri() . '/assets/js/vendor/jquery.stacktable.js',            array( 'jquery' ),      '20130610',         true );


    wp_register_script( 'bidx-flatui',              get_template_directory_uri() . '/assets/js/bidx-flatui.js',                         array( 'jquery' ),      '20130610',         true );

    wp_register_script( 'holder',                   get_template_directory_uri() . '/assets/js/vendor/holder-1.9.js',                   false,                  '1.9',              true );

    wp_register_script( 'base64',                   get_template_directory_uri() . '/assets/js/vendor/base64.js',                       false,                  '20130619',         true );

    wp_register_script( 'noty',                     get_template_directory_uri() . '/assets/noty/jquery.noty.js',                       array( 'jquery' ),      '2.0.3',            true );
    wp_register_script( 'noty-layout-top',          get_template_directory_uri() . '/assets/noty/layouts/top.js',                       array( 'noty' ),        '2.0.3',            true );
    wp_register_script( 'noty-theme-default',       get_template_directory_uri() . '/assets/noty/themes/default.js',                    array( 'noty' ),        '2.0.3',            true );

    // Enqueue the scripts
    //
    wp_enqueue_script( 'jquery' );
    wp_enqueue_script( 'jquery-ui' );

    wp_enqueue_script( 'bootstrap' );
    wp_enqueue_script( 'bootstrap-select' );
    wp_enqueue_script( 'bootstrap-switch' );

    wp_enqueue_script( 'flatui-checkbox' );
    wp_enqueue_script( 'flatui-radio' );

    wp_enqueue_script( 'bidx-flatui' );

    wp_enqueue_script( 'jquery-tagsinput' );
    wp_enqueue_script( 'jquery-placeholder' );
    wp_enqueue_script( 'jquery-stacktable' );

    wp_enqueue_script( 'json2' );

    wp_enqueue_script( 'holder' );
    wp_enqueue_script( 'base64' );

    wp_enqueue_script( 'noty-layout-top' );
    wp_enqueue_script( 'noty-theme-default' );
}
add_action('wp_enqueue_scripts', 'roots_scripts', 100);

// http://wordpress.stackexchange.com/a/12450
function roots_jquery_local_fallback($src, $handle) {
    static $add_jquery_fallback = false;

    if ($add_jquery_fallback) {
        echo '<script>window.jQuery || document.write(\'<script src="' . get_template_directory_uri() . '/assets/js/vendor/jquery-1.9.1.min.js"><\/script>\')</script>' . "\n";
        $add_jquery_fallback = false;
    }

    if ($handle === 'jquery') {
        $add_jquery_fallback = true;
    }

    return $src;
}

function roots_google_analytics() {
?>
    <script>
        var _gaq=[['_setAccount','<?php echo GOOGLE_ANALYTICS_ID; ?>'],['_trackPageview']];
        (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
        g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
        s.parentNode.insertBefore(g,s)}(document,'script'));
    </script>
<?php
}

if (GOOGLE_ANALYTICS_ID) {
    add_action('wp_footer', 'roots_google_analytics', 20);
}
