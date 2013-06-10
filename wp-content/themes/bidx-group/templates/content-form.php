<?php
    wp_enqueue_script( 'bidx-form' );
?>
<div class="block-odd">
	<div class="container outer-content-container">

		<?php get_template_part('templates/page', 'header'); ?>

		<?php while (have_posts()) : the_post(); ?>
            <?php
                the_content();
            ?>
		  <?php wp_link_pages(array('before' => '<nav class="pagination">', 'after' => '</nav>')); ?>
		<?php endwhile; ?>
	</div>
</div>
