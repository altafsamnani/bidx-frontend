<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner">
		<div class="container">
			<div>
				<?php echo do_shortcode( '[bidx app="group" view="group-header"]' );?>
			</div>
			<div class="menu-top">
				<?php echo do_shortcode( '[bidx app="group" view="navbar"]' );?>
			</div>

			<nav class="nav-collapse collapse" id="nav-collapse-main">
				<?php
					if (has_nav_menu('group_dashboard_navigation')) :
						wp_nav_menu(array('theme_location' => 'group_dashboard_navigation', 'menu_class' => 'nav'));
					endif;
				?>
			</nav>
			<div class="search">
		     	<?php get_template_part('templates/searchform'); ?>
	        </div>
		</div>
	</div>
</header>


