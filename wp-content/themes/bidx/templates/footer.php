	<footer>
			
		<div class="block-even">
			<div class="container row-fluid">
				<div class="span2 offset1">
					<img 
				</div>
				<div class="span2"></div>
				<div class="span2"></div>
				<div class="span2"></div>
				<div class="span2"></div>
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
