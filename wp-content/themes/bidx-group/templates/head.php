<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 9]>         <html class="no-js lt-ie10 lt-ie9" <?php language_attributes(); ?>> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js modern-browser"  <?php language_attributes(); ?>> <!--<![endif]-->
<head>
    <meta charset="utf-8">
    <title><?php bloginfo('name'); ?> : <?php wp_title(); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    
    <!-- include wordpress head  -->
    <?php wp_head(); ?>
<?php
    // Get the fonts
    $textfont = get_option( 'text_font' );
    $headingsfont = get_option( 'headings_font' );
    $menufont = get_option( 'menu_font' );
?>
    <link href='//fonts.googleapis.com/css?family=<?php echo $textfont; ?>:400,100,100italic,200,200italic,300,300italic,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic' rel='stylesheet' type='text/css'>
    <link href='//fonts.googleapis.com/css?family=<?php echo $headingsfont; ?>:400,100,100italic,200,200italic,300,300italic,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic' rel='stylesheet' type='text/css'>
    <link href='//fonts.googleapis.com/css?family=<?php echo $menufont; ?>:400,100,100italic,200,200italic,300,300italic,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic' rel='stylesheet' type='text/css'>
    <link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">
    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="/<?php echo THEME_PATH; ?>/assets/js/vendor/html5shiv.js"></script>
    <![endif]-->

 <!-- Google Analytics -->
<script>
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-48404092-2', 'auto');
ga('send', 'pageview');
<?php
	$analytics = explode( ',' , get_theme_mod( 'analytics_codes' ) );
	foreach ( $analytics as $key ) {
		//add check if not empty
		$tracker = trim($key) ;
		$tracker_name = str_replace( "-", "", $tracker );
		if ( !empty ( $tracker ) ) {
?>ga('create', '<?php echo $tracker ?>' , 'auto', {'name': '<?php echo $tracker_name ?>'});
ga('<?php echo $tracker_name ?>.send', 'pageview');
<?php
		}
	}
?>
</script>
</head>

