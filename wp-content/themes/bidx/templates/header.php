
<header>
	<div class="container">
		<!-- Main Nav to go here -->  
		<div class="navbar">
			<div class="navbar-inner-bidX">

				<!-- .btn-navbar is used as the toggle for collapsed navbar content -->

				<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
					<!--  -->
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</a>

				<!-- logo -->
				<a class="logo sprite" href="<?php echo home_url(); ?>/"></a>

				<div id="languageSelector" >
					<div class="dropdown">
						<a class="dropdown-toggle" data-toggle="dropdown" role="button" href="#">
							<span class="sprite language en">English</span>
							<span class="caret"></span>
						</a>
						<ul class="dropdown-menu" role="menu" >
							<li class="hidden"><a href="#"><span class="sprite language en">English</span></a></li>
							<li><a href="#"><span class="sprite language es">Spanish</span></a></li>
						</ul>
					</div>                  


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
	</div>

</header>

