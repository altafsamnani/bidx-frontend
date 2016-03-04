<?php
    $session = BidxCommon::$staticSession;

    $authClass = "not-auth";
    $authenticated = false;

    if ( isset( $session->authenticated ) && $session->authenticated == 'true' ) {
        $authenticated = true;
        $authClass = "auth";
    }

    $pagewidth = '';
    $option_page_width_sel  =   get_option( 'page_width_selector' );
    $option_page_width_sel  =   ( $option_page_width_sel )  ? $option_page_width_sel : BIDX_PAGE_WIDTH_SELECTOR;

    if ( $option_page_width_sel === '1040' )
    {
        $pagewidth = ' width-medium';
    }
    if ( $option_page_width_sel === '940' )
    {
        $pagewidth = ' width-small';
    }

    if ( get_option( 'brand-background-color-image' ) )
    {
        // $addbgimage = 'style="background-image:url('. $bgimage .'); background-size: cover; background-position: center center; background-attachment:fixed; "';
        $option_brand_full_pattern  =   get_option( 'brand-full-pattern' );
        $option_brand_full_pattern  =   ( $option_brand_full_pattern )  ? $option_brand_full_pattern : BIDX_BRAND_FULL_PATTERN;

        if ( $option_brand_full_pattern === 'full' )
        {
            $custombg = ' bg-full';
        }
        else
        {
            $custombg = ' bg-pattern';
        }
    }
    else
    {
        $custombg = '';
    }
?>

<?php
// include head tag
    get_template_part('templates/head');
?>

<body <?php body_class( "bidx " . $authClass . $pagewidth . $custombg );  ?> >

<!--[if lt IE 8]>
<div class="alert alert-warning">
<?php _e('You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.', 'roots'); ?>
</div>
<![endif]-->

<?php if( true ||  !$session->external )
    {
        get_template_part('templates/header');
    }
?>

<?php if ( is_front_page() || $post->post_type === 'bidx' ) { ?>
    <?php include roots_template_path(); ?>
<?php } else { ?>
    <main class="main" role="main">
        <div class="container">
            <div class="row">
                <div class="<?php echo roots_main_class(); ?>">
                    <?php include roots_template_path(); ?>
                </div>

                <?php if (roots_display_sidebar()) : ?>
                    <aside class="sidebar <?php echo roots_sidebar_class(); ?>" role="complementary">
                        <div class="region-side">
                            <?php include roots_sidebar_path(); ?>
                        </div>
                    </aside><!-- /.sidebar -->
                <?php endif; ?>
            </div>
        </div>
    </main><!-- /.main -->

<?php } ?>

<?php if( true || !$session->external )
    {
        get_template_part('templates/footer');
    }
?>

</body>
</html>
