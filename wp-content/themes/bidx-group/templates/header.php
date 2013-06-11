<header class="banner navbar navbar-fixed-top" role="banner">
	<div class="navbar">
		<div class="navbar-inner">
			<div class="container">
				<div class="row-fluid">
					<div class="pull-left">
						<?php echo do_shortcode( '[bidx app="group" view="group-header"]' );?>
					</div>
					<div class="pull-right">
						<div class="iconbar iconbar-horizontal iconbar-info">
						
			            <ul>
			              <li data-toggle="collapse" data-target="#nav-collapse-01">
				              <button type="button" class="btn btn-navbar" 
								data-toggle="collapse" data-target="#nav-collapse-01"></button>
			              </li>
			              <li><a href="/member" class="fui-user"></a></li>
			              <li>
			              	<a href="/inbox" class="fui-mail">
			              		<!-- If messages are available -->
			              		<span class="iconbar-unread">1</span>
			              	</a>
			              </li>
			              <li><a href="/admin" class="fui-cmd"></a></li>
			              <li><a href="/settings" class="fui-gear"></a></li>
			            </ul>
			          </div>
					</div>
				</div>
				<div class="row-fluid">		
					<div class="nav-collapse collapse" id="nav-collapse-01">
						<nav class="nav-main mainNav" role="navigation">
							<?php
								if (has_nav_menu('group_dashboard_navigation')) :
									wp_nav_menu(array('theme_location' => 'group_dashboard_navigation', 'menu_class' => 'nav'));
								endif;
							?>
						</nav>
						<!-- /nav -->
					</div>
				
					<div class="pull-right">
			          <?php get_template_part('templates/searchform'); ?> 
		        	</div>
        		</div>
			</div>
		</div>
	</div>
</header>


