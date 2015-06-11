<?php
/*
 Template Name: Groups overview template
*/

get_header();
?>
<section id="page-title-wrapper" class="page-title-wrapper pattern-1 service">
    <div class="container">
        <?php edit_post_link('<small>Edit</small>','',''); ?>
        <h1><?php the_title(); ?></h1>
    </div>
</section>

<section class="free-trial">
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <div class="service">
                    <div class="trial-title"><?php _e('Get a 6 month free trial','bidxtheme');?></div>
                    <div class="trial-sub"><?php _e('Annual subscription starting at $1.999','bidxtheme');?></div>
                    <br>
                    <a href="/get-started" class="btn btn-flat flat-warning"><?php _e('I want to try','bidxtheme');?></a>
                    <a href="/pricing" class="btn btn-flat flat-warning"><?php _e('All Packages','bidxtheme');?></a>
                </div>
            </div>
        </div>
        <!-- /.row -->
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
<?php
                            // WP_Query arguments
                            $args = array (
                                'post_type'         => 'portal',
                                'post_status'       => 'publish',
                                'posts_per_page'    => '-1',
                                'meta_key'          => 'order_weight',
                                'orderby'           => 'meta_value_num',
                                'order'             => 'DESC'
                            );

                            // The Query
                            $portals = new WP_Query( $args );

                            // The Loop
                            if ( $portals->have_posts() ) {
                                while ( $portals->have_posts() ) {
                                    $portals->the_post();
?>
                                    <div class="col-xs-12 col-sm-6 col-md-4 portfolio-item-wrapper">
                                        <div class="portfolio-item">
                                            <div class="portfolio-thumb">
                                                <?php echo the_post_thumbnail( array( 'class' => ' img-responsive' ) ); ?>
                                                <div class="image-overlay"></div>
                                                <a href="<?php the_field('portal_link'); ?>" target="_blank" class="portfolio-zoom"><i class="fa fa-eye"></i> View</a>
                                            </div>
                                            <div class="portfolio-details">
                                                <p><?php echo the_title(); ?></p>
                                                <p><small><?php the_field('country'); ?></small></p>
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

                    </div>
                    <!-- /.container -->
                </section>
                <section>
                    <div class="container service pad-25">
                        <div class="col-sm-12">
                            <h2>
                                <?php echo _e('Contact us to get started', 'bidxtheme'); ?>
                            </h2>
                            <a href="/get-started" type="button" class="btn btn-flat flat-warning btn-lg"><?php echo _e('Get Started', 'bidxtheme'); ?></a>
                            <a href="/pricing" class="btn btn-flat btn-lg flat-primary"><?php echo _e('All Packages', 'bidxtheme'); ?></a>
                        </div>
                    </div>
                </section>
                <!-- /#portfolio-3 -->
            </div>

<?php get_footer(); ?>
