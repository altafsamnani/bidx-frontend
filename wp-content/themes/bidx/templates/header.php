<header>
	<div class="container">

		<div class="navbar">
			<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</a>

			<a class="logo sprite" href="<?php echo home_url(); ?>/"></a>

			<nav class="menu-top">
				<ul class="unstyled inline nav">
					<li><a href="/blog">Blog</a></li>
					<li><a href="/about">About bidX</a></li>
					<li><a href="/contact">Contact</a></li>
				</ul>
			</nav>

			<nav class="nav-collapse collapse menu-main">
				<?php
				if (has_nav_menu('primary_navigation')) :
					wp_nav_menu(array('theme_location' => 'primary_navigation', 'menu_class' => 'nav menu'));
				endif;
				?>
			</nav>
		</div>
	</div>

</header>

