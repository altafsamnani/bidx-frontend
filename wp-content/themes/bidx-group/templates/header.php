<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner">
		<div class="container">

			<div class="clearfix">
				<div class="brand">
					<a href="<?php echo home_url(); ?>/"><img data-src="holder.js/100x100/industrial/auto/text:No Image" class="logo img-rounded"></a>

					<h1>GroupNameX</h1>
				</div>

				<div class="pull-right">
					<div class="topNav clearfix">
						<form class="navbar-search" method="post" action="/search">
				    		<input type="text" class="search-query" placeholder="Search">
				    		<button type="submit" class="btn"><i class="icon-search"></i></button>
				    	</form>
					</div>
				</div>
			</div>

			<nav class="nav-main mainNav" role="navigation">
				<?php
					if (has_nav_menu('group_dashboard_navigation')) :
						wp_nav_menu(array('theme_location' => 'group_dashboard_navigation', 'menu_class' => 'nav nav-pills'));
					endif;
				?>
			</nav>

		</div>
	</div>
</header>
