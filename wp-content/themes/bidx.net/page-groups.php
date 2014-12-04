<?php
/*
 Template Name: Groups overview template
*/

get_header();
?>
<section id="page-title-wrapper" class="page-title-wrapper pattern-1 service">
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
            <div id="portfolio" class="main-wrapper">
                <section id="portfolio-3" class="pad-25 pattern-7">
                    <div class="container">
                        <div class="subpage-title">
                            <h5>Online Portals</h5>
                        </div>
                        <!-- /.portfolio-filter -->
                        <div class="row">
                            <div id="isotope-portfolio-container">

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo17.jpg" class="img-responsive" alt="Shape & Lead">
                                            <div class="image-overlay"></div>
                                            <a href="https://shapeandlead.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>Shape &amp; Lead</p>
                                            <p><small>Rwanda</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo16.png" class="img-responsive" alt="1st Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://ifdc-catalist-uganda.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>IFDC Catalist Uganda</p>
                                            <p><small>Uganda</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo7.png" class="img-responsive" alt="6th Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://cleancookstoves.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>Clean Cookstoves</p>
                                            <p><small>International</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo13.png" class="img-responsive" alt="1st Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://somalia-agrifood.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>Somalia Afrifood</p>
                                            <p><small>Somalia</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo11.png" class="img-responsive" alt="1st Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://somaliland-agrifood.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>Somaliland Afrifood</p>
                                            <p><small>Somalia</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo12.png" class="img-responsive" alt="1st Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://puntland-agrifood.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>Puntland Afrifood</p>
                                            <p><small>Somalia</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo14.png" class="img-responsive" alt="2nd Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://ozg.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>Ondernemen Zonder Grenzen</p>
                                            <p><small>The Netherlands</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo18.png" class="img-responsive" alt="1st Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://bti.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>BTI Palestine</p>
                                            <p><small>Palestine</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo1.png" class="img-responsive" alt="5th Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://poslovnicentarzvecan.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>BC Zvecan</p>
                                            <p><small>North-Kosovo</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo10.png" class="img-responsive" alt="1st Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://bscmonrovia.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>BSC Monrovia</p>
                                            <p><small>Liberia</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo8.png" class="img-responsive" alt="3rd Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://jcirwanda.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>JCI Rwanda</p>
                                            <p><small>Rwanda</small></p>
                                        </div>
                                    </div>
                                </div>
                                <!-- /.portfolio-item-wrapper -->

                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo15.png" class="img-responsive" alt="4th Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="http://demogroup.demo.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <p>Demo Group</p>
                                            <p><small>Demonstration</small></p>
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
                            <h2>
                                <?php echo _e('Contact us to get started', 'bidxtheme'); ?>
                            </h2>
                            <a href="/contact" type="button" class="btn btn-flat flat-warning btn-lg"><?php echo _e('Contact Us', 'bidxtheme'); ?></a>
                            <a href="/pricing" class="btn btn-flat btn-lg flat-primary"><?php echo _e('Pricing', 'bidxtheme'); ?></a>
                        </div>
                    </div>
                </section>
                <!-- /#portfolio-3 -->
            </div>

<?php get_footer(); ?>
