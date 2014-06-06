<?php
    // Check - Invert Main Menu colors 
    $invertedMenu = '';
    if ( get_theme_mod( 'main_menu_invert' ) ) :
        $invertedMenu = ' inverted-menu';
    endif;
?>
<nav class="visible-xs nav-main mobile-menu<?php echo $invertedMenu; ?>" role="banner">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="/"><?php echo _e('Menu', 'roots'); ?></a>
        </div>

        <nav class="collapse navbar-collapse" role="navigation">
<?php
            if (has_nav_menu('primary_navigation')) :
                wp_nav_menu(array('theme_location' => 'primary_navigation', 'menu_class' => 'nav'));
            endif;
?>
        </nav>
    </div>
</nav>
