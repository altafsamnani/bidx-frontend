<?php
    // Sidebar's default position is right
    $sidebar_alignment = 'right';
    if ( get_option( 'sidebar_alignment' ) === 'left' ) { $sidebar_alignment = 'left'; }
    
    // Full or Fixed Widths
    $top_fixed = FALSE;
    $bottom_fixed = FALSE;
    if ( get_theme_mod( 'front_top_width' )    === TRUE ) { $top_fixed    = TRUE; }
    if ( get_theme_mod( 'front_bottom_width' ) === TRUE ) { $bottom_fixed = TRUE; }

    // Check if there is an active sidebar
    if ( $authenticated )
    {
        $hasSidebar = is_active_sidebar( 'priv-front-side' ) ? TRUE : FALSE;
    }
    else
    {
        $hasSidebar = is_active_sidebar( 'pub-front-side' ) ? TRUE : FALSE;
    }

    $middleBodyClass = $hasSidebar ? "col-sm-8" : "col-sm-12";
?>

<?php if ( is_active_sidebar( 'priv-front-top' ) || is_active_sidebar( 'pub-front-top' ) ) : ?>
    <div class="region-top">
        <?php if ( $top_fixed ) : ?>
            <div class="container">
        <?php endif; ?>
<?php
            $authenticated ? dynamic_sidebar('priv-front-top') : dynamic_sidebar('pub-front-top');
?>
        <?php if ( $top_fixed ) : ?>
            </div>
        <?php endif; ?>
    </div>
<?php endif; ?>

<?php if ( is_active_sidebar( 'priv-front-body' ) || is_active_sidebar( 'pub-front-body' ) ||
           is_active_sidebar( 'priv-front-side' ) || is_active_sidebar( 'pub-front-side' ) ) : ?>
    <div class="region-middle">
        <div class="container">
            <div class="row">
<?php
                if ( $hasSidebar && $sidebar_alignment === 'left' ) :
?>                
                    <div class="col-sm-4">
                        <div class="region-side">
<?php
                            $authenticated ? dynamic_sidebar('priv-front-side') : dynamic_sidebar('pub-front-side');
?>
                        </div>
                    </div>
<?php
                endif;
?>
                <div class="<?php echo $middleBodyClass; ?>">
                    <div class="region-body">
<?php
                        $authenticated ? dynamic_sidebar('priv-front-body') : dynamic_sidebar('pub-front-body');
?>
                    </div>
                </div>
<?php
                if ( $hasSidebar && $sidebar_alignment === 'right' ) :
?>                
                    <div class="col-sm-4">
                        <div class="region-side">
<?php
                            $authenticated ? dynamic_sidebar('priv-front-side') : dynamic_sidebar('pub-front-side');
?>
                        </div>
                    </div>
<?php
                endif;
?>                
            </div>
        </div>
    </div>
<?php endif; ?>

<?php if ( is_active_sidebar( 'priv-front-bottom' ) || is_active_sidebar( 'pub-front-bottom' ) ) : ?>
    <div class="region-bottom">
        <?php if ( $bottom_fixed ) : ?>
            <div class="container">
        <?php endif; ?>
<?php
            $authenticated ? dynamic_sidebar('priv-front-bottom') : dynamic_sidebar('pub-front-bottom');
?>
        <?php if ( $bottom_fixed ) : ?>
            </div>
        <?php endif; ?>
    </div>
<?php endif; ?>
