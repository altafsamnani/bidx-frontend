<?php
    if ( get_theme_mod( 'footer' ) )
    {
?>

<footer>
    <div class="page-footer bg-primary-dark">
        <div class="container">
                <?php echo get_theme_mod( 'footer' ); ?>
        </div>
    </div>
</footer>

<?php
    } else {
?>

<footer>
    <div class="page-footer bg-primary-dark">
        <div class="container">
            <div class="footer-bar row">
            	<div class="pull-left col-sm-6">
            		<div class="follow-us pull-left">Follow us</div>
            	 	<div class="btn-group">
                        <a target="_blank" href="https://twitter.com/bid_x"><i class="fa fa-twitter-square"></i></a>
                        <a target="_blank" href="https://www.facebook.com"><i class="fa fa-facebook-square"></i></a>
                        <a target="_blank" href="http://www.linkedin.com/company/bidx"><i class="fa fa-linkedin-square"></i></a>
                    </div>
            	</div>

            	<div class="pull-right col-sm-6 text-right">
            		<div class="copyright">&copy; <?php echo date("Y") ?>. bidX.net. <?php _e('All rights reserved','bidxtheme')?></div>
                    <div class="inline-list footer-menu">
            			<div><a href="/sitemap"><?php _e('Sitemap','bidxtheme')?></a></div>
            			<div><a href="/wp-content/themes/bidx-group-template/assets/docs/terms/BidX_Terms_and_Conditions_October_2013_en.pdf" target="_blank"><?php _e('Terms and service','bidxtheme')?></a></div>
            			<div><a href="/privacy"><?php _e('Privacy','bidxtheme')?></a></div>
            		</div>
            	</div>
            </div>
        </div>
    </div>
</footer>

<?php
    }
?>

<?php wp_footer(); ?>

