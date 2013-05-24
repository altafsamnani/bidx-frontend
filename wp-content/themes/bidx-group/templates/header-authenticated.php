<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner">
		<div class="container">

			<div class="clearfix">

			<?php echo do_shortcode( '[bidx app="group" view="groupHeader"]' );?>		

				<div class="pull-right">
					<div class="topNav clearfix">
						<form class="navbar-search" method="post" action="/search">
				    		<input type="text" name="q" class="search-query" placeholder="Search">
				    		<button type="submit" class="btn"><i class="icon-search"></i></button>
				    	</form>
				    	<?php echo do_shortcode( '[bidx app="group" view="profileDropDown"]' );?>
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

			<div class="settings dropdown dropdown-hover pull-right">
				<a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-bidxcog"></i></a>
	    		<ul class="dropdown-menu">
					<li><a href="/leave">Leave this group</a></li>
	    		</ul>
			</div>
		</div>
	</div>
</header>
