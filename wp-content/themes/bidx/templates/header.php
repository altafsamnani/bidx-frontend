
<header>
	<div class="container">
		<!-- Main Nav to go here -->
		<div class="navbar">
			<div class="navbar-inner-bidX">

				<!-- logo -->
				<a class="logo sprite" href="<?php echo home_url(); ?>/"></a>

				</div>
				<nav class="nav-collapse collapse clearfix">
					<?php
					if (has_nav_menu('primary_navigation')) :
						wp_nav_menu(array('theme_location' => 'primary_navigation', 'menu_class' => 'nav menu'));
					endif;
					?>
				</nav>
			</div>
		</div>

</header>

