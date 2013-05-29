	<footer>

		<div class="container row-fluid">
			<div class="span3" style="height: 100px">
			    <a href="http://www.bidnetwork.org">
			      <img style="height: 100%" src="/wp-content/themes/bidx/assets/img/partners/bidnetwork_logo.png" alt="Bidnetwork">
			    </a>
			 </div>
			 <div class="span2" style="height: 100px">
			    <a href="http://www.sampoerna.com">
			      <img style="height: 100%" src="/wp-content/themes/bidx/assets/img/partners/Sampoerna/logo_Sampoerna.png" alt="Sampoerna">
			    </a>
			 </div>
			 <div class="span2" style="height: 100px">
			    <a href="http://www.postcodeloterij.nl">
			      <img style="height: 100%" src="/wp-content/themes/bidx/assets/img/partners/NPL/NPL_LR.jpg" alt="Stichting Postcodeloterij">
			    </a>
			 </div>
			 <div class="span2" style="height: 100px">	
			 	<a href="http://www.dfid.com">
			      <img style="height: 100%" src="/wp-content/themes/bidx/assets/img/partners/DFID/DFID_lowres_nobackground.png" alt="DFID">
			    </a>
			 </div>
			 <div class="span2" style="height: 100px">
			    <a href="http://www.usaid.com">
			      <img style="height: 95px" src="/wp-content/themes/bidx/assets/img/partners/USAID/Horizontal_RGB_600.png" alt="USAID">
			    </a>
			</div>
		</div>

			
		<div class="block-odd"><br /></div>		
		
		<div class="block-even">
			<div class="container">
				<!-- <div class="shade-top"></div> -->
				<div class="footer-links clearfix">		
					<?php wp_nav_menu(array('theme_location' => 'footer_navigation', 'menu_class' => 'footer_nav clearfix')); ?>
					<div class="footer_socialmedia">
						<ul>
							<li><a href="#">[ICON] FACEBOOK</a></li>
							<li><a href="#">[ICON] TWITTER</a></li>
							<li><a href="#">[ICON] LINKEDIN</a></li>
						</ul>
					</div><!--/span-->	
				</div>
			</div>
		</div>
		
		<div class="sub-footer">
			<ul>
				<li>@ 2013. bidX.net. All rights reserved</li>
				<li><a href="#">Terms of Service</a></li>
				<li><a href="#">Privacy</a></li>
			</ul>
		</div>
	</footer>
<?php wp_footer(); ?><!-- this includes the script libraries defined in the lib/script file -->

<script type="text/javascript">
	//load all functions from queue
	$.each(q, function(index,f){$(f);});
</script>
