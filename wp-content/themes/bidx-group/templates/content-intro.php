<div class="container">
	<article class="bidx type-bidx status-publish hentry">
	    <header>
			<div id="myCarousel" class="carousel slide">
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
			</div>	    
	    </header>
  <?php if ( ! is_user_logged_in() ) { ?>
	    <div class="entry-content">
	    	<?php echo do_shortcode( '[bidx app="group" view="getGroupIntro"]' ); ?>
    	</div>
    	<div class="entry-content">
    		<div class="row-fluid after-well" >
	    		<div class="span12 text-center">
	    			<a class="btn" href="/join">Join our group</a> Already have an account? Just <a href="/login">login</a>
	    		</div>
    		</div>
    	</div>	
  <?php } ?>
  
  
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
		<?php echo do_shortcode( '[bidx app="group" view="lastMembers"]' ); ?>
		</div>

	</article>
</div>