<div class="block-odd">
	<div class="container">
		
		<?php get_template_part('templates/page', 'header'); ?>
		
		<?php while (have_posts()) : the_post(); ?>
		  <?php the_content(); ?>
		  <?php wp_link_pages(array('before' => '<nav class="pagination">', 'after' => '</nav>')); ?>
		<?php endwhile; ?>
	</div>
</div>

<script type="text/javascript">
	$(function(){
		$("form").form({
			callToAction : '.jsCreateGroup',
			errorClass : 'error',
			url : '/handler',
			enablePlugins: ['date','slider']
		});
	});
</script>


<?php add_action('wp_footer', 'addToFooter',200);

	function addToFooter() {
		$content = '<script type="text/javascript" src="/'.THEME_PATH.'/assets/js/form.js"></script>';
		echo $content;
	}
 ?>


