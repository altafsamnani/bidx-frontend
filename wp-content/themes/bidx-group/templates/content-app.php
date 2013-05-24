<?php while (have_posts()) : the_post(); ?>
<div class="container">
	<article <?php post_class(); ?>>
    <div class="entry-content">
      <?php the_content(); ?>
    </div>
  </article>
 </div> 
<?php endwhile; ?>
