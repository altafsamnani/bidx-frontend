<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9" <?php language_attributes(); ?>> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js  <?php if (isset($_GET['chris'])) {
echo "chris";} ?>" <?php language_attributes(); ?>    > <!--<![endif]-->
<head>
	<meta charset="utf-8">
	<title><?php wp_title(''); ?></title>
  	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<?php wp_head(); ?>


	<link href='//fonts.googleapis.com/css?family=Open+Sans:400italic,400,600,700' rel='stylesheet' type='text/css'>

	<!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
	<!--[if lt IE 9]>
	  <script src="/<?php echo THEME_PATH; ?>/assets/js/vendor/html5shiv.js"></script>
	<![endif]-->
	<?php /*<link rel="alternate" type="application/rss+xml" title="<?php echo get_bloginfo('name'); ?> Feed" href="<?php echo home_url(); ?>/feed/">*/?>
	<script type="text/javascript">
		window.q = []; //funtion queue
		//function collector (into queue)
		window.$ = function(f) {
		q.push(f);
		}
	</script>
</head>
