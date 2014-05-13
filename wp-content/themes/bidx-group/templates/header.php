<?php
    $session = BidxCommon::$staticSession;

    $authClass = "not-auth";
    $authenticated = false;

    if ($session->authenticated == 'true' )
    {
        $authenticated = true;
        $authClass = "auth";
    }
?>

    <div class="bg-primary-darker navbar navbar-fixed-top">
        <div class="container">
            <div class="row">
                <div class="search col-xs-6">
                    <a class="home-btn" href="/"><i class="fa fa-home"></i></a>
<?php
                    get_template_part('templates/searchform');
?>
                </div>
                <div class="col-xs-6">
<?php
                    echo do_shortcode( '[bidx app="group" view="navbar"]' );
?>
                </div>
            </div>
        </div>
    </div>

    <header role="banner">
        <div class="container">
<?php
            // Default logo position
            $logo_alignment = 'logo-left';
            $mobile_logo = false;
            if ( get_theme_mod( 'logo_alignment' ) === 'middle' ) { $logo_alignment = 'logo-centered'; }
            if ( get_theme_mod( 'logo_alignment' ) === 'right' )  { $logo_alignment = 'logo-right';    }

            // Check for mobile logo
            if ( get_theme_mod( 'mobile_logo_selector' ) ) { $mobile_logo = true; }
?>
            <div class='header-logo <?php echo $logo_alignment; ?>'>
<?php
                // Main logo
                if ( get_theme_mod( 'main_logo_selector' ) )
                {
                    $img = parse_url( get_theme_mod( 'main_logo_selector' ) );
                    $img_url = $img['path']; //make relative
?>
                    <a class='<?php if( $mobile_logo ) { echo 'hidden-xs'; } ?>' href='<?php echo esc_url( home_url( '/' ) ); ?>' title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'>
                        <img src='<?php echo $img_url; ?>' alt='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>'>
                    </a>

<?php
                }
                else
                {
?>
                    <span class='site-title'><a href='<?php echo esc_url( home_url( '/' ) ); ?>' title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'><?php bloginfo( 'name' ); ?></a></span>
<?php
                }

                // Mobile Logo
                if ( get_theme_mod( 'mobile_logo_selector' ) )
                {
                    $img = parse_url( get_theme_mod( 'mobile_logo_selector' ) );
                    $img_url = $img['path']; //make relative
?>
                    <a class='<?php if( $mobile_logo ) { echo 'visible-xs'; } ?>' href='<?php echo esc_url( home_url( '/' ) ); ?>' title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'>
                        <img src='<?php echo $img_url; ?>' alt='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>'>
                    </a>
<?php
                }
                else
                {
?>
                    <span class='site-title'><a href='<?php echo esc_url( home_url( '/' ) ); ?>' title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'><?php bloginfo( 'name' ); ?></a></span>
<?php
                }

                // Add slogan and start here button if logo alignment is left or right
                if ( get_theme_mod( 'logo_alignment' ) === 'left' || get_theme_mod( 'logo_alignment' ) === 'right' )
                {
                    $kickoff_alignment = get_theme_mod( 'logo_alignment' ) === 'left' ? 'pull-right' : 'pull-left';
?>
                    <div class="kickoff <?php echo $kickoff_alignment; ?>">
                        <button class="btn btn-success btn-lg start-btn <?php echo $kickoff_alignment; ?>"><?php _e('Start here','bidxplugin'); ?></button>
                        <div class="lead pull-right tagline">
<?php 
                            echo get_bloginfo('description') ;
?>
                        </div>
                    </div>
<?php 
                }
?>
            </div>
        </div>
    </header>

<?php
    if (has_nav_menu('primary_navigation')) :
?>
        <nav class="nav-main" role="navigation">
            <div class="container">
<?php
                if( $authenticated )
                {
?>
                    <div class="nav-collapse menu-main">
<?php
                    if (has_nav_menu('primary_navigation')) :
                    wp_nav_menu(array('theme_location' => 'primary_navigation', 'menu_class' => 'nav nav-pills'));
                    endif;
?>
                    </div>
<?php
                }
                else
                {
?>
                    <div class="nav-collapse menu-main">
<?php
                    if (has_nav_menu('primary_notloggedin_navigation')) :
                    wp_nav_menu(array('theme_location' => 'primary_notloggedin_navigation', 'menu_class' => 'nav nav-pills'));
                    endif;
?>
                    </div>
<?php
                }
?>
            </div>
        </nav>
<?php
    endif;
?>
