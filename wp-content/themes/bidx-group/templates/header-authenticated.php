<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner">
		<div class="container">

			<div class="clearfix">
				<div class="brand">
					<a href="<?php echo home_url(); ?>/"><img src="http://placehold.it/200x100" class="logo img-rounded"></a>

					<h1>GroupNameX</h1>
				</div>

				<div class="pull-right">
					<div class="topNav clearfix">
						<form class="navbar-search" method="post" action="/search">
				    		<input type="text" class="search-query" placeholder="Search">
				    		<button type="submit" class="btn"><i class="icon-search"></i></button>
				    	</form>
				    	<ul class="memberInfo pull-right nav nav-pills">
							<li class="dropdown dropdown-hover">
					    		<a href="#" class="dropdown-toggle" data-toggle="dropdown">My profile</a>
					    		<ul class="dropdown-menu">
									<li><a href="/member">Profile</a></li>
									<li><a href="<?php echo wp_logout_url('/'); ?>">Logout</a></li>
					    		</ul>
					    	</li>
				    	</ul>
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
