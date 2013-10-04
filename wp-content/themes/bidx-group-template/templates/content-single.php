<?php while (have_posts()) : the_post(); ?>
<br>
<div class="container">
  <div class="row-fluid">
    <div class="span8">
    	<article <?php post_class(); ?>>
        <header>
          <h1 class="entry-title"><?php the_title(); ?></h1>
          <hr>
          <?php get_template_part('templates/entry-meta'); ?>
        </header>
        <div class="entry-content">
          <?php the_content(); ?>
        </div>
        <footer>

          <?php wp_link_pages(array('before' => '<nav class="page-nav"><p>' . __('Pages:', 'roots'), 'after' => '</p></nav>')); ?>
          <?php the_tags('<ul class="entry-tags"><li>','</li><li>','</li></ul>'); ?>

        </footer>
        <?php 
        //  comments_template('/templates/comments.php'); 
        ?>
      </article>
      </div> 

<?php endwhile; ?>

<?php 

    $category = get_the_category(); 

    if ( $category ) { ?> 
    <div class="span4 well">
      <h4><?php echo $category[0]->name; ?></h4>
    <?php

      // The Query
      query_posts( array ( 'category_name' => $category[0]->category_nicename, 'posts_per_page' => -1 ) );

      // The Loop
      while ( have_posts() ) : the_post(); ?>
        <li>
          <a href="<?php the_permalink() ?>" title="<?php the_title(); ?>"><?php the_title(); ?></a>
        </li>

      <?php endwhile;

      // Reset Query
      wp_reset_query(); ?>
      </div>
<?php 
  }
?>
    </div> 
  </div> 