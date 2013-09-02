<!-- include head tag -->
<?php get_template_part('templates/head'); ?>

<!-- debug class -->
<?php include_once("lib/dBug.php")?>

<body <?php body_class( "bidx" ); ?>>
  <!--[if lt IE 7]><div class="alert">Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</div><![endif]-->
    <div id="wrap"> <!-- sticky footer -->


        <?php

       // $bidCommonObj = new BidxCommon();
        $session = BidxCommon::$staticSession;

      	$authenticated=false;
        if ($session -> authenticated == 'true')
        {
       	    $authenticated=true;
        }


        //do_action('get_header'); //$mattijs: Do we use this??
        // include the header. the authentication check is done within the template
        //
        include( locate_template( 'templates/header.php') );
        //get_template_part('templates/header');

        //  include the content
        //
        include roots_template_path();
        ?>

        <div id="push"></div><!-- push element for sticky header  -->
    </div><!-- sticky footer -->

    <?php
    if($authenticated)
    {
        get_template_part('templates/footer-authenticated');
    }
    else
    {
        get_template_part('templates/footer');
    }
    ?>
<!-- W3TC-include-js-head -->
</body>
</html>
