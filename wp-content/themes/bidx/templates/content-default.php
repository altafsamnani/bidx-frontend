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
		<div style="background-color: #0093cb">
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
		       <?php 
		       	}
		       ?>   	
		          	
				</div>
				<div class="row-fluid text-center headerblock blue">
					<h2 style="color: white"><?php the_title(); ?></h2>
					<div class="span8 offset2" style="padding-bottom: 10px;">
						<p style="color: white"><?php echo $blocks[0] ?></p>
					</div>
				</div>
			</div>
			<!-- arrowdown in middle -->
		</div>
	</header>
	<div class="container">
		<br />
		<?php 
			unset($blocks[0]);

			$array = array_values($blocks);
			foreach ( $blocks as $block ) {?>
		<div class="row-fluid">
			<div class="span8">
				<p><?php echo $block ?></p>
			</div>
		</div>
		<hr>
	 <?php } ?>
	</div>
	<footer>
		<!-- widget ruimte -->
		
		
		
	</footer>
	
</article>
<?php endwhile; ?>
    