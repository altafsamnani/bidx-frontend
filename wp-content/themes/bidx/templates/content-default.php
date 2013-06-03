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
				<div class="span9">
					<div class="navbar navbar-inverse">
		            	<div class="navbar-inner">
		                	<div class="nav-collapse collapse">
		                  	<ul class="nav">
		                    	<li>
			                      <a href="#fakelink">Menu Item</a>
			                    </li>
			                    <li>
			                      <a href="#fakelink">About Us</a>
			                    </li>
			                  </ul>
		                	</div>
		            	</div>
		          	</div>
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
		<?php for ( $i=0; $i < ( sizeof( $blocks ) -1 ); $i++ )?>
		<div class="row-fluid">
			<div class="span8">
				<p><?php echo $blocks[$i] ?></p>
			</div>
		</div>
		<hr>
	</div>
	<footer>
		<!-- widget ruimte -->
	</footer>
	
</article>
<?php endwhile; ?>
    