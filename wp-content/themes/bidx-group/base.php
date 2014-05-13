
<?php
    // include head tag
    get_template_part('templates/head');
?>


<?php
    // $bidCommonObj = new BidxCommon();
    $session = BidxCommon::$staticSession;

    $authClass = "not-auth";
    $authenticated = false;

    if ($session->authenticated == 'true' ) {
        $authenticated = true;
        $authClass = "auth";
    }
?>
<body <?php body_class( "bidx " . $authClass ); ?>>

  <!--[if lt IE 8]>
    <div class="alert alert-warning">
      <?php _e('You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.', 'roots'); ?>
    </div>
  <![endif]-->

  <?php get_template_part('templates/header'); ?>

  <main class="main <?php // echo roots_main_class(); ?>" role="main">  
<?php
    // include the carousel ( id=groupCarousel )
    require_once "wp-content/plugins/bidx-plugin/apps/group/templates/inc/inc_carousel.phtml";
?>
          <?php include roots_template_path(); ?>
        <?php if (roots_display_sidebar()) : ?>
          <aside class="sidebar <?php echo roots_sidebar_class(); ?>" role="complementary">
            <?php include roots_sidebar_path(); ?>
          </aside><!-- /.sidebar -->
        <?php endif; ?>
  </main><!-- /.main -->

  <?php get_template_part('templates/footer'); ?>

</body>
</html>
