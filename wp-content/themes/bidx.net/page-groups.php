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
                            <h5>Online Groups</h5>
                        </div>
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
                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo17.jpg" class="img-responsive" alt="Shape & Lead">
                                            <div class="image-overlay"></div>
                                            <a href="https://shapeandlead.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <!-- <h5>2nd Group name</h5> -->
                                            <p>Shape & Lead</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                    <div class="portfolio-item">
                                        <div class="portfolio-thumb">
                                            <img src="<?php bloginfo( 'template_url' ); ?>/assets/img/blog/logo14.png" class="img-responsive" alt="2nd Portfolio Thumb">
                                            <div class="image-overlay"></div>
                                            <a href="https://ozg.bidx.net" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                        </div>
                                        <div class="portfolio-details">
                                            <!-- <h5>2nd Group name</h5> -->
                                            <p>Ondernemen Zonder Grenzen</p>
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
                                            <!-- <h5>1st Group name</h5> -->
                                            <p>Clean Cookstoves</p>
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
                                            <!-- <h5>5th Group name</h5> -->
                                            <p>BC Zvecan</p>
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
                                            <!-- <h5>6th Group name</h5> -->
                                            <p>BSC Monrovia</p>
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
                                            <!-- <h5>3rd Group name</h5> -->
                                            <p>JCI Rwanda</p>
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
                                            <!-- <h5>4th Group name</h5> -->
                                            <p>Demo Group</p>
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
                                            <!-- <h5>6th Group name</h5> -->
                                            <p>Somaliland Afrifood</p>
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
                                            <!-- <h5>6th Group name</h5> -->
                                            <p>Puntland Afrifood</p>
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
                                            <!-- <h5>6th Group name</h5> -->
                                            <p>Somalia Afrifood</p>
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
