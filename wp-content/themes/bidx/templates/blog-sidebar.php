<div class="">
	<div class="well blog-categories">
		<ul>
		<?php wp_list_categories('orderby=name&hide_empty=0&show_count=true&title_li=<h4>Category</h4>'); ?> 
		</ul>
	</div>
	<div class="well followus">
		<h4>Follow us</h4>
		<?php get_template_part('templates/social-links'); ?>	
	</div>
	<!-- 
	<div class="well socialfeed">
		<h3>Social feed</h3>
	</div>	
	 -->
</div>