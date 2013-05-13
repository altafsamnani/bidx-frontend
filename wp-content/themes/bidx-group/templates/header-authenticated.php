<style>
	.dropdown-hover:hover > ul.dropdown-menu{
	    display: 					block;
	}

	body {
		padding-top: 				120px;
	}

	header.banner .navbar-inner {
		min-height: 				120px;
		height: 					120px;
	}

	header.banner .brand a {
		margin-right: 				10px;
	}

	header.banner .brand img {
		max-height: 				100px;
	}

	header.banner .brand h1 {
		font-size: 					30px;
		display: 					inline;
	}

	header.banner .topNav {
		margin-top: 				20px;
	}

	header.banner .mainNav {
		margin-top: 				20px;
	}

	header.banner .navbar-search {
		margin-top: 				8px;
		margin-right: 				12px;
	}

	header.banner .nav.pull-right {
		margin-right: 				10px;
	}

	header.banner .navbar-search select {
		width: 						auto;
		height: 					20px;
		font-size: 					13px;
		margin-bottom: 				0;
	}

	header.banner .navbar-search button {
		height: 					21px;
	}

	header.banner .nav-pills > li > a {
		color: 						#555;
		text-decoration: 			none;
		background-color: 			#e5e5e5;
		-webkit-box-shadow: 		inset 0 3px 8px rgba(0,0,0,0.125);
		-moz-box-shadow: 			inset 0 3px 8px rgba(0,0,0,0.125);
		box-shadow: 				inset 0 3px 8px rgba(0,0,0,0.125);

		float: 						none;
		padding: 					10px 15px 10px;
		text-shadow: 				0 1px 0 #fff;

		margin-top: 				2px;
		margin-bottom: 				2px;
		-webkit-border-radius: 		5px;
		-moz-border-radius: 		5px;
		border-radius: 				5px;
	}

</style>

<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner">
		<div class="container">

			<div class="brand">
				<a href="<?php echo home_url(); ?>/"><img src="http://placehold.it/200x100" class="logo img-rounded"></a>

				<h1>GroupNameX</h1>
			</div>

			<div class="pull-right">
				<div class="topNav clearfix">
					<form class="navbar-search">
			    		<input type="text" class="search-query" placeholder="Search">
			    		<select>
			    			<option>Any</option>
			    			<option>Person</option>
							<option>Group</option>
							<option>Company</option>
			    		</select>
			    		<button type="submit"><i class="icon-search"></i></button>
			    	</form>
			    	<ul class="memberInfo pull-right nav nav-pills">
						<li class="dropdown dropdown-hover">
				    		<a href="#" class="dropdown-toggle" data-toggle="dropdown">My profile</a>
				    		<ul class="dropdown-menu">
								<li><a href="#">Inbox</a></li>
								<li><a href="/member">Profile</a></li>
								<li><a href="#">Contacts</a></li>
								<li><a href="#">Account</a></li>
								<li><a href="#">Logout</a></li>
				    		</ul>
				    	</li>
			    	</ul>
				</div>

				<nav class="nav-main mainNav pull-right" role="navigation">
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
						<li class="dropdown dropdown-hover active">
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
