<footer>
     <div class="partners">
        <div class="container partnerList">
            <a href="http://www.bidnetwork.org" class="partner partner-bid"><?php _e('BiD Network','bidxtheme')?></a>
            <a href="http://www.puterasampoerna.com/" class="partner partner-sampoerna"><?php _e('Putera Sampoerna','bidxtheme')?></a>
            <a href="http://www.postcodeloterij.nl" class="partner partner-postcodeloterij"><?php _e('Nationale Postcode Loterij','bidxtheme')?></a>
            <a href="https://www.gov.uk/government/organisations/department-for-international-development" class="partner partner-did"><?php _e('Department for International Development','bidxtheme')?></a>
            <a href="https://www.usaid.gov" class="partner partner-usaid"><?php _e('USAID','bidxtheme')?></a>
        </div>
    </div>


    <div class="page-footer">
        <div class="container">
            <div class="footer-bar">
            	<div class="pull-left left-block">
            		<div class="follow-us"><?php _e('Follow us','bidxtheme')?></div>
            	 	<div class="inline-list social-links">
                        <a href="https://twitter.com/bid_x" class="sprite twitter"></a>
                        <a href="https://www.facebook.com" class="sprite facebook"></a>
                        <a href="http://www.linkedin.com/company/bidx" class="sprite linkedin"></a>
                    </div>
            	</div>

            	<div class="pull-right right-block">
            		<div class="copyright">&copy; <?php _e('2013. bidX.net. All rights reserved','bidxtheme')?></div>
                    <div class="inline-list footer-menu">
            			<div><a href="/sitemap"><?php _e('Sitemap','bidxtheme')?></a></div>
            			<div><a href="/terms-and-conditions"><?php _e('Terms and conditions','bidxtheme')?></a></div>
            			<div><a href="/privacy"><?php _e('Privacy','bidxtheme')?></a></div>
            		</div>
            	</div>
            </div>
        </div>
    </div>
</footer>

<?php wp_footer(); ?><!-- this includes the script libraries defined in the lib/script file -->

<script type="text/javascript">
	//load all functions from queue
    ( function( $ ) {
	   $.each(q, function(index,f){$(f);});
    } ( jQuery ));
</script>
