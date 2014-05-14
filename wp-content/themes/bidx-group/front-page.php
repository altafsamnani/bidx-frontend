<?php
    // Sidebar's default position is right
    $sidebar_alignment = 'right';
    if ( get_theme_mod( 'sidebar_alignment' ) === 'left' ) { $sidebar_alignment = 'left'; }
    
    // Full or Fixed Widths
    $top_fixed = FALSE;
    $bottom_fixed = FALSE;
    if ( get_theme_mod( 'front_top_width' )    === TRUE ) { $top_fixed    = TRUE; }
    if ( get_theme_mod( 'front_bottom_width' ) === TRUE ) { $bottom_fixed = TRUE; }

    // Private Regions
    if ( $authenticated )
    {
?>
        <div class="region-top">
            <?php if ( $top_fixed ) : ?>
                <div class="container">
            <?php endif; ?>
                <?php dynamic_sidebar('priv-front-top'); ?>
            <?php if ( $top_fixed ) : ?>
                </div>
            <?php endif; ?>
        </div>
        <div class="container">
            <div class="row">
<?php
            if ( $sidebar_alignment === 'left' ) :
?>                
                <div class="col-sm-4">
                    <div class="region-side">
                        <?php dynamic_sidebar('priv-front-side'); ?>
                    </div>
                </div>
<?php
            endif;
?>                
                <div class="col-sm-8">
                    <div class="region-body">
                        <?php dynamic_sidebar('priv-front-body'); ?>
                    </div>
                </div>
<?php
            if ( $sidebar_alignment === 'right' ) :
?>                
                <div class="col-sm-4">
                    <div class="region-side">
                        <?php dynamic_sidebar('priv-front-side'); ?>
                    </div>
                </div>
<?php
            endif;
?>                
            </div>
        </div>
        <div class="region-bottom">
            <?php if ( $bottom_fixed ) : ?>
                <div class="container">
            <?php endif; ?>
                <?php dynamic_sidebar('priv-front-bottom'); ?>
            <?php if ( $bottom_fixed ) : ?>
                </div>
            <?php endif; ?>
        </div>
<?php        
    }

    // Public Regions
    else
    {
?>
        <div class="region-top">
            <?php if ( $top_fixed ) : ?>
                <div class="container">
            <?php endif; ?>
                <?php dynamic_sidebar('pub-front-top'); ?>
            <?php if ( $top_fixed ) : ?>
                </div>
            <?php endif; ?>
        </div>
        <div class="container">
            <div class="row">
<?php
            if ( $sidebar_alignment === 'left' ) :
?>                
                <div class="col-sm-4">
                    <div class="region-side">
                        <?php dynamic_sidebar('pub-front-side'); ?>
                    </div>
                </div>
<?php
            endif;
?>                
                <div class="col-sm-8">
                    <div class="region-body">
                        <?php dynamic_sidebar('pub-front-body'); ?>
                    </div>
                </div>
<?php
            if ( $sidebar_alignment === 'right' ) :
?>                
                <div class="col-sm-4">
                    <div class="region-side">
                        <?php dynamic_sidebar('pub-front-side'); ?>
                    </div>
                </div>
<?php
            endif;
?>                
            </div>
        </div>
        <div class="region-bottom">
            <?php if ( $bottom_fixed ) : ?>
                <div class="container">
            <?php endif; ?>
                <?php dynamic_sidebar('pub-front-bottom'); ?>
            <?php if ( $bottom_fixed ) : ?>
                </div>
            <?php endif; ?>
        </div>
<?php 
    }
?>

