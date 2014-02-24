<?php get_header(); ?>

<div id="main-and-sidebar">
    <div class="container">
        <div class="row">
        	<div class="col-md-9 main">
				<h1><?php printf( __( 'Category: %s' ), '<span>' . single_cat_title( '', false ) . '</span>' ); ?></h1>
				<?php echo category_description(); /* displays the category's description from the Wordpress admin */ ?>

				<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
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
				<?php endwhile; else: ?>
					<div class="no-results">
						<p><strong><?php _e('There has been an error.'); ?></strong></p>
						<p><?php _e('We apologize for any inconvenience, please hit back on your browser or use the search form below.'); ?></p>
						<?php get_search_form(); /* outputs the default Wordpress search form */ ?>
					</div><!--noResults-->
				<?php endif; ?>

			</div>
			<div class="col-md-3 sidebar">
				<?php get_sidebar(); ?>
			</div>
		</div>
	</div>

</div><!--#main-and-sidebar-->
<?php get_footer(); ?>





