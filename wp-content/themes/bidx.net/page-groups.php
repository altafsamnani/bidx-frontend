<?php
/*
 Template Name: Groups overview template
*/

get_header();
?>
<div class="container">
	<div id="content">
		<?php if ( have_posts() ) while ( have_posts() ) : the_post(); ?>
			<div id="post-<?php the_ID(); ?>" <?php post_class('page'); ?>>
				<article>
					<h1><?php the_title(); ?></h1>
					<?php edit_post_link('<small>Edit this entry</small>','',''); ?>
					<?php if ( has_post_thumbnail() ) { /* loades the post's featured thumbnail, requires Wordpress 3.0+ */ echo '<div class="featured-thumbnail">'; the_post_thumbnail(); echo '</div>'; } ?>

					<div class="post-content page-content">
						<?php the_content(); ?>
						<?php wp_link_pages('before=<div class="pagination">&after=</div>'); ?>
					</div><!--.post-content .page-content -->
				</article>

			</div><!--#post-# .post-->

		<?php endwhile; ?>
	</div><!--#content-->
</div>
            <div id="portfolio" class="main-wrapper">
                <section id="portfolio-3" class="pad-25 pattern-7">
                    <div class="container">
<!--                         <ul class="portfolio-filter nav nav-pills">
                            <li class="active"><a href="#" data-filter="*">All</a></li>
                            <li><a href="#" data-filter=".artwork">Africa</a></li>
                            <li><a href="#" data-filter=".creative">Asia</a></li>
                            <li><a href="#" data-filter=".nature">Middle East</a></li>
                            <li><a href="#" data-filter=".outside">Latin America</a></li>
                            <li><a href="#" data-filter=".photography">Europe</a></li>
                        </ul>
 -->                        <!-- /.portfolio-filter -->
                        <div class="row">
                            <div id="isotope-portfolio-container">
                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper artwork creative">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="assets/img/blog/logo1.png" class="img-responsive" alt="1st Portfolio Thumb">
                                        </div>
                                        <div class="portfolio-details">
                                            <h5>1st Group name</h5>
                                            <p>Group Function.</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->
                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper nature outside">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="assets/img/blog/logo2.png" class="img-responsive" alt="2nd Portfolio Thumb">
                                        </div>
                                        <div class="portfolio-details">
                                            <h5>2nd Group name</h5>
                                            <p>Group Function.</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->
                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper photography artwork">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="assets/img/blog/logo3.png" class="img-responsive" alt="3rd Portfolio Thumb">
                                        </div>
                                        <div class="portfolio-details">
                                            <h5>3rd Group name</h5>
                                            <p>Group Function.</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->
                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper creative nature">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="assets/img/blog/logo4.png" class="img-responsive" alt="4th Portfolio Thumb">
                                        </div>
                                        <div class="portfolio-details">
                                            <h5>4th Group name</h5>
                                            <p>Group Function.</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->
                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper nature">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="assets/img/blog/logo5.png" class="img-responsive" alt="5th Portfolio Thumb">
                                        </div>
                                        <div class="portfolio-details">
                                            <h5>5th Group name</h5>
                                            <p>Group Function.</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->
                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper artwork creative">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="assets/img/blog/logo6.png" class="img-responsive" alt="6th Portfolio Thumb">
                                        </div>
                                        <div class="portfolio-details">
                                            <h5>6th Group name</h5>
                                            <p>Group Function.</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->
                            </div>
                            <!-- /.isotope-portfolio-container -->
                        </div>
                        <!-- /.row -->
                    </div>
                    <!-- /.container -->
                </section>
                <section>
                    <div class="container service pad-25">
                        <div class="col-sm-12">
                            <h2>Want to create a Group with bidX?<br>Contact us to get started</h2>
                             <button type="button" class="btn btn-flat flat-warning btn-lg btn-bordered">Contact Us</button>
                        </div>
                    </div>
                </section>
                <!-- /#portfolio-3 -->
            </div>

<?php get_footer(); ?>
