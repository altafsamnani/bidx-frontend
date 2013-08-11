<?php if (!have_posts()) : ?>
<div>
	<div class="alert">
    	<?php _e('Sorry, no results were found.','bidxtheme'); ?>
  	</div>
  	<?php get_search_form(); ?>
</div>
<?php endif; ?>
<?php while (have_posts()) : the_post();
	//$content = get_the_content();
	$content = get_the_content_feed(); //Mattijs 10/7/2013: get_the_content doesnot apply shortcode filtering
	$blocks = explode('<hr />', $content)
?>


<article <?php post_class(); ?>>

	<?php
		//include hero banner (which requires the array $blocks)
		require_once("inner-hero.php");
	?>
	<div class="container">
		<br />

		<?php
			unset($blocks[0]);

			$array = array_values($blocks);
			foreach ( $blocks as $block ) {
		?>
				<div class="row-fluid">
					<?php echo $block ?>
				</div>
				<hr>
 		<?php
 			}
 		?>
	</div>

	<footer>
		<!-- widget space -->
		<div class="container">
			<div class="row-fluid">
				<?php get_template_part('horizontal','1'); ?>
			</div>
		</div>
	</footer>

</article>
<?php endwhile; ?>

