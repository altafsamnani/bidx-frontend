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

<?php add_action('wp_footer', 'addToFooter',200);

	function addToFooter() {
		$content = '<script type="text/javascript" src="/wp-content/themes/plugins/form.js"></script>';
		echo $content;
	}
 ?>

