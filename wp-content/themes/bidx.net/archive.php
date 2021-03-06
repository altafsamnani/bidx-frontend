<?php get_header(); ?>

<div id="main-and-sidebar">
	<section id="page-title-wrapper" class="page-title-wrapper pattern-9 service ">
	    <div class="container">
			<h1>
				<?php if ( is_day() ) : /* if the daily archive is loaded */ ?>
					<?php printf( __( 'Daily: <span>%s</span>' ), get_the_date() ); ?>
				<?php elseif ( is_month() ) : /* if the montly archive is loaded */ ?>
					<?php printf( __( 'Monthly: <span>%s</span>' ), get_the_date('F Y') ); ?>
				<?php elseif ( is_year() ) : /* if the yearly archive is loaded */ ?>
					<?php printf( __( 'Yearly: <span>%s</span>' ), get_the_date('Y') ); ?>
				<?php else : /* if anything else is loaded, ex. if the tags or categories template is missing this page will load */ ?>
					Blog Archives
				<?php endif; ?>
			</h1>
	    </div>
	</section>
    <div class="container">
        <div class="row">
        	<div class="col-md-9 main">


				<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
					<div class="post pad-bottom-50 pad-top-25">

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
			                        <?php the_time('F j, Y'); ?>
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

				<div class="oldernewer">
					<p class="older"><?php next_posts_link('&laquo; Older Entries') ?></p>
					<p class="newer"><?php previous_posts_link('Newer Entries &raquo;') ?></p>
				</div><!--.oldernewer-->

			</div>
			<div class="col-md-3 sidebar">
				<?php get_sidebar(); ?>
			</div>
		</div>
	</div>

</div><!--#main-and-sidebar-->
<?php get_footer(); ?>
