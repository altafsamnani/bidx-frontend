<?php while (have_posts()) : the_post(); ?>
<div class="container">
	<div class="row-fluid">
		<div class="span8">
			<article <?php post_class(); ?>>
			    <header>
			      <blockquote>
			      <h3><?php the_title(); ?></h3>
			      <small>
						<time class="updated" datetime="<?php echo get_the_time('c'); ?>" pubdate><?php echo get_the_date(); ?></time>, 
						<a href="<?php echo get_author_posts_url(get_the_author_meta('ID')); ?>" rel="author" class="fn"><?php echo get_the_author(); ?></a>
					</small>
					</blockquote>
			    </header>
			    <div class="well">
			    	<div class="entry-content">
			      		<?php the_content(); ?>
			      	</div>	
			    </div>
			        
			    <footer> 
					<div class="well">
				    <?php 
				    	comments_template('/templates/comments.php'); 
				    ?>
				    </div>			    
				    
			     	<ul class="pager">
					  <li class="previous">
					  		<?php previous_post('%', '&larr; ', 'yes'); ?>
					  </li>
					  <li class="next">
					    	<?php next_post('%', '&rarr; ', 'yes'); ?>
					  </li>
					</ul>
					
			    </footer>
		  </article>
	  </div>
	  <div class="span4">
	  	<?php get_template_part('templates/blog-sidebar'); ?>	
	  </div>
  </div>
 </div> 
<?php endwhile; ?>
