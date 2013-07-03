<header>
	<div class="container">
		<div class="navbar">
			<div class="container"> 
				<button type="button" class="btn btn-navbar collapsed" data-toggle="collapse" data-target=".nav-collapse">
		            <span class="icon-bar"></span>
		            <span class="icon-bar"></span>
		            <span class="icon-bar"></span>
          		</button>
				<a class="logo" href="<?php echo home_url(); ?>/">
					<img src="/wp-content/themes/bidx/assets/img/logo-desktop.png" class="hidden-phone">
					<img src="/wp-content/themes/bidx/assets/img/logo-mobile.png" class="visible-phone">
				</a>
				
				<nav class="menu-top visible-desktop">
					<ul class="unstyled inline nav">
						<li><a href="/category/blog">Blog</a></li>
						<li><a href="/about">About bidX</a></li>
						<li><a href="/contact">Contact</a></li>
					</ul>
				</nav>
			</div>
			<nav class="nav-collapse collapse menu-main">
				<?php
				if (has_nav_menu('primary_navigation')) :
					wp_nav_menu(array('theme_location' => 'primary_navigation', 'menu_class' => 'nav menu'));
				endif;
				?>
				<ul class="nav menu visible-phone">
					<li><a href="/category/blog">Blog</a></li>
					<li><a href="/about">About bidX</a></li>
					<li><a href="/contact">Contact</a></li>
				</ul>
			</nav>
		</div>
	</div>

</header>

