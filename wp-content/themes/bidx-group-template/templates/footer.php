<?php
    if ( get_theme_mod( 'footer' ) )
    {
?>

<footer>
    <div class="page-footer bidx-theme-colour-footer">
        <div class="container">
                <?php echo get_theme_mod( 'footer' ); ?>
        </div>
    </div>
</footer>

<?php
    } else {
?>

<footer>
    <div class="page-footer bidx-theme-colour-footer">
        <div class="container">
            <div class="footer-bar">
            	<div class="pull-left left-block">
            		<div class="follow-us">Follow us</div>
            	 	<div class="inline-list social-links">
                        <a target="_blank" href="https://twitter.com/bid_x" class="sprite twitter"></a>
                        <a target="_blank" href="https://www.facebook.com" class="sprite facebook"></a>
                        <a target="_blank" href="http://www.linkedin.com/company/bidx" class="sprite linkedin"></a>
                    </div>
            	</div>

            	<div class="pull-right right-block">
            		<div class="copyright">&copy; <?php echo date("Y") ?>. bidX.net. <?php _e('All rights reserved','bidxtheme')?></div>
                    <div class="inline-list footer-menu">
            			<div><a href="/sitemap"><?php _e('Sitemap','bidxtheme')?></a></div>
            			<div><a href="/termsandconditions"><?php _e('Terms and conditions','bidxtheme')?></a></div>
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

