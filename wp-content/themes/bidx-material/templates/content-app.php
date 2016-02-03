<?php while (have_posts()) : the_post(); ?>
<div class="container">
	<article <?php post_class(); ?>>
    <div class="entry-content">
      <?php
      echo bidx_get_status_msgs();
      the_content(); ?>
    </div>
  </article>
 </div>
<?php endwhile; ?>
