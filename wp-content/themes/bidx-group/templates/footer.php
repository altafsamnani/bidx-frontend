<?php
    $has_social = false;
    if ( get_theme_mod( 'facebook_url' ) || get_theme_mod( 'linkedin_url' ) || get_theme_mod( 'twitter_handle' ) )
    {
        $has_social = true;
    }
?>

<footer>
    <div class="page-footer bg-primary-dark">
        <div class="container">
            <div class="footer-bar row">
<?php
            if ( $has_social ) :
?>                
                <div class="pull-left col-sm-4">
                    <div class="follow-us pull-left"><?php _e( 'Follow us', 'roots' ) ?></div>
                    <div class="btn-group">
<?php
                        if ( get_theme_mod( 'facebook_url' ) )
                        {
?>
                            <a target="_blank" href="<?php echo get_theme_mod( 'facebook_url' ); ?>"><i class="fa fa-facebook-square"></i></a>
<?php                            
                        }

                        if ( get_theme_mod( 'linkedin_url' ) )
                        {
?>
                            <a target="_blank" href="<?php echo get_theme_mod( 'linkedin_url' ); ?>"><i class="fa fa-linkedin-square"></i></a>
<?php                            
                        }

                        if ( get_theme_mod( 'twitter_handle' ) )
                        {
?>
                            <a target="_blank" href="//twitter.com/<?php echo get_theme_mod( 'twitter_handle' ); ?>"><i class="fa fa-twitter-square"></i></a>
<?php                            
                        }
?>                        

                    </div>
                </div>
<?php
            endif;
?>                

                <div class="pull-right col-sm-8 text-right">
                    <div class="copyright">&copy; <?php echo date("Y") ?> bidx.net  <?php _e( 'All rights reserved','roots' ) ?></div>
                    <div class="inline-list footer-menu">
                        <div><a href="/wp-content/themes/bidx-group-template/assets/docs/terms/BidX_Terms_and_Conditions_October_2013_en.pdf" target="_blank"><?php _e('Terms and service','roots')?></a></div>
                        <div><a href="/privacy"><?php _e('Privacy','roots')?></a></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</footer>


<?php wp_footer(); ?>

