<?php

    $sessionData = BidxCommon::$staticSession;
    $entities = $sessionData->data->wp->entities;

    $authenticated=false;
    if ($sessionData->authenticated == 'true') {
        $authenticated=true;
    }
?>


<div class="outer-content-container">
<div class="container">

    <?php echo bidx_get_status_msgs(); ?>
</div>
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

    if ( count( $images ) > 0 ) {
?>
        <div class="outer-carousel-control-container">
            <div class="container">
                <ol class="carousel-indicators">
<?php
                $count = 0;
                foreach ( $images as $id => $image ) {
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
        foreach ( $images as $id => $image ) {
            $img = wp_get_attachment_image_src( $image->ID, 400 );
?>
            <div class="item <?php if ($count == 0) { ?>active<?php } $count++; ?>">
                <img class="img" src="<?php echo $img[0] ?>" />
<?php
                if ( !empty($image -> post_content) ) {
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
    if ( $authenticated ) {
?>
    <!-- #########################################################################
                                logged in
    ###########################################################################-->

    <div class="container">
        <div class="row-fluid">

            <!-- CONTENT B;ock -->
            <div class="span8">

                <!-- NEWS BLOCK -->
                <div class="feature-block spacer">


                    <div class="feature-block-header bidx-theme-colour-one">
                        <?php _e('News and Events','bidxtheme')?>
                        <span class="pull-right"><a href=""><?php _e('view all','bidxtheme')?></a></span>
                    </div>
                    <div class="feature-block-items">
                        <div class="bidx-latest-news clearfix">

                            <!-- Grab news -->
                            <?php echo do_shortcode( '[bidx app="group" view="latest-news"]' ); ?>

                        </div>
                    </div>
                </div>

                <!-- BUSINESS BLOCK -->
                <div class="feature-block spacer">
                    <div class="feature-block-header bidx-theme-colour-one">
                        <?php _e('News Business','bidxtheme')?>
                        <span class="pull-right"><a href=""><?php _e('view all','bidxtheme')?></a></span>
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
                    </div>
                </div>

                <!-- MEMBERS BLOCK -->
                <div class="feature-block spacer">
                    <div class="feature-block-header bidx-theme-colour-one">
                        <?php _e('New members in the group','bidxtheme')?>
                        <span class="pull-right"><a href=""><?php _e('view all','bidxtheme')?></a></span>
                    </div>
                    <div class="feature-block-items">
                        <div class="bidx-latest-members clearfix">
                        <!-- Grab latests members -->
                        <?php echo do_shortcode( '[bidx app="group" view="last-members"]' ); ?>
                        </div>

                    </div>
                </div>
            </div>


            <!-- SIDE BAR -->
            <div class="span4 side-bar">
                <div class="row-fluid">
                    <div class="span12">
                        <h2>Create and grow</h2>

                        <div class="call-to-action clearfix">
                            <div class="pull-left">
                                <div><strong>Become an entrepeneur</strong></div>
                               <em>Create your business</em>
                            </div>
                            <a href="" class="btn btn-primary bidx-theme-colour-one pull-right"><i class="bidx-plus"></i>Create</a>
                        </div>

                        <div class="call-to-action clearfix">
                            <div class="pull-left">
                                <div><strong>Become an investor</strong></div>
                                <em>Create your resources</em>
                            </div>
                            <a href="" class="btn btn-primary bidx-theme-colour-one pull-right"><i class="bidx-plus"></i>Invest</a>
                        </div>

                        <hr>

                        <div class="call-to-action transparent clearfix">
                            <div>
                                <div class="pull-left">
                                   <h2>People near you</h2>
                                </div>
                                <div class="btn-group pull-right bidx-btn-split">
                                    <button class="btn">Show all</button>
                                    <button class="btn dropdown-toggle" data-toggle="dropdown">
                                    <span class="caret"></span>
                                    </button>
                                    <ul class="dropdown-menu">
                                    <!-- dropdown menu links -->
                                    </ul>
                                </div>
                            </div>
                            <iframe width="100%" height="140" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?f=q&amp;source=s_q&amp;hl=nl&amp;geocode=&amp;q=Bidx+B.V.,+De+Ruijterkade,+Amsterdam,+Nederland&amp;aq=0&amp;oq=Bidx&amp;sll=37.0625,-95.677068&amp;sspn=60.158465,135.263672&amp;t=h&amp;ie=UTF8&amp;hq=bidx+bv&amp;hnear=De+Ruijterkade,+Amsterdam,+Nederland&amp;ll=52.37787,4.905348&amp;spn=0.006295,0.014329&amp;output=embed"></iframe>
                            <span class="label bidx-label-member">Entrepeneur</span>
                            <span class="label bidx-label-entrepeneur">Entrepeneur</span>
                            <span class="label bidx-label-investor">Entrepeneur</span>
                        </div>

                        <hr>


                        <div class="call-to-action clearfix">
                            <div class="pull-left ">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/icons/icon-members-large.png" alt="">
                            </div>
                            <div class="pull-right">
                                <div><strong>Tagline group goes here.</strong></div>
                                <button class="btn btn-bidx-transparent-circle"><span class="bidx-theme-colour-one"><i class="bidx-plus-white-transparent"></i></span>join group</button>
                            </div>
                        </div>
                        <div class="call-to-action clearfix">
                            <div class="pull-left ">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/icons/icon-members-large.png" alt="">
                            </div>
                            <div class="pull-right">
                                <div><strong>Tagline group goes here.</strong></div>
                                <button class="btn btn-bidx-transparent-circle"><span class="bidx-theme-colour-one"><i class="bidx-plus-white-transparent"></i></span>join group</button>
                            </div>
                        </div>
                        <div class="call-to-action clearfix">
                            <div class="pull-left ">
                                <img src="/wp-content/themes/bidx-group-template/assets/img/icons/icon-members-large.png" alt="">
                            </div>
                            <div class="pull-right">
                                <div><strong>Tagline group goes here.</strong></div>
                                <button class="btn btn-bidx-transparent-circle"><span class="bidx-theme-colour-one"><i class="bidx-plus-white-transparent"></i></span>join group</button>
                            </div>
                        </div>


                        <div class="call-to-action transparent clearfix">
                            <div class="pull-left">
                                <a href="">Create a group</a>
                            </div>
                            <div class="pull-right">
                                <a href="">Search for other groups</a>
                            </div>
                        </div>


                    </div>

                </div>
            </div>
        </div>



    </div>


<?php
    } else {
 ?>
    <!-- #########################################################################
                                Not logged in
    ###########################################################################-->

    <div class="container">
        <div class="row-fluid">
            <div class="span6 bidx-register-c2a investor spacer">
                <div class="bidx-arrow-right">
                    <div class="c2a-label">Register as<br/> INVESTOR</div>
                </div>
            </div>
            <div class="span6 bidx-register-c2a entrepeneur spacer">
                <div class="bidx-arrow-right">
                    <div class="c2a-label">Register as<br/> ENTREPENEUR</div>
                </div>

            </div>
        </div>

        <div class="row-fluid spacer testimonial-container">
            <div class="span8">
                <h1>New business</h1>
                <p>
                    <img data-src="holder.js/140x140" class="img-circle" alt="140x140" style="width: 140px; height: 140px;" align="right">
                    <strong>Immediately after the Great Earthquake and Tsunami of 11th March 2011, H.H. Sheikh Hamad Bin Khalifa Al-Thani (Emir of the State of Qatar) announced a USD 100 million gift to Japan.</strong>
                    To assist relief efforts and accelerate the recovery of victims.  He also ordered the formation of a 24-hour task force within Qatar Petroleum Company, to provide necessary assistance to Japan under direct supervision of H.H Sheikh Tamim Bin Hamad Al-Thani, Heir Apparent of the State of Qatar.

                </p>

            </div>
            <div class="span4">
                <div class="bidx-testimonial pull-right">
                    <div>
                    Client can post a mission and or vision about their business in this red box.  It’s a fixed height box. Text may not exceed the boundaries in the example text given.
                    </div>
                </div>

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
                        <div class="bidx-latest-members clearfix">
                            <!-- Grab latests members -->
                            <?php echo do_shortcode( '[bidx app="group" view="last-members" span="12"]' ); ?>
                        </div>
                    </div>
                </div>

                <div class="span4 feature-col">
                    <h2>News & Events</h2>
                    <div class="feature-col-items">
                        <div class="bidx-latest-news clearfix">
                            <!-- Grab news -->
                            <?php echo do_shortcode( '[bidx app="group" view="latest-news" span="12"]' ); ?>
                        </div>
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
        if ( $authenticated ) {
?>
            <div class="span3">
<?php

            // Create investor
            //
            if ( !isset( $entities->bidxInvestorProfile )) {
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
            if ( !isset( $entities->bidxEntrepreneurProfile )) {
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
        if ( ! $authenticated ) {
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
        } else {
            // Logged in but not joined this group
            //
?>
            <div class="entry-content">
                <?php echo do_shortcode( '[bidx app="group" view="join-group"]' ); ?>
            </div>
<?php
    }
?>


   /*     <div class="entry-content">
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

                    if( $my_query->have_posts() ) {
                        while ( $my_query->have_posts() ) {
                            $my_query->the_post();
?>
                            <div class="span6 ">
                                <div class="media member-thumb img-rounded">
                                    <a class="pull-left" href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>">
<?php
                                    if ( has_post_thumbnail() ) {
                                        $size = array(100,100);
                                        $atts = array('data-src' => 'holder.js/50x50/social/auto/text:News',
                                                      'class' => 'media-object img-rounded');
                                        the_post_thumbnail($size, $atts);
                                    } else {
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
*/
        <div class="entry-content group-members">

            <?php echo do_shortcode( '[bidx app="group" view="last-members"]' ); ?>
        </div>

    </div>
    <!-- // container -->

</div>
</script>