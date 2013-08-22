<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner">
		<div class="container">
			<div class="row-fluid">
				<div class="pull-left span6">
					<?php echo do_shortcode( '[bidx app="group" view="group-header"]' );?>
				</div>
                <div class="pull-left span2">
					<?php //do_action('icl_language_selector'); ?>
				</div>
				<div class="pull-right span2">
					<a href="/auth/#auth/login" class="btn btn-primary btn-block"><?php _e('Login','bidxtheme');?></a>
				</div>
				<div class="pull-right span2">
					<a href="/auth/#auth/register" class="btn btn-primary btn-block"><?php _e('Register','bidxtheme');?></a>
				</div>
			</div>
			<div>
				<nav class="nav-main mainNav" role="navigation">
					<?php
						if (has_nav_menu('group_dashboard_navigation')) :
							wp_nav_menu(array('theme_location' => 'group_dashboard_navigation', 'menu_class' => 'nav'));
						endif;
					?>
				</nav>
				<div class="pull-right">
			     	<?php get_template_part('templates/searchform'); ?>
		        </div>
			</div>
		</div>
	</div>
</header>

