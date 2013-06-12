<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner">
		<div class="container">
			<div class="row-fluid">
				<div class="pull-left span6">
					<?php echo do_shortcode( '[bidx app="group" view="group-header"]' );?>
				</div>
				<div class="pull-right span6">
					<?php echo do_shortcode( '[bidx app="group" view="navbar"]' );?>
				</div>
			</div>
			<div class="row-fluid">
				<nav class="nav-main mainNav" role="navigation">
					<?php
						if (has_nav_menu('group_dashboard_navigation')) :
							wp_nav_menu(array('theme_location' => 'group_dashboard_navigation', 'menu_class' => 'nav nav-pills'));
						endif;
					?>
				</nav>
				<div class="pull-right mainNav">
			     	<?php get_template_part('templates/searchform'); ?> 
		        </div>
			</div>
		</div>
	</div>
</header>
