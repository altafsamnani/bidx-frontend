<?php
    // Sidebar's default position is right
    $sidebar_alignment = 'right';
    if ( get_option( 'sidebar_alignment' ) === 'left' ) { $sidebar_alignment = 'left'; }
    
    // Full or Fixed Widths
    $top_fixed = FALSE;
    $bottom_fixed = FALSE;
    if ( get_theme_mod( 'front_top_width' )    === TRUE ) { $top_fixed    = TRUE; }
    if ( get_theme_mod( 'front_bottom_width' ) === TRUE ) { $bottom_fixed = TRUE; }
?>

<?php if ( is_active_sidebar( 'priv-front-top' ) || is_active_sidebar( 'pub-front-top' ) ) : ?>
<div class="region-top">
    <?php if ( $top_fixed ) : ?>
        <div class="container">
    <?php endif; ?>
<?php
        if ( $authenticated )
        {
            dynamic_sidebar('priv-front-top');
        }
        else
        {
            dynamic_sidebar('pub-front-top');
        }
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
            if ( $sidebar_alignment === 'left' ) :
?>                
                <div class="col-sm-4">
                    <div class="region-side">
<?php
                        if ( $authenticated )
                        {
                            dynamic_sidebar('priv-front-side');
                        }
                        else
                        {
                            dynamic_sidebar('pub-front-side');
                        }
?>
                    </div>
                </div>
<?php
            endif;
?>

                <div class="col-sm-8">
                    <div class="region-body">
<?php
                        if ( $authenticated )
                        {
                            dynamic_sidebar('priv-front-body');
                        }
                        else
                        {
                            dynamic_sidebar('pub-front-body');
                        }
?>
                    </div>
                </div>

<?php
            if ( $sidebar_alignment === 'right' ) :
?>                
                <div class="col-sm-4">
                    <div class="region-side">
<?php
                        if ( $authenticated )
                        {
?>
                            <div class="panel panel-primary panel-members widget">
                                <div class="panel-heading hide-overflow">
                                    <h4 class="pull-left"><?php _e('Create and grow', 'bidxplugin')?></h4>
                                </div>
                                <div class="panel-body">
<?php
                                    echo do_shortcode( '[bidx app="member" view="entrepreneur-profile-links"]' );
                                    echo do_shortcode( '[bidx app="member" view="investor-profile-links"]' );
                                    echo do_shortcode( '[bidx app="member" view="mentor-profile-links"]' );
?>
                                </div>
                            </div>

<?php                        
                            dynamic_sidebar('priv-front-side');
                        }
                        else
                        {
                            dynamic_sidebar('pub-front-side');
                        }
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
        if ( $authenticated )
        {
            dynamic_sidebar('priv-front-bottom');
        }
        else
        {
            dynamic_sidebar('pub-front-bottom');
        }
?>
    <?php if ( $bottom_fixed ) : ?>
        </div>
    <?php endif; ?>
</div>
<?php endif; ?>
