<?php get_header(); ?>
<section id="page-title-wrapper" class="page-title-wrapper pattern-1 service">
    <div class="container">
        <h1><?php the_title(); ?></h1>
    </div>
</section>
<div id="pricing-tables" class="main-wrapper">
    <section id="pricing-tables" class="pad-25 pattern-7">
        <div class="container">
            <?php the_content(); ?>
        </div>
    </section>
    <section class="pattern-3"> 
        <div class="container service pad-25">
            <div class="col-sm-12">
                <h2>
                    <?php echo _e('Find Out More About Add-Ons', 'bidxtheme'); ?>
                </h2>
                <a href="/support" type="button" class="btn btn-flat flat-primary btn-lg"><?php echo _e('Support', 'bidxtheme'); ?></a>
                <a href="/training" type="button" class="btn btn-flat flat-primary btn-lg"><?php echo _e('Training', 'bidxtheme'); ?></a>
            </div>
        </div>
    </section>
    <section>
        <div class="container service pad-25">
            <div class="col-sm-12">
                <h2>
                    <?php echo _e('Contact us to get started', 'bidxtheme'); ?>
                </h2>
                <a href="/get-started" type="button" class="btn btn-flat flat-warning btn-lg"><?php echo _e('Get started', 'bidxtheme'); ?></a>
            </div>
        </div>
    </section>
    <!-- /#pricing-tables -->
</div>
<?php get_footer(); ?>
