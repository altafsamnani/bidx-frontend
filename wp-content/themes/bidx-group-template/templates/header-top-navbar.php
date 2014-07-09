
<nav class="visible-xs nav-main mobile-menu" role="banner">
    <div class="container">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <h4><?php echo _e('Menu', 'roots'); ?></h4>
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
