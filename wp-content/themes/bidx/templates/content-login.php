<?php
	wp_enqueue_script( 'bidx-form' );
?>
<div class="block-odd">
	<div class="container">
		<div class="block-login">
			<?php while (have_posts()) : the_post(); ?>
			  <?php the_content(); ?>
			<?php endwhile; ?>
		</div>
	</div>
</div>

<script type="text/javascript">
	$(function(){
		$("form").form({
			callToAction : '.jsLogin',
			errorClass : 'error'
		});
	});
</script>
