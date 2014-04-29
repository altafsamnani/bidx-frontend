<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<title>
		<?php if ( is_category() ) {
			echo 'Category Archive for &quot;'; single_cat_title(); echo '&quot; | '; bloginfo( 'name' );
		} elseif ( is_tag() ) {
			echo 'Tag Archive for &quot;'; single_tag_title(); echo '&quot; | '; bloginfo( 'name' );
		} elseif ( is_archive() ) {
			wp_title(''); echo ' Archive | '; bloginfo( 'name' );
		} elseif ( is_search() ) {
			echo 'Search for &quot;'.wp_specialchars($s).'&quot; | '; bloginfo( 'name' );
		} elseif ( is_home() ) {
			bloginfo( 'name' ); echo ' | '; bloginfo( 'description' );
		}  elseif ( is_404() ) {
			echo 'Error 404 Not Found | '; bloginfo( 'name' );
		} elseif ( is_single() ) {
			wp_title('');
		} else {
			bloginfo( 'name' ); echo ' | '; bloginfo( 'description' );
		} ?>
	</title>

	<meta name="description" content="Start, grow and finance your entrepreneurs. Connect them with investors, mentors and business partners." />
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0"/><?php /* Add "maximum-scale=1" to fix the Mobile Safari auto-zoom bug on orientation changes, but keep in mind that it will disable user-zooming completely. Bad for accessibility. */ ?>
	<meta name="keywords" content="entrepreneurs, find investors, find mentors, business plan, grow local business, online entrepreneurial network, finance entrepreneurs, sme finance" />
    <link rel="icon" href="<?php bloginfo('template_url'); ?>/assets/ico/favicon.ico" type="image/x-icon" />
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
	<link rel="alternate" type="application/rss+xml" title="<?php bloginfo( 'name' ); ?>" href="<?php bloginfo( 'rss2_url' ); ?>" />
	<link rel="alternate" type="application/atom+xml" title="<?php bloginfo( 'name' ); ?>" href="<?php bloginfo( 'atom_url' ); ?>" />
    <link href="<?php bloginfo( 'template_url' ); ?>/assets/bootstrap/css/bootstrap.css" rel="stylesheet">
    <!-- Plugins CSS -->
    <link href="<?php bloginfo( 'template_url' ); ?>/assets/UItoTop/css/ui.totop.css" rel="stylesheet">
    <link href="<?php bloginfo( 'template_url' ); ?>/assets/prettyPhoto/css/prettyPhoto.css" rel="stylesheet">
    <!-- REVOLUTION BANNER CSS SETTINGS -->
    <link rel="stylesheet" type="text/css" href="<?php bloginfo( 'template_url' ); ?>/assets/rs-plugin/css/settings.css" media="screen" />
    <!-- Font Awesome  -->
    <link href="<?php bloginfo( 'template_url' ); ?>/assets/font-awesome-4.0.1/css/font-awesome.min.css" rel="stylesheet">
    <!-- Custom Stylesheet For This Template -->
    <link href="<?php bloginfo( 'template_url' ); ?>/assets/sass/stylesheets/screen.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href='//fonts.googleapis.com/css?family=Open+Sans:400,300,300italic,400italic,600,600italic,700,700italic,800,800italic|Montserrat:400,700' rel='stylesheet' type='text/css'>
    <link href='//fonts.googleapis.com/css?family=Alegreya:400italic,700italic,900italic,400,700,900' rel='stylesheet' type='text/css'>
    <link href='//fonts.googleapis.com/css?family=Exo+2:400,100,100italic,200,200italic,300,300italic,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic' rel='stylesheet' type='text/css'>

	<?php wp_enqueue_script("jquery"); /* Loads jQuery if it hasn't been loaded already */ ?>

	<?php /* The HTML5 Shim is required for older browsers, mainly older versions IE */ ?>

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	    <script src="assets/js/respond.min.js"></script>
    <![endif]-->


	<?php wp_head(); ?> <?php /* this is used by many Wordpress features and for plugins to work proporly */ ?>

	<!-- <link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo( 'template_url' ); ?>/theme.css" /> -->
	<!-- <link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo( 'stylesheet_url' ); ?>" /> -->
</head>

<body <?php body_class(); ?>>
<div id="utter-wrapper" class="top-border thick">
	<header id="header" class="header" >
		<nav class="navbar" role="navigation">
			<div class="container">
				<!-- Brand and toggle get grouped for better mobile display -->
				<div class="navbar-header">
					<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
						<span class="sr-only">Toggle navigation</span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>                
                    <a class="navbar-brand" href="/">
                        <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/logo.svg" alt="logo">
                    </a>
                </div>

                <div class="collapse navbar-collapse navbar-ex1-collapse">

                    <span class="hidden-xs"><?php bidx_language_selector();?></span>

                    <a href="/get-started" class="btn btn-flat flat-warning navbar-btn pull-right hidden-xs">Get started</a>

					<?php
						$args = array(
							'theme_location'  => '',
							'menu'            => '',
							'container'       => 'ul',
							'container_class' => '',
							'container_id'    => '',
							'menu_class'      => 'nav navbar-nav',
							'menu_id'         => '',
							'echo'            => true,
							'fallback_cb'     => 'wp_page_menu',
							'before'          => '',
							'after'           => '',
							'link_before'     => '',
							'link_after'      => '',
							'items_wrap'      => '<ul id="%1$s" class="%2$s">%3$s</ul>',
							'depth'           => 3,
							'walker'          => ''
						);


						wp_nav_menu( $args );
					?>

				</div><!--#nav-primary-->

				<?php if ( ! dynamic_sidebar( 'Header' ) ) : ?><!-- Wigitized Header --><?php endif ?>

				<div class="clear"></div>
			</div><!--.container-->
		</nav>
	</header>
