<style>
	.dropdown-hover:hover > ul.dropdown-menu{
	    display: 					block;
	}

	header .brand a {
		margin-right: 				10px;
	}

	header .brand h1 {
		font-size: 					30px;
		display: 					inline;
	}
</style>

<header class="banner navbar navbar-static-top" role="banner">
  	<div class="navbar-inner">
		<div class="container">

			<div class="brand">
				<a href="<?php echo home_url(); ?>/"><img src="http://placehold.it/200x100" class="img-rounded"></a>

				<h1>GroupNameX</h1>
			</div>

			<div class="pull-right">
				<div>
					<form class="navbar-search">
			    		<input type="text" class="search-query" placeholder="Search">
			    	</form>
			    	<div class="memberInfo dropdown dropdown-hover pull-right">
			    		<a href="#" class="dropdown-toggle" data-toggle="dropdown">My profile</a>
			    		<ul class="dropdown-menu">
							<li><a href="#">Inbox</a></li>
							<li><a href="#">Profile</a></li>
							<li><a href="#">Contacts</a></li>
							<li><a href="#">Account</a></li>
							<li><a href="#">Logout</a></li>
			    		</ul>
			    	</div>
				</div>

				<nav class="nav-main pull-right" role="navigation">
					<ul class="nav nav-pills">
						<li class="active"><a href="#">Home</a></li>
						<li class="dropdown dropdown-hover">
							<a class="dropdown-toggle" data-toggle="dropdown" href="#">Groups</a>
							<ul class="dropdown-menu">
								<li><a href="#">Create groups</a></li>
								<li><a href="#">Find groups</a></li>
								<li><a href="#">Leave this group</a></li>
								<li><a href="#">Contact group admin</a></li>
							</ul>
						</li>
						<li class="dropdown dropdown-hover">
							<a class="dropdown-toggle" data-toggle="dropdown" href="#">Create and grow</a>
							<ul class="dropdown-menu">
								<li><a href="#">Create a group</a></li>
								<li><a href="#">Present a business</a></li>
								<li><a href="#">Start investing</a></li>
							</ul>
						</li>
					</ul>
					<?php
						if (has_nav_menu('group_dashboard_navigation')) :
							wp_nav_menu(array('theme_location' => 'group_dashboard_navigation', 'menu_class' => 'nav nav-pills'));
						endif;
					?>
				</nav>
			</div>

		</div>
	</div>
</header>
