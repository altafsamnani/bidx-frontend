<?php
    $session = BidxCommon::$staticSession;

    $authClass = "not-auth";
    $authenticated = false;

    if ( isset( $session->authenticated ) && $session->authenticated == 'true' )
    {
        $authenticated = true;
        $authClass = "auth";
    }

    $isEntrepreneur = isset( $session->data->wp->entities->bidxEntrepreneurProfile )   ? TRUE : FALSE ;
    $isInvestor     = isset( $session->data->wp->entities->bidxInvestorProfile )       ? TRUE : FALSE;
    $isMentor       = isset( $session->data->wp->entities->bidxMentorProfile )         ? TRUE : FALSE;

    $hasRole = false;
    if ( $isEntrepreneur || $isInvestor || $isMentor )
    {
        $hasRole = true;
    }

    $option_logo_alignment  =   get_option( 'logo_alignment' );
    $option_logo_alignment  =   ( $option_logo_alignment )  ? $option_logo_alignment : BIDX_LOGO_ALIGNMENT;

    $option_page_width_sel  =   get_option( 'page_width_selector' );
    $option_page_width_sel  =   ( $option_page_width_sel )  ? $option_page_width_sel : BIDX_PAGE_WIDTH_SELECTOR;
?>

    <div class="bg-primary-darker navbar navbar-fixed-top">
        <div class="container">
            <div class="row">
                <div class="search col-xs-6">
                    <a class="home-btn navbar-left flip" href="<?php echo getLangPrefix('/');?>"><i class="fa fa-home"></i></a>
<?php
                    get_template_part('templates/searchform');
?>
                </div>
                <div class="col-xs-6">
<?php
                    echo do_shortcode( '[bidx app="group" view="navbarshort"]' );
?>
                </div>
            </div>
        </div>
    </div>

    <header role="banner">
        <div class="container">
            <div class="row">
                <div class="col-sm-12">
<?php
                    // Default logo position
                    $logo_alignment = 'logo-left';
                    $mobile_logo    = false;
                    if ( $option_logo_alignment === 'middle' ) { $logo_alignment = 'logo-centered'; }
                    if ( $option_logo_alignment === 'right' )  { $logo_alignment = 'logo-right';    }

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
                            <a class='<?php if( $mobile_logo ) { echo 'hidden-xs'; } ?>' href="<?php echo getLangPrefix('/');?>" title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'>
                                <img src='<?php echo $img_url; ?>' alt='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>'>
                            </a>

<?php
                        }
                        else
                        {
?>
                            <span class='site-title hidden-xs'><a href='/' title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'><?php bloginfo( 'name' ); ?></a></span>
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
                            <span class='site-title visible-xs'><a href='<?php echo esc_url( home_url( '/' ) ); ?>' title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'><?php bloginfo( 'name' ); ?></a></span>
<?php
                        }

                        // Add slogan and start here button if logo alignment is left or right

                        if ( $option_logo_alignment === 'left' || $option_logo_alignment === 'right' )
                        {

                            $kickoff_alignment = ($option_logo_alignment === 'left') ? 'pull-right' : 'pull-left';


?>
                            <div class="kickoff <?php echo $kickoff_alignment; ?>">
<?php
                            if( !$authenticated )
                            {
?>
                                <a href="<?php echo _l('join');?>" class="btn btn-secondary btn-lg start-btn <?php echo $kickoff_alignment; ?>"><?php _e('Start Here','bidxplugin'); ?></a>
<?php
                            }
                            if( $authenticated && !$hasRole )
                            {
?>
                                <a href="<?php echo _l('join');?>" class="btn btn-secondary btn-lg start-btn <?php echo $kickoff_alignment; ?>"><?php _e('Choose a role','bidxplugin'); ?></a>
<?php
                            }
?>
                                <div class="lead pull-right tagline">
<?php
                                    echo get_theme_mod( 'slogan' ) ;
?>
                                </div>
                            </div>
<?php
                        }

                        if ( $option_logo_alignment === 'middle' )
                        {
                            if( $authenticated && !$hasRole )
                            {
?>
                                <a href="<?php echo _l('join');?>" class="btn btn-secondary btn-lg start-btn choose-role"><?php _e('Choose a role','bidxplugin'); ?></a>
<?php
                            }
                        }
?>
                    </div>
                </div>
            </div>
        </div>
    </header>

<?php
    if (has_nav_menu('primary_navigation')) :

        // Check - Invert Main Menu colors
        $invertedMenu = '';
        if ( get_theme_mod( 'main_menu_invert' ) ) :
            $invertedMenu = ' inverted-menu';
        endif;

    get_template_part('templates/header-top-navbar');

        if ( $option_page_width_sel !== 'full' ) :
?>
            <div class="container">
<?php
        endif;
?>
        <nav class="hidden-xs nav-main<?php echo $invertedMenu; ?>" role="navigation">
<?php
            if ( $option_page_width_sel === 'full' ) :
?>
                <div class="container">
<?php
            endif;
?>
<?php
            if( $authenticated )
            {
?>
                <div class="main-menu">
<?php
                    if (has_nav_menu('primary_navigation')) :
                        wp_nav_menu(array('theme_location' => 'primary_navigation', 'menu_class' => 'nav'));
                    endif;
?>
                </div>
<?php
            }
            else
            {
?>
                <div class="main-menu">
<?php
                    if (has_nav_menu('primary_notloggedin_navigation')) :
                        wp_nav_menu(array('theme_location' => 'primary_notloggedin_navigation', 'menu_class' => 'nav'));
                    endif;
?>
                </div>
<?php
            }

            if ( $option_page_width_sel === 'full' ) :
?>
                </div>
<?php
            endif;
?>

        </nav>
<?php
        if ( $option_page_width_sel !== 'full' ) :
?>
            </div>
<?php
        endif;

    endif;
?>
