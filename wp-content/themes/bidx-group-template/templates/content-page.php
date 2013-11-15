<?php while (have_posts()) : the_post(); ?>
	<div class="container">
		<?php the_content(); ?>
		<?php wp_link_pages(array('before' => '<nav class="pagination">', 'after' => '</nav>')); ?>
	</div>
<?php endwhile; ?>
