<div class="block-odd">
	<div class="container">
		<div class="box">
			<?php while (have_posts()) : the_post(); ?>
			  <?php the_content(); ?>
			  <a href="#" class="button primary jsLogin">Login</a>
			<?php endwhile; ?>
		</div>
	</div>
</div>

<script type="text/javascript">
	$(function(){
		$("form").form({
			callToAction : '.jsLogin',
			errorClass : 'error',
			url : '/dologin'
			
		});
	});
</script>


<?php add_action('wp_footer', 'addToFooter',200);

	function addToFooter() {
		$content = '<script type="text/javascript" src="/'.THEME_PATH.'/assets/js/form.js"></script>';
		echo $content;
	}
 ?>

