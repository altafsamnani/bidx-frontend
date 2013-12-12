<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9" <?php language_attributes(); ?>> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"  <?php language_attributes(); ?>> <!--<![endif]-->
<head>
	<meta charset="utf-8">
	<title><?php bloginfo('name'); ?> : <?php wp_title(); ?></title>
  	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<!-- include wordpress head  -->
	<?php wp_head(); ?>
    <link href='//fonts.googleapis.com/css?family=Lato:400,700' rel='stylesheet' type='text/css'>
    <link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">
	<!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
	<!--[if lt IE 9]>
	  <script src="/<?php echo THEME_PATH; ?>/assets/js/vendor/html5shiv.js"></script>
	<![endif]-->

<?php
		// add custom group_styles comming from the theme customizer
		if ( get_theme_mod( 'group_styles' ) ) {
			echo "<style>";
			echo get_theme_mod( 'group_styles' );
			echo "</style>";
		}
 ?>
	<script type="text/javascript">

	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', 'UA-619772-9']);
	  _gaq.push(['_trackPageview']);

	  (function() {
	    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();

	</script>

</head>

