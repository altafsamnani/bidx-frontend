<?php
	wp_enqueue_script( 'bidx-form' );
?>
<div class="block-odd">
	<div class="container">

		<?php while (have_posts()) : the_post(); ?>
		  <?php the_content(); ?>
		<?php endwhile; ?>

	</div>
</div>

