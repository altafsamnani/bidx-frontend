<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner bidx-theme-colour-panel-one">
		<div class="container">
			<div class="row-fluid">
				<div class="span4">
					<?php echo do_shortcode( '[bidx app="group" view="group-header"]' );?>
				</div>
<!--                 <div class="pull-left span2">
					<?php //do_action('icl_language_selector'); ?>
				</div> -->

				<div class="span8 bidx-autoHeight">
					<div class="row-fluid">



					<?php
					if( $authenticated )
					{
					?>

						<div class="search span12">
				     	<?php get_template_part('templates/searchform'); ?>
			        	</div>
			        	<div class="menu-top">
							<?php echo do_shortcode( '[bidx app="group" view="navbar"]' );?>
						</div>
					<?php
					}
					else
					{
					?>

						<div class="pull-right span4">
							<div class="row-fluid">
								<div class="span6">
									<a href="/auth/#auth/register" class="btn btn-primary btn-block bidx-theme-colour-two"><?php _e('Register','bidxtheme');?></a>
								</div>
								<div class="span6">
									<a href="/auth/#auth/login" class="btn btn-primary btn-block bidx-theme-colour-one"><i class="fui-login"></i><?php _e('Login','bidxtheme');?></a>
								</div>

							</div>
						</div>
					<?php
					}
					?>
					</div>
					<div class="row-fluid">
						<div class="span12">
							<nav class="nav-collapse collapse" id="nav-collapse-main">
								<?php
									if (has_nav_menu('group_dashboard_navigation')) :
										wp_nav_menu(array('theme_location' => 'primary_navigation', 'menu_class' => 'nav'));
									endif;
								?>
							</nav>
						</div>
					</div>

				</div>





<!-- 				<div class="pull-right">
			     	<?php// get_template_part('templates/searchform'); ?>
		        </div> -->
			</div>
		</div>
	</div>
</header>

