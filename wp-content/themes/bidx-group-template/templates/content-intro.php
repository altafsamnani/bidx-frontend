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
                <img class="img-rounded" src="<?php echo $img[0] ?>" />
                <div class="carousel-caption img-rounded">
                    <h4><?php echo $image -> post_title ?></h4>
                    <p><?php echo $image -> post_content ?></p>
                </div>
            </div>
<?php
        }

    } // $images > 0
?>
        </div>


    </div>
    <!-- // IMAGE Carousel -->


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
<!-- // outer-content-container -->
