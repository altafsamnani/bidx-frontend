<footer id="footer-1" class="footer">
    <div class="container">
        <div class="row">
            <div class="col-md-3">
                <div class="widget about-us">
                    <div class="footer-brand"><?php _e('<span>bidx</span>.net','bidxtheme');?></div>
                    <p><?php _e('Grow your local business network and create new jobs. Your economy depends on it!','bidxtheme');?></p>
                </div>
                <!-- /.about-us -->
                <div class="widget stay-connedted">
                    <div class="subpage-title">
                        <h5><?php _e('Stay Connected','bidxtheme');?></h5>
                    </div>
                    <ul class="social-links">
                        <li><a target="_blank" class="facebook" href="//www.facebook.com/bidx"><i class="fa fa-facebook"></i></a></li>
                        <!-- <li><a target="_blank" class="google-plus" href="#"><i class="fa fa-google-plus"></i></a></li> -->
                        <li><a target="_blank" class="twitter" href="//twitter.com/bid_x"><i class="fa fa-twitter"></i></a></li>
                        <li><a target="_blank" class="linkedin" href="//www.linkedin.com/company/2999232"><i class="fa fa-linkedin"></i></a></li>
                    </ul>
                </div>
            </div>
            <!-- /.col-md-3 -->
            <div class="col-md-3">
                <div class="widget popular-posts">
                    <div class="subpage-title">
                        <h5><?php _e('Recent Articles','bidxtheme');?></h5>
                    </div>
                    <ul class="recent-posts">
<?php
					// WP_Query arguments
					$args = array (
						'post_type'			=> 'post',
						'post_status'		=> 'publish',
						'posts_per_page' 		=> 3,
					);

					// The Query
					$recent_posts = new WP_Query( $args );

					// The Loop
					if ( $recent_posts->have_posts() ) {
						while ( $recent_posts->have_posts() ) {
							$recent_posts->the_post();
?>
                        <li>
                            <?php echo the_post_thumbnail('bidx_thumb'); ?>
                            <h5>
                                <a href="<?php echo the_permalink(); ?>"><?php echo the_title(); ?></a>
                            </h5>
                        </li>
<?php
						}
					} else {
						// no posts found
					}

					// Restore original Post Data
					wp_reset_postdata();
?>
                    </ul>
                </div>
                <!-- /.popular-posts -->
            </div>
            <!-- /.col-md-3 -->
                <div class="col-md-6">
                    <div class="widget">
                        <div class="subpage-title">
                            <h5><?php _e('Testimonials','bidxtheme');?></h5>
                            <!-- Controls -->
                            <div class="controls">
                                <span id="testimonials-prev" class="prev"><i class="fa fa-angle-left"></i></span>
                                <span id="testimonials-next" class="next"><i class="fa fa-angle-right"></i></span>
                            </div>
                        </div>
                        <div id="caroufredsel-testimonials-container">
<?php
                        // WP_Query arguments
                        $args = array (
                            'post_type'         => 'testimonial',
                            'post_status'       => 'publish',
                            'posts_per_page'        => 3,
                        );

                        // The Query
                        $testimonials = new WP_Query( $args );

                        // The Loop
                        if ( $testimonials->have_posts() ) {
                            while ( $testimonials->have_posts() ) {
                                $testimonials->the_post();
?>
                            <div class="testimonial">
                                <div class="testimonial-content">
                                    <p><?php echo $testimonials->post->post_content ?></p>
                                </div>
                                <div class="testimonial-author">
                                    <?php echo the_post_thumbnail('bidx_thumb', array('class' => 'user-thumb')); ?>
                                    <span class="user"><?php echo the_title(); ?></span>
                                    <span class="user-info"><?php echo the_excerpt(); ?></span>
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
                </div>
            <!-- /.col-md-6 -->
        </div>
        <!-- /.row -->
    </div>
    <!-- /.container -->
</footer>
<!-- /#footer-1 -->




<footer id="footer-2" class="footer">
    <div class="container">
        <div class="row">
            <div class="col-xs-12 col-sm-6 footer-info-wrapper">
                <span><?php _e('bidx.net © 2014. All Rights Reserved.','bidxtheme');?></span>
            </div>
            <!-- /.footer-info-wrapper -->
            <div class="col-xs-12 col-sm-6 footer-links-wrapper">
                <ul class="list-inline">
                    <li><a href="/terms-and-conditions"><?php _e('Terms and Conditions','bidxtheme');?></a></li>
                </ul>
            </div>
            <!-- /.footer-links-wrapper -->
        </div>
        <!-- /.row -->
    </div>
    <!-- /.container -->
</footer>
<!-- /#footer-2 -->



</div><!--#main-->
<?php // wp_footer(); /* this is used by many Wordpress features and plugins to work properly */ ?>
    <script src="<?php bloginfo( 'template_url' ); ?>/assets/js/froogaloop2.min.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/js/jquery-migrate-1.2.1.min.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/bootstrap/js/bootstrap.min.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/rs-plugin/js/jquery.themepunch.revolution.min.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/carouFredSel-6.2.1/jquery.carouFredSel-6.2.1.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/prettyPhoto/js/jquery.prettyPhoto.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/jflickrfeed/jflickrfeed.min.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/UItoTop/js/easing.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/UItoTop/js/jquery.ui.totop.min.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/isotope-site/jquery.isotope.min.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/FitVids.js/jquery.fitvids.js"></script>
	<script src="<?php bloginfo( 'template_url' ); ?>/assets/js/script.js"></script>


</body>
</html>
