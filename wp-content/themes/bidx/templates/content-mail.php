<div class="block-odd">
	<div class="container">
		
		<?php get_template_part('templates/page', 'header'); ?>
	
		  <?php  bidx_process_mail();         ?>
		  <?php wp_link_pages(array('before' => '<nav class="pagination">', 'after' => '</nav>')); ?>

	</div>
</div>
