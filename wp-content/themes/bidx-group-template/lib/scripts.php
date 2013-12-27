<?php
/**
* Enqueue scripts and stylesheets
*/
function roots_scripts() {
    wp_enqueue_style('bootstrap',                   get_template_directory_uri() . '/assets/css/bootstrap.css', false, null);
    wp_enqueue_style('bootstrap-datepicker',        get_template_directory_uri() . '/../../plugins/bidx-plugin/static/vendor/bootstrap-datepicker-1.3.0-rc.2/css/datepicker3.css', false, null);
    //wp_enqueue_style('main-style',                  get_template_directory_uri() . '/style.css', false, null);
    wp_enqueue_style('bidx-plugin',                 get_template_directory_uri() . '/../../plugins/bidx-plugin/static/css/bidx-plugin.css', false, null);


    if (is_single() && comments_open() && get_option('thread_comments')) {
        wp_enqueue_script('comment-reply');
    }

    wp_register_script( 'bootstrap',                get_template_directory_uri() . '/assets/js/bootstrap.min.js',                       array( 'jquery' ),      '3.0.2',            true );

    wp_register_script( 'bidx-checkbox',            get_template_directory_uri() . '/assets/js/bidx-checkbox.js',                       array( 'jquery' ),      '0.0.2',            true );
    wp_register_script( 'bidx-radio',               get_template_directory_uri() . '/assets/js/bidx-radio.js',                          array( 'jquery' ),      '0.0.2',            true );
    wp_register_script( 'jquery-tagsinput',         get_template_directory_uri() . '/assets/js/vendor/jquery.tagsinput.js',             array( 'jquery' ),      '1.3.3',            true );
    wp_register_script( 'jquery-placeholder',       get_template_directory_uri() . '/assets/js/vendor/jquery.placeholder.js',           array( 'jquery' ),      '2.0.7',            true );
    wp_register_script( 'jquery-stacktable',        get_template_directory_uri() . '/assets/js/vendor/jquery.stacktable.js',            array( 'jquery' ),      '20130610',         true );

    wp_register_script( 'holder',                   get_template_directory_uri() . '/assets/js/vendor/holder-1.9.js',                   false,                  '1.9',              true );

    wp_register_script( 'base64',                   get_template_directory_uri() . '/assets/js/vendor/base64.js',                       false,                  '20130619',         true );

    wp_register_script( 'noty',                     get_template_directory_uri() . '/assets/noty/jquery.noty.js',                       array( 'jquery' ),      '2.0.3',            true );
    wp_register_script( 'noty-layout-top',          get_template_directory_uri() . '/assets/noty/layouts/top.js',                       array( 'noty' ),        '2.0.3',            true );
    wp_register_script( 'noty-layout-center',       get_template_directory_uri() . '/assets/noty/layouts/center.js',                    array( 'noty' ),        '2.0.3',            true );
    wp_register_script( 'noty-theme-default',       get_template_directory_uri() . '/assets/noty/themes/default.js',                    array( 'noty' ),        '2.0.3',            true );

    // Enqueue the scripts
    //
    wp_enqueue_script( 'jquery' );
    wp_enqueue_script( 'jquery-ui-widget' );

    wp_enqueue_script( 'jquery-touch-punch' );

    wp_enqueue_script( 'bootstrap' );
    wp_enqueue_script( 'bootstrap-select' );

    wp_enqueue_script( 'bidx-checkbox' );
    wp_enqueue_script( 'bidx-radio' );

    wp_enqueue_script( 'jquery-tagsinput' );
    wp_enqueue_script( 'jquery-placeholder' );
    wp_enqueue_script( 'jquery-stacktable' );

    wp_enqueue_script( 'json2' );

    wp_enqueue_script( 'holder' );
    wp_enqueue_script( 'base64' );

    wp_enqueue_script( 'noty-layout-top' );
    wp_enqueue_script( 'noty-layout-center' );
    wp_enqueue_script( 'noty-theme-default' );

    // Temporary override
    //
    // wp_register_script( 'bootstrap-collapse',       get_template_directory_uri() . '/assets/js/vendor/bootstrap-collapse.js',           array( 'bootstrap' ),      '2.3.2',            true );
    // wp_enqueue_script( 'bootstrap-collapse' );

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
