<div class="block-odd">
	<div class="container">
		<div class="block-login">
			<?php while (have_posts()) : the_post(); ?>
			  <?php
        check_bidx_session();
        
        the_content();

        ?>
			  
			<?php endwhile; ?>
		</div>
	</div>
</div>


<?php add_action('wp_footer', 'addToFooter',200);

	function addToFooter() {
		$content = '<script type="text/javascript" src="/wp-content/themes/plugins/form.js"></script>';
		echo $content;
	}
 ?>

