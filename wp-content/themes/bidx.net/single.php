<?php get_header(); ?>
<div id="main-and-sidebar">
    <div class="container">
        <div class="row">
        	<div class="col-md-9 main">
        		<div class="post-wrapper">
					<?php if ( have_posts() ) while ( have_posts() ) : the_post(); ?>
						<div class="post">

							<?php if ( has_post_thumbnail() ) {
								/* loades the post's featured thumbnail, requires Wordpress 3.0+ */
								echo '<div class="post-thumb">'; the_post_thumbnail('large', array('class' => 'img-responsive')); echo '</div>';
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
							<?php the_content(); ?>

						</div><!-- #post-## -->

						<div class="newer-older">
							<p class="older "><?php previous_post_link('%link', '&laquo; Previous post') ?>
							<p class="newer "><?php next_post_link('%link', 'Next Post &raquo;') ?></p>
						</div><!--.newer-older-->

						<?php // comments_template( '', true ); ?>

					<?php endwhile; /* end loop */ ?>
				</div>
			</div>

			<div class="col-md-3 sidebar">
				<?php get_sidebar(); ?>
			</div>
		</div>
	</div>
</div><!--#main-and-sidebar-->
<?php get_footer(); ?>
