<?php

?>
<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner bidx-theme-colour-header">
		<div class="container">
			<div class="row-fluid">
<?php
				if( $authenticated )
				{
?>
				<div class="iconbar-wrapper">
					<?php echo do_shortcode( '[bidx app="group" view="navbar"]' );?>
				</div>
<?php
				}

				// the group-header is displayed for authenticated and non-authenticated
?>
				<div class='header-logo'>
<?php
				if ( get_theme_mod( 'themeslug_logo' ) ) {
					$img = parse_url( get_theme_mod( 'themeslug_logo' ) );
					$img_url = $img['path']; //make relative
?>
				    <a href='<?php echo esc_url( home_url( '/' ) ); ?>' title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'>
				    	<img src='<?php echo $img_url; ?>' alt='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>'>
				    </a>
<?php 			} else { ?>
   					<span class='site-title'><a href='<?php echo esc_url( home_url( '/' ) ); ?>' title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'><?php bloginfo( 'name' ); ?></a></span>
<?php 			} ?>
				</div>

<?php
				if( $authenticated )
				{
?>
				<div class="search">
			 		<?php get_template_part('templates/searchform'); ?>
				</div>
<?php
				}
				if( !$authenticated )
				{
?>
	 			<div class="pull-right span4 bidx-header-controls">
					<div class="row-fluid">
						<div class="span6">
							<a href="/auth/#auth/register/firstLogin=get-it-started-member" class="btn btn-primary btn-block bidx-theme-colour-two"><?php _e('Become a member','bidxtheme');?></a>
						</div>
						<div class="span6">
							<a href="/auth/#auth/login" class="btn btn-primary btn-block bidx-theme-colour-one"><i class="bidx-login"></i><?php _e('Login','bidxtheme');?></a>
						</div>
					</div>
				</div>
<?php
			 	}
			 	if( $authenticated )
				{
?>
				<nav class="nav-collapse collapse menu-main">
<?php
					if (has_nav_menu('primary_navigation')) :
						wp_nav_menu(array('theme_location' => 'primary_navigation', 'menu_class' => 'nav'));
					endif;
?>
				</nav>
<?php
				} else {
?>
				<nav class="nav-collapse collapse menu-main">
<?php
					if (has_nav_menu('primary_notloggedin_navigation')) :
						wp_nav_menu(array('theme_location' => 'primary_notloggedin_navigation', 'menu_class' => 'nav'));
					endif;
?>
				</nav>
<?php
				}
?>

 			</div>
		</div>
	</div>
	<div class="white-spacer"></div>

</header>


