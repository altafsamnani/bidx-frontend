<div class="block-odd">
	<div class="container">
		
		<?php while (have_posts()) : the_post(); ?>
		  <?php the_content(); ?>
		<?php endwhile; ?>
		
	</div>
</div>

<?php 
	add_action('wp_footer', 'addToFooter',200);

	function addToFooter() {
		$content = '<script type="text/javascript" src="/wp-content/themes/plugins/form.js"></script>';
		echo $content;
	}
 ?>


