<?php get_header(); ?>

<div id="main-and-sidebar">
		<?php if ( have_posts() ) while ( have_posts() ) : the_post(); ?>
			<section id="page-title-wrapper" class="page-title-wrapper pattern-7 service">
			    <div class="container">
					<?php edit_post_link('<small>Edit Blog page</small>','',''); ?>
			        <h1><?php the_title(); ?></h1>
			        <?php the_content(); ?>
			    </div>
			</section>
		<?php endwhile; ?>
    <div class="container">
        <div class="row">
        	<div class="col-md-9 main">
        		<div class="post-wrapper">
<?php
					// WP_Query arguments
					$args = array (
						'post_type'			=> 'post',
						'post_status'		=> 'publish',
						'posts_per_page' 		=> 3,
					);

					// The Query
					$blog_posts = new WP_Query( $args );
?>
					<?php if ( $blog_posts->have_posts() ) while ( $blog_posts->have_posts() ) : $blog_posts->the_post(); ?>
						<div class="post pad-bottom-50">

							<?php if ( has_post_thumbnail() ) {
								/* loades the post's featured thumbnail, requires Wordpress 3.0+ */
								echo '<div class="post-thumb">'; the_post_thumbnail('bidx_large', array('class' => 'img-responsive')); echo '</div>';
							} ?>

							<?php edit_post_link('<small>Edit this entry</small>','',''); ?>
							<h2><a href="<?php the_permalink() ?>" title="<?php the_title(); ?>" rel="bookmark"><?php the_title(); ?></a></h2>

				            <div class="post-meta">
				                <ul class="meta-list">
				                    <li>
				                        <span><?php _e('Posted on '); ?></span>
				                        <a href="#"><?php the_time('F j, Y'); _e(' at '); the_time() ?></a>
				                    </li>
				                    <li>
				                        <span><?php _e('By ');?></span>
				                        <a href="#"><?php the_author_posts_link() ?></a>
				                    </li>
				                    <li>
				                        <span><?php _e('In ');?></span>
										<?php the_category(', '); ?>
				                    </li>
				                </ul>
				            </div>
				            <!-- /.post-meta -->
							<?php echo the_excerpt(); ?>

						</div><!-- #post-## -->
					<?php endwhile; /* end loop */ ?>
					<?php wp_reset_postdata();  ?>
				</div>
			</div>

			<div class="col-md-3 sidebar">
				<?php get_sidebar(); ?>
			</div>
		</div>
	</div>
</div><!--#main-and-sidebar-->

<?php get_footer(); ?>
