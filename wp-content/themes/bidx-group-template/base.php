<!-- include head tag -->
<?php get_template_part('templates/head'); ?>

<!-- debug class -->
<?php include_once("lib/dBug.php")?>
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
  <!--[if lt IE 7]><div class="alert">Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</div><![endif]-->
    <div id="wrap"> <!-- sticky footer -->
        <div class="inner-wrap">

<?php

        //do_action('get_header'); //$mattijs: Do we use this??
        // include the header. the authentication check is done within the template
        //
        include( locate_template( 'templates/header.php') );
        //get_template_part('templates/header');

        //  include the content
        //
        include roots_template_path();
        ?>
        </div>
        <div id="push"></div><!-- push element for sticky header  -->
    </div><!-- sticky footer -->

<?php
    get_template_part('templates/footer');
?>
<!-- W3TC-include-js-head -->
</body>
</html>
