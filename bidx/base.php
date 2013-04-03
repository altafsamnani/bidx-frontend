<?php get_template_part('templates/head'); ?>
<?php include_once("lib/dBug.php")?>
<body <?php body_class(); ?>>

  <!--[if lt IE 7]><div class="alert">Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</div><![endif]-->

  <?php
    do_action('get_header');
    //if user logged in  
    if(isset($_GET['loggedin'])) {
      get_template_part('templates/header-group-dashboard');

    }
  // Use Bootstrap's navbar if enabled in config.php
    else if (current_theme_supports('bootstrap-top-navbar')) {
      get_template_part('templates/header-anonymous');
    }

  ?>

  <?php include roots_template_path(); 
    //if user logged in  
    if(isset($_GET['loggedin'])) {
      get_template_part('templates/footer-group-dashboard');
    } 
    else {
      get_template_part('templates/footer-anonymous');
    }
 ?>  
  
</body>
</html>
