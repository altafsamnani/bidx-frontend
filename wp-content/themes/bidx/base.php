<?php get_template_part('templates/head'); ?>
<?php include_once("lib/dBug.php")?>
<body <?php body_class(); ?>>
<div id="wrap"> <!-- sticky footer -->
  <!--[if lt IE 7]><div class="alert">Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</div><![endif]-->

  <?php
    do_action('get_header');
    get_template_part('templates/header');

  ?>

  <?php include roots_template_path(); ?><!-- includes page -->
      <div id="push"></div>
</div><!-- sticky footer -->
  <?php get_template_part('templates/footer'); ?>  
  
  
</body>
</html>
