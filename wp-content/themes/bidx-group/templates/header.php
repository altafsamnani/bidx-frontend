<?php
    $registration=preg_match( '/^\/registration/', $_SERVER[ 'REQUEST_URI' ] );
?>

<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner">
		<div class="container">

			<div class="clearfix">
				<?php echo do_shortcode( '[bidx app="group" view="groupHeader"]' );?>

<?php if ( !$registration ): ?>
				<div class="pull-right">
					<div class="topNav clearfix">
						<form class="navbar-search" method="post" action="/search">
				    		<input type="text" class="search-query" placeholder="Search">
				    		<button type="submit" class="btn"><i class="icon-search"></i></button>
				    	</form>
					</div>
				</div>
<?php endif; ?>
			</div>

<?php if ( !$registration ): ?>
			<nav class="nav-main mainNav" role="navigation">
				<?php
					if (has_nav_menu('group_dashboard_navigation')) :
						wp_nav_menu(array('theme_location' => 'group_dashboard_navigation', 'menu_class' => 'nav nav-pills'));
					endif;
				?>
			</nav>
<?php endif; ?>

		</div>
	</div>
</header>
