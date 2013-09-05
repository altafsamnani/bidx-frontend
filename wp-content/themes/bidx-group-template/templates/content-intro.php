<?php

    $sessionData = BidxCommon::$staticSession;
    $entities = $sessionData->data->wp->entities;

    $authenticated=false;
    if ($sessionData->authenticated == 'true')
    {
        $authenticated=true;
    }
?>


<div class="outer-content-container">

<?php echo bidx_get_status_msgs(); ?>

    <!-- IMAGE Carousel -->
    <div id="myCarousel" class="carousel slide">
<?php
    $images = get_children(
    array(
    'post_parent' => $post->ID,
    'post_status' => 'inherit',
    'post_type' => 'attachment',
    'post_mime_type' => 'image',
    'order' => 'ASC',
    'orderby' => 'menu_order' )
    );

    if ( count( $images ) > 0 )
    {
?>
        <div class="outer-carousel-control-container">
            <div class="container">
                <ol class="carousel-indicators">
<?php
                $count = 0;
                foreach ( $images as $id => $image )
                {
?>
                    <li data-target="#myCarousel" data-slide-to="<?php echo $count ?>" <?php if ($count == 0) { ?>class="active" <?php } $count++; ?> ></li>
<?php
                }
?>
                </ol>

                <!-- Carousel nav -->
                <a class="carousel-control left" href="#myCarousel" data-slide="prev">&lsaquo;</a>
                <a class="carousel-control right" href="#myCarousel" data-slide="next">&rsaquo;</a>

            </div>
        </div>
        <!-- Carousel items -->
        <div class="carousel-inner">
<?php
        $count = 0;
        foreach ( $images as $id => $image )
        {
            $img = wp_get_attachment_image_src( $image->ID, 400 );
?>
            <div class="item <?php if ($count == 0) { ?>active<?php } $count++; ?>">
                <img class="img" src="<?php echo $img[0] ?>" />
<?php
                if ( !empty($image -> post_content) )
                {
 ?>
                <div class="outer-carousel-control-container">
                    <div class="container">
                        <div class="carousel-caption img-rounded ">

                            <?php echo $image -> post_content ?>


                        </div>
                    </div>
                </div>
<?php
                }
?>
            </div>
<?php
        }

    } // $images > 0
?>
        </div>


    </div>
    <!-- // IMAGE Carousel -->



<?php
    if ( $authenticated )
    {
?>
    <!-- logged in -->
    <div class="container">
        <div class="row-fluid">
            <div class="span8">

                <!-- NEWS BLOCK -->
                <div class="feature-block spacer">
                    <div class="feature-block-header bidx-theme-colour-one">
                        News & Events
                        <span class="pull-right"><a href="">view all</a></span>
                    </div>
                    <div class="feature-block-items">
                        <div class="row-fluid spacer">
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-news.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Qatar Frienship Fund announces four new projects</strong></div>
                                    <div>[ MM.DD.YY ]</div>
                                </div>
                            </div>
                            <!-- // feature item -->
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-news.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Five projects in the pipeline</strong></div>
                                    <div>[ MM.DD.YY ]</div>
                                </div>
                            </div>
                            <!-- // feature item -->
                        </div>
                        <div class="row-fluid spacer">
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-events.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>A year that brought hope, 2013</strong></div>
                                    <div>[ MM.DD.YY ]</div>
                                </div>
                            </div>
                            <!-- // feature item -->
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-news.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Why Masker is settings new global benchmarks</strong></div>
                                    <div>[ MM.DD.YY ]</div>
                                </div>
                            </div>
                            <!-- // feature item -->
                        </div>
                    </div>
                </div>

                <!-- BUSINESS BLOCK -->
                <div class="feature-block spacer">
                    <div class="feature-block-header bidx-theme-colour-one">
                        New Business
                        <span class="pull-right"><a href="">view all</a></span>
                    </div>
                    <div class="feature-block-items">
                        <div class="row-fluid spacer">
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Business name#</strong></div>
                                    <div>[ Industry ]</div>
                                    <div>[ Country of operations ]</div>
                                    <div>[ MM.DD.YY ]</div>
                                </div>
                            </div>
                            <!-- // feature item -->
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Business name#</strong></div>
                                    <div>[ Industry ]</div>
                                    <div>[ Country of operations ]</div>
                                    <div>[ MM.DD.YY ]</div>
                                </div>
                            </div>
                            <!-- // feature item -->
                        </div>
                        <div class="row-fluid spacer">
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Business name#</strong></div>
                                    <div>[ Industry ]</div>
                                    <div>[ Country of operations ]</div>
                                    <div>[ MM.DD.YY ]</div>
                                </div>
                            </div>
                            <!-- // feature item -->
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Business name#</strong></div>
                                    <div>[ Industry ]</div>
                                    <div>[ Country of operations ]</div>
                                    <div>[ MM.DD.YY ]</div>
                                </div>
                            </div>
                            <!-- // feature item -->
                        </div>
                    </div>
                </div>

                <!-- MEMBERS BLOCK -->
                <div class="feature-block spacer">
                    <div class="feature-block-header bidx-theme-colour-one">
                        New members in the group
                        <span class="pull-right"><a href="">view all</a></span>
                    </div>
                    <div class="feature-block-items">
                        <div class="row-fluid spacer">
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-members.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Member name#</strong></div>
                                    <div>[ Professional title ]</div>
                                    <div>[ Country ]</div>
                                    <div><span class="label bidx-label-investor">Investor</span></div>
                                </div>
                            </div>
                            <!-- // feature item -->
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-members.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Member name#</strong></div>
                                    <div>[ Professional title ]</div>
                                    <div>[ Country ]</div>
                                    <div><span class="label bidx-label-member">Member</span></div>
                                </div>
                            </div>
                            <!-- // feature item -->
                        </div>
                        <div class="row-fluid spacer">
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-members.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Member name#</strong></div>
                                    <div>[ Professional title ]</div>
                                    <div>[ Country ]</div>
                                    <div><span class="label bidx-label-entrepeneur">Entrepeneur</span></div>
                                </div>
                            </div>
                            <!-- // feature item -->
                            <!-- feature item -->
                            <div class="span6">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-members.png" alt="" align="left" class="img-circle">
                                <div>
                                    <div><strong>Member name#</strong></div>
                                    <div>[ Professional title ]</div>
                                    <div>[ Country ]</div>
                                    <div><span class="label bidx-label-member">Member</span></div>
                                </div>
                            </div>
                            <!-- // feature item -->
                        </div>
                    </div>
                </div>
            </div>



            <div class="span4 info-block">
                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/info-column.png" alt="">
            </div>
        </div>



    </div>


<?php
    }
    else
    {
 ?>
     <!-- Not logged in -->
    <div class="container">
        <div class="row-fluid spacer">
            <div class="span6">
                <a href="">
                    <img src="/wp-content/themes/bidx-group-template/assets/img/mock/group-register-investor.png" alt="">
                </a>
            </div>
            <div class="span6">
                <a href="">
                    <img src="/wp-content/themes/bidx-group-template/assets/img/mock/group-register-entrepeneur.png" alt="">
                </a>
            </div>
        </div>

        <div class="row-fluid spacer">
            <div class="span12">
                <img src="/wp-content/themes/bidx-group-template/assets/img/mock/group-about-us.png" alt="">
            </div>
        </div>
    </div>
    <!-- // container -->

    <div class="feature-container bidx-theme-colour-one spacer">
        <div class="container">
            <div class="row-fluid">

                <div class="span4 feature-col">
                    <h2>New Business</h2>
                    <div class="feature-col-items">
                        <!-- feature item -->
                        <div class="clearfix spacer">
                            <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png" alt="" align="left">
                            <div>
                                <div><strong>Business name#</strong></div>
                                <div>[ Industry ]</div>
                                <div>[ Country of operations ]</div>
                            </div>
                        </div>
                        <!-- // feature item -->

                        <!-- feature item -->
                        <div class="clearfix spacer">
                            <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png" alt="" align="left">
                            <div>
                                <div><strong>Business name#</strong></div>
                                <div>[ Industry ]</div>
                                <div>[ Country of operations ]</div>
                            </div>
                        </div>
                        <!-- // feature item -->

                                                                        <!-- feature item -->
                        <div class="clearfix spacer">
                            <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png" alt="" align="left">
                            <div>
                                <div><strong>Business name#</strong></div>
                                <div>[ Industry ]</div>
                                <div>[ Country of operations ]</div>
                            </div>
                        </div>
                        <!-- // feature item -->
                    </div>
                </div>

                <div class="span4 feature-col">
                    <h2>New Members</h2>
                    <div class="feature-col-items">
                        <!-- feature item -->
                        <div class="clearfix spacer">
                            <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-members.png" alt="" align="left">
                            <div>
                                <div><strong>Member name#</strong></div>
                                <div>[ Professional title ]</div>
                                <div>[ Country ]</div>
                            </div>
                        </div>
                        <!-- // feature item -->

                        <!-- feature item -->
                        <div class="clearfix spacer">
                            <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-members.png" alt="" align="left">
                            <div>
                                <div><strong>Member name#</strong></div>
                                <div>[ Professional title ]</div>
                                <div>[ Country ]</div>
                            </div>
                        </div>
                        <!-- // feature item -->

                                                                        <!-- feature item -->
                        <div class="clearfix spacer">
                            <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-members.png" alt="" align="left">
                            <div>
                                <div><strong>Member name#</strong></div>
                                <div>[ Professional title ]</div>
                                <div>[ Country ]</div>
                            </div>
                        </div>
                        <!-- // feature item -->
                    </div>
                </div>

                <div class="span4 feature-col">
                    <h2>News & Events</h2>
                    <div class="feature-col-items">
                        <!-- feature item -->
                        <div class="clearfix spacer">
                            <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-news.png" alt="" align="left">
                            <div>
                                <div><strong>Qatar Frienship Fund announces four new projects</strong></div>
                                <div>[ MM.DD.YY ]</div>
                            </div>
                        </div>
                        <!-- // feature item -->

                        <!-- feature item -->
                        <div class="clearfix spacer">
                            <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-events.png" alt="" align="left">
                            <div>
                                <div><strong>A year that brought hope 2013</strong></div>
                                <div>[ MM.DD.YY ]</div>
                            </div>
                        </div>
                        <!-- // feature item -->

                                                                        <!-- feature item -->
                        <div class="clearfix spacer">
                            <img src="/wp-content/themes/bidx-group-template/assets/img/mock/new-news.png" alt="" align="left">
                            <div>
                                <div><strong>Five projects in the pipeline</strong></div>
                                <div>[ MM.DD.YY ]</div>
                            </div>
                        </div>
                        <!-- // feature item -->
                    </div>
                </div>

            </div>
        </div>
    </div>

    <div class="container join-our-group-block">
        <div class="row-fluid spacer">
            <div class="offset4 span4 center">
                    <a href="/auth/#auth/register" class="btn btn-primary bidx-theme-colour-two"><?php _e('Join our group','bidxtheme');?></a>
                    <span>Already have an account? Just <a href="/auth/#auth/login">login</a></span>
            </div>
        </div>

    </div>
    <!-- // container -->
 <?php
    }
  ?>


</div>
<!-- // outer-content-container -->




<!-- $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
     $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ARCHIVED CODE   $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
     $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ -->



<script type="text/archive">


    <div class="container">
<?php
        if ( $authenticated )
        {
?>
            <div class="span3">
<?php

            // Create investor
            //
            if ( !isset( $entities->bidxInvestorProfile ))
            {
?>
                <div class="well">
                    <h3><?php _e('Become an investor','bidxtheme')?></h3>
                    <div class="row-fluid">
                        <div class="span8">
                            <p><?php _e('Create your business','bidxtheme')?></p>
                        </div>
                        <div class="span4">
                            <a class="btn btn-primary" href="/member/#createInvestor"><?php _e('Create','bidxtheme')?></a>
                        </div>
                    </div>
                </div>
<?php
            }

            // Create entrepreneur
            //
            if ( !isset( $entities->bidxEntrepreneurProfile ))
            {
?>
                <div class="well">
                    <h3><?php _e('Become an entrepreneur')?></h3>
                    <div class="row-fluid">
                        <div class="span8">
                            <p><?php _e('Create your business')?></p>
                        </div>
                        <div class="span4">
                            <a class="btn btn-primary" href="/member/#createEntrepreneur"><?php _e('Create','bidxtheme')?></a>
                        </div>
                    </div>
                </div>
<?php
            }

?>
            </div>
<?php
        }
?>



<?php
        if ( ! $authenticated )
        {
?>
            <div class="entry-content">
                <?php echo do_shortcode( '[bidx app="group" view="group-intro"]' ); ?>
            </div>
            <div class="entry-content">
                <div class="row-fluid after-well" >
                    <div class="span12 text-center">
                        <a class="btn" href="/login?join=true"><?php _e('Join our group','bidxtheme')?></a> <?php printf(__('Already have an account? Just %1$s','bidxtheme'),'<a href="/login">login</a>');?>
                    </div>
                </div>
            </div>
<?php
        }
        else
        {
            // Logged in but not joined this group
            //
?>
            <div class="entry-content">
                <?php echo do_shortcode( '[bidx app="group" view="join-group"]' ); ?>
            </div>
<?php
    }
?>


        <div class="entry-content">
            <div class="row-fluid">
                <div class="well">
                    <h4><?php _e('News and Events','bidxtheme')?></h4>
                    <div class="row-fluid">
<?php
                    $args=array(
                      'post_type' => 'post',
                      'post_status' => 'publish',
                      'posts_per_page' => 2
                      );
                    $my_query = null;
                    $my_query = new WP_Query($args);

                    if( $my_query->have_posts() )
                    {
                        while ( $my_query->have_posts() )
                        {
                            $my_query->the_post();
?>
                            <div class="span6 ">
                                <div class="media member-thumb img-rounded">
                                    <a class="pull-left" href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>">
<?php
                                    if ( has_post_thumbnail() )
                                    {
                                        $size = array(100,100);
                                        $atts = array('data-src' => 'holder.js/50x50/social/auto/text:News',
                                                      'class' => 'media-object img-rounded');
                                        the_post_thumbnail($size, $atts);
                                    }
                                    else
                                    {
?>
                                      <img data-src="holder.js/50x50/social/auto/text:None" class="media-object img-rounded" />
<?php
                                    }
?>
                                    </a>
                                    <div class="media-body centering">
                                        <h4><a href="<?php the_permalink() ?>"><?php the_title(); ?></a></h4>
                                        <p><?php the_excerpt(); ?></p>
                                    </div>
                                </div>
                            </div>
<?php
                        }
                    }
                    wp_reset_query();
?>
                    </div>
                </div>
            </div>
        </div>

        <div class="entry-content group-members">
            <?php echo do_shortcode( '[bidx app="group" view="last-members"]' ); ?>
        </div>

    </div>
    <!-- // container -->

</div>
</script>