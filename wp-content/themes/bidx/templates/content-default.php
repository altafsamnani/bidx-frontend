<?php if (!have_posts()) : ?>
<div>
	<div class="alert">
    	<?php _e('Sorry, no results were found.', 'roots'); ?>
  	</div>
  	<?php get_search_form(); ?>
</div>	  	
<?php endif; ?>
<?php while (have_posts()) : the_post(); 
$content = get_the_content();
$blocks = explode('<hr />', $content)
?>
<article <?php post_class(); ?>>
	<header>
		<div class="headerbanner">
			<div class="container">
				<!-- Check if subpages available -->
				<?php 
				$children = get_pages('child_of=' . $post->ID . '&parent=' . $post->ID);
				if( count( $children ) > 0 ) {
				?>
				<div class="span9">
					<div class="navbar navbar-inverse">
						<div class="navbar-inner">
							<div class="nav-collapse collapse">
						  		<ul class="nav">
								<?php foreach ($children as $child ) { ?>		                  	
							    	<li>
							          <a href="<?php echo $child -> guid; ?>"><?php echo $child -> post_name; ?></a>
							        </li>
								<?php } ?>
						    	</ul>
							</div>
						</div>
					
					</div>
				</div>
	       		<?php 
	       		}
	       		?>   	
		        
				<div class="row-fluid text-center headerblock blue">
					<div class="span12">
						<h1><?php the_title(); ?></h1>
						<?php echo $blocks[0] ?>
					</div>
				</div>

			</div>
			<!-- end of container -->
		</div>
		<!-- end headerbanner -->
		<div class="postheader"><span class="sprite headerarrow"></span></div>
	</header>
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
    
