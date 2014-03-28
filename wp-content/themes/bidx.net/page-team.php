<?php get_header(); ?>
<div id="our-team" class="main-wrapper">


		<?php if ( have_posts() ) while ( have_posts() ) : the_post(); ?>
			<section id="page-title-wrapper" class="page-title-wrapper pattern-10 service">
			    <div class="container">
					<?php edit_post_link('<small>Edit Our Team page</small>','',''); ?>
			        <h1><?php the_title(); ?></h1>
			        <?php the_content(); ?>
			    </div>
			</section>


		<section id="team-3-columns" class="pad-top-50 ">
		    <div class="container">
<!-- 		        <div class="subpage-title">
		            <h5>Custom Tag</h5>
		        </div>
 -->				<div class="row">
<?php
					// WP_Query arguments
					$args = array (
						'post_type'			=> 'team',
						'post_status'		=> 'publish',
						'posts_per_page'         => '20',
					);

					// The Query
					$team_members = new WP_Query( $args );

					// The Loop
					if ( $team_members->have_posts() ) {
						while ( $team_members->have_posts() ) {
							$team_members->the_post();
?>
						<div class="col-sm-6 col-md-4 team-member-wrap">
							<div class="team-member">
								<div class="member-thumb">
		                            <?php echo the_post_thumbnail('bidx_medium'); ?>
		                        </div>
						        <div class="member-details">
						            <h4 class="member-name"><?php echo the_title(); ?></h4>
						            <span class="position"><?php echo $team_members->post->post_content ?></span>
						        </div>
						    </div>
						</div>
<?php
						}
					} else {
						// no posts found
					}

					// Restore original Post Data
					wp_reset_postdata();
?>
				</div>
		    </div>
		    <!-- /.container -->
		</section>
		<?php endwhile; ?>
	<div class="clear"></div>

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

</div><!--.container-->
<?php get_footer(); ?>
