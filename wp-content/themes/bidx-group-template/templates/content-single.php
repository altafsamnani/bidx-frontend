
<?php while (have_posts()) : the_post(); ?>

<div class="container">
  <div class="row">

<?php
  
    // Add the proper class for the layout depending on if there is a category linked to the post
    $spansize         = '';   
    $spansize         = 'col-sm-12';
    $post_type        = get_post_type();
    $current_post_id  = get_the_ID();
    $menu_filter      = array();
  
    /* If its custom post then display those items in menu */
    if($post_type != 'post') 
    {
       $spansize                      = 'col-sm-8';       
       $menu_filter['post_type']      = $post_type ;
       $menu_filter['posts_per_page'] = 10;
       $menu_title                    = get_post_type_object( $post_type )->labels->name;
     
    } 
    else  /* If its category then display those items in menu */
    {
      $categories       = get_the_category();

      if(!empty($categories)) 
      {
        $menu_filter['category_name'] = $categories[0]->slug ;
        $menu_filter['posts_per_page'] = -1;
        $menu_title = $categories[0]->name;

        foreach ($categories as $category) 
        {
          $countcat = count($categories);
          if ($countcat == 1 && $category->slug == 'uncategorized') {
          // If there is no category linked then wordpress links the post to uncategorized
          // in that case we don't show the sidebar's related posts as links
            $spansize = 'col-sm-12';
          } else {
          // We need the sidebar with the related posts links
            $spansize = 'col-sm-8';
          }
        } // end foreach
      }
  }
   
?>

    <div class="<?php echo $spansize; ?>">
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
    // Wordpress shifts the 'uncategorized' category to be the last object in this array
    if ( $spansize == 'col-sm-8' ) :
?>
    <div class="col-sm-4">
      <br>
      <div class="well">
        <ul class="nav nav-pills nav-stacked">
        <li class="nav-header"><h3><?php echo $menu_title; ?></h3></li>
<?php
        $id = get_the_ID();
        // The Query
        query_posts( $menu_filter );
        // The Loop
        while ( have_posts() ) : the_post();
        if ($current_post_id == $id) {
?>
          <li class="active"><a href="<?php the_permalink() ?>" title="<?php the_title(); ?>"><?php the_title(); ?></a></li>
<?php
        } else {
?>
          <li><a href="<?php the_permalink() ?>" title="<?php the_title(); ?>"><?php the_title(); ?></a></li>
<?php
        }
        endwhile;
        // Reset Query
        wp_reset_query();
?>
        </ul>
      </div>
    </div>
<?php
    endif;
?>
    </div>
  </div>
