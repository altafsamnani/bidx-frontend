<?php while (have_posts()) : the_post(); 
        $post_custom    = get_post_custom();
        $startDate      = !empty($post_custom['competition_startdate'][0]) ? $post_custom['competition_startdate'][0] : "";
        $endDate        = $post_custom['competition_enddate'][0];
        $nowTimestamp   = strtotime('now');
        $startTimestamp = strtotime($startDate);
        $endTimestamp   = strtotime($endDate);
        $is_running     = ( $endTimestamp > $nowTimestamp )     ? TRUE : FALSE;
        $coming_soon    = ( $startTimestamp > $nowTimestamp )   ? TRUE : FALSE;

        $session = BidxCommon::$staticSession;

        $authenticated = false;

        if ( isset( $session->authenticated ) && $session->authenticated == 'true' )
        {
            $authenticated = true;
        }

        if ( $coming_soon )
        {
?>
            <blockquote class="alert-info hide-overflow">
                <span class="pull-left"><?php  _e('Starts at:','roots'); ?>
                <strong><?php echo $startDate; ?></strong></span>
                <a class="btn pull-right btn-info" href="<?php echo _l('competition'); ?>"><?php  _e('Go back to overview','roots'); ?></a>
            </blockquote>
<?php               
        }
        elseif ( $is_running )
        {
?>
            <blockquote class="alert-success hide-overflow">
                <span class="pull-left"><?php  _e('Apply before:','roots'); ?>
                <strong><?php echo $endDate; ?></strong></span>
<?php 
        if ( $authenticated )
        {
?>
                <a class="btn pull-right btn-success" href="<?php echo _l('competition'); ?>"><?php  _e('Apply now','roots'); ?></a>
<?php                
        }
        else
        {
?>
                <a class="btn pull-right btn-success" href="<?php echo _l('join'); ?>"><?php  _e('Register to apply','roots'); ?></a>
<?php                
        }
?>

            </blockquote>
<?php                
        }
        else
        {
?>
            <blockquote class="alert-danger hide-overflow">
                <span class="pull-left"><?php  _e('Expired at:','roots'); ?>
                <strong><?php echo $endDate; ?></strong></span>
                <a class="btn pull-right btn-danger" href="<?php echo _l('competition'); ?>"><?php  _e('Go back to overview','roots'); ?></a>
            </blockquote>
<?php                
        }
?>            
<?php 
        if ( has_post_thumbnail() )
        { // check if the post has a Post Thumbnail assigned to it.
            the_post_thumbnail('large', array('class' => 'img-responsive'));
        } 
?>
        <h1><?php the_title(); ?></h1>
        <div><?php the_excerpt(); ?></div>
        <div><?php wp_link_pages(array('before' => '<nav class="page-nav"><p>' . __('Pages:', 'roots'), 'after' => '</p></nav>')); ?></div>
        <div><?php the_content(); ?></div>
        
<?php endwhile; ?>
