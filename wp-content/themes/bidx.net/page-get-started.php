<?php
/*
 Template Name: Competitions overview template
*/

get_header(); ?>

<section id="page-title-wrapper" class="page-title-wrapper pattern-3 service">
    <div class="container">
        <?php edit_post_link('<small>Edit Our Team page</small>','',''); ?>
        <h1><?php the_title(); ?></h1>
    </div>
</section>

<div class="container">
	<div id="content">
		<?php if ( have_posts() ) while ( have_posts() ) : the_post(); ?>
			<div id="post-<?php the_ID(); ?>" <?php post_class('page'); ?>>
				<article>
					<?php if ( has_post_thumbnail() ) { /* loades the post's featured thumbnail, requires Wordpress 3.0+ */ echo '<div class="featured-thumbnail">'; the_post_thumbnail(); echo '</div>'; } ?>

					<div class="post-content page-content pad-25">
						<?php the_content(); ?>
						<?php wp_link_pages('before=<div class="pagination">&after=</div>'); ?>
					</div><!--.post-content .page-content -->
				</article>

			</div><!--#post-# .post-->

		<?php endwhile; ?>
	</div><!--#content-->
</div>
<section>
    <div class="container service pad-25">
        <div class="col-sm-12">
            <h2>
                <?php echo _e('Contact us to get started', 'bidxtheme'); ?>
            </h2>
            <a href="/contact" type="button" class="btn btn-flat flat-warning btn-lg"><?php echo _e('Contact Us', 'bidxtheme'); ?></a>
        </div>
    </div>
</section>


<?php get_footer(); ?>
