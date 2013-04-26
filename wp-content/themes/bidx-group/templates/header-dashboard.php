<header>
	<div class="container">
		<div class="subheader clearfix">
			<div class="branding">GROUP NAME COMES HERE (when no logo is available)</DIV>
			<nav class="clearfix">
				<?php
					if (has_nav_menu('group_dashboard_navigation')) :
						wp_nav_menu(array('theme_location' => 'group_dashboard_navigation', 'menu_class' => 'nav nav-pills pull-right'));
					endif;
				?>
				<form class="navbar-search pull-right">
		    		<input type="text" class="search-query" placeholder="Search">
		    	</form>   
			</nav>
			<div>
				<ul class="nav nav-tabs">
		    		<li class="active">
		    			<a href="#">Home</a>
		    		</li>
		    		<li><a href="#">Your Groups</a></li>
					<li><a href="#">Your Roles</a></li>
		    	</ul>
			</div>
		</div>
	</div>
	<div>GROUP DASHBOARD</div>
</header>