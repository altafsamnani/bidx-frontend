<div class="container outer-content-container">
	<article class="bidx type-bidx status-publish hentry">
        <?php echo bidx_get_status_msgs(); ?>
	    <header>
            <div class="row-fluid">
                <div class="span<?php echo is_user_logged_in() ? '9' : '12'; ?>">
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
        						<ol class="carousel-indicators">
        						<?php
        							$count = 0;
        							foreach ( $images as $id => $image ) { ?>
        							<li data-target="#introCarousel" data-slide-to="<?php echo $count ?>"
        							<?php if ($count == 0) { ?> class="active" <?php } $count++; ?>></li>
        						<?php } ?>
        						</ol>
        						<!-- Carousel items -->
        						<div class="carousel-inner">
        						<?php
        							$count = 0;
        							foreach ( $images as $id => $image ) {
        								$img = wp_get_attachment_image_src( $image->ID, 400 );
        						?>
        							<div class="item <?php if ($count == 0) { ?>active<?php } $count++; ?>">
        								<img class="img-rounded" src="<?php echo $img[0] ?>" />
        							    <div class="carousel-caption img-rounded">
        			                      <h4><?php echo $image -> post_title ?></h4>
        			                      <p><?php echo $image -> post_content ?></p>
        			                    </div>
        							</div>
        						<?php }
        						} else {
        						?>
        			  <ol class="carousel-indicators">
        			    <li data-target="#myCarousel" data-slide-to="0" class="active"></li>
        			    <li data-target="#myCarousel" data-slide-to="1"></li>
        			    <li data-target="#myCarousel" data-slide-to="2"></li>
        			  </ol>
        			  <!-- Carousel items -->
        			  <div class="carousel-inner">
        			    <div class="active item">
        			    	<img src="/wp-content/themes/bidx-group/assets/img/sample/you_should_be_here.jpg" />
        			    	<div class="carousel-caption">
                              <h4>First Thumbnail label</h4>
                              <p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
                            </div>
        			    </div>
        			    <div class="item">
        			    	<img src="/wp-content/themes/bidx-group/assets/img/sample/birds_eye_la_defense.jpg" />
        			    	<div class="carousel-caption">
                              <h4>Second Thumbnail label</h4>
                              <p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
                            </div>
        			    </div>
        			    <div class="item">
        			    	<img src="/wp-content/themes/bidx-group/assets/img/sample/alien_entrepreneurs.jpg" />
        			    	<div class="carousel-caption">
                              <h4>Third Thumbnail label</h4>
                              <p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
                            </div>
        			    </div>
        			  </div>
        	           <?php  } // $images > 0 ?>
        			</div><!-- // carousel -->
                </div><!-- span -->
<?php
    if ( is_user_logged_in() ) {
?>
                <div class="span3">
<?php
    $sessionData = BidxCommon::$staticSession;
    $entities = $sessionData->data->wp->entities;

    // Create investor
    //
    if ( !isset( $entities->bidxInvestorProfile )) {
?>
        <div class="well">
            <h3>Become an investor</h3>
            <div class="row-fluid">
                <div class="span8">
                    <p>Create your business</p>
                </div>
                <div class="span4">
                    <a class="btn btn-primary" href="/member/#createInvestor">Create</a>
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
            <h3>Become an entrepreneur</h3>
            <div class="row-fluid">
                <div class="span8">
                    <p>Create your business</p>
                </div>
                <div class="span4">
                    <a class="btn btn-primary" href="/member/#createEntrepreneur">Create</a>
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

            </div><!-- row -->
	    </header>
<?php
    if ( ! is_user_logged_in() ) {
?>
	    <div class="entry-content">
	    	<?php echo do_shortcode( '[bidx app="group" view="group-intro"]' ); ?>
    	</div>
    	<div class="entry-content">
    		<div class="row-fluid after-well" >
	    		<div class="span12 text-center">
	    			<a class="btn" href="/login">Join our group</a> Already have an account? Just <a href="/login">login</a>
	    		</div>
    		</div>
    	</div>
<?php } else {
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
					<h4>News and Events</h4>
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
      while ($my_query->have_posts()) : $my_query->the_post(); ?>
					<div class="span6 ">
						<div class="media member-thumb img-rounded">
		  					<a class="pull-left" href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>">
		  					<?php
		  						if ( has_post_thumbnail() ) {
			  						$size = array(100,100);
			  						$atts = array('data-src' => 'holder.js/50x50/social/auto/text:News',
			  									  'class' => 'media-object img-rounded');
			  						the_post_thumbnail($size, $atts);
			  					}
			  					else {	?>
								<img data-src="holder.js/50x50/social/auto/text:None" class="media-object img-rounded" />
					<?php	} ?>
							</a>
							<div class="media-body centering">
   								<h4><a href="<?php the_permalink() ?>"><?php the_title(); ?></a></h4>
								<p><?php the_excerpt(); ?></p>
							</div>
						</div>
					</div><?php
       endwhile;
    }
	wp_reset_query();
?>
					</div>
				</div>
			</div>
		</div>

	    <div class="entry-content">
		<?php echo do_shortcode( '[bidx app="group" view="last-members"]' ); ?>
		</div>

	</article>
</div>
