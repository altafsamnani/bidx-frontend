<?php
    // WP_Query arguments
    $args = array (
        'post_type'             => 'competition',
        'pagination'            => true,
        'posts_per_page'        => '10',
        'meta_key'              => 'competition_enddate',
        'meta_value'            => time(),
        'meta_compare'          => '>',
        'orderby'               => 'meta_value',
        'order'                 => 'DESC'
    );

    // The Query
    $query = new WP_Query( $args );

// The Loop
if ( $query->have_posts() )
{
    while ( $query->have_posts() )
    {
        $query->the_post();

        $post_custom    = get_post_custom();
        $startDate      = !empty($post_custom['competition_startdate'][0]) ? $post_custom['competition_startdate'][0] : "";
        $endDate        = $post_custom['competition_enddate'][0];
        $nowTimestamp   = strtotime('now');
        $startTimestamp = strtotime($startDate);
        $endTimestamp   = strtotime($endDate);
        $is_running     = ( $endTimestamp > $nowTimestamp )     ? TRUE : FALSE;
        $coming_soon    = ( $startTimestamp > $nowTimestamp )   ? TRUE : FALSE;
        // d($startDate);
        // d($startTimestamp);
        // d($nowTimestamp);
        // d($post);
?>
        <div class="well">
<?php
            if ( $coming_soon )
            {
?>
            <blockquote class="alert-info hide-overflow">
                <span class="pull-left"><?php  _e('Starts at:','roots'); ?>
                <strong><?php echo $startDate; ?></strong></span>
                <a class="btn pull-right btn-info" href="<?php echo the_permalink(); ?>"><?php  _e('Find out more','roots'); ?></a>
            </blockquote>
<?php               
            }
            elseif ( $is_running )
            {
?>
            <blockquote class="alert-success hide-overflow">
                <span class="pull-left"><?php  _e('Apply before:','roots'); ?>
                <strong><?php echo $endDate; ?></strong></span>
                <a class="btn pull-right btn-success" href="<?php echo the_permalink(); ?>"><?php  _e('Apply now','roots'); ?></a>
            </blockquote>
<?php                
            }
            else
            {
?>
            <blockquote class="alert-danger hide-overflow">
                <span class="pull-left"><?php  _e('Expired at:','roots'); ?>
                <strong><?php echo $endDate; ?></strong></span>
                <a class="btn pull-right btn-danger" href="<?php echo the_permalink(); ?>"><?php  _e('View results','roots'); ?></a>
            </blockquote>
<?php                
            }
?>            
<?php 
            if ( has_post_thumbnail() ) { // check if the post has a Post Thumbnail assigned to it.
              the_post_thumbnail('large', array('class' => 'img-responsive'));
            } 
?>
            <h1><?php the_title(); ?></h1>
            <div><?php the_excerpt(); ?></div>
            <div>
                <?php wp_link_pages(array('before' => '<nav class="page-nav"><p>' . __('Pages:', 'roots'), 'after' => '</p></nav>')); ?>
            </div>
        </div>
<?php


    }
}
else
{
?>
            <div class="alert alert-danger hide-overflow">
                <strong><?php  _e('There are no competitions available','roots'); ?></strong>
            </div>
<?php
}

// Restore original Post Data
wp_reset_postdata();
