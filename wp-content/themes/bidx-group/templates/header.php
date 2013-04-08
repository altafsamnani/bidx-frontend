<header>
	<div class="container">
		<div class="subheader clearfix">
			<div class="branding">GROUP NAME COMES HERE (when no logo is available)</DIV>
			<div class="account-access">
				<a href="#" class="button primary">Register</a>
				<a href="#" class="button secondary">Login</a>
			</div>
		</div>
	</div>
	<div class="nav-wrapper">
		<div class="container">
			<nav class="clearfix">
				<?php
					if (has_nav_menu('group_dashboard_navigation')) :
						wp_nav_menu(array('theme_location' => 'group_dashboard_navigation', 'menu_class' => 'nav nav-pills pull-right'));
					endif;
				?>
				
			</nav>
		</div>
	</div>
		
	
</header>
