<?php 
/*
Plugin Name: Easy Video Widget Box
Plugin URI: http://www.purpleturtle.pro
Description: Simple plugin to add video into your widget box. Supports Youtube, Dailymotion, Vimeo, Vevo, Veoh and Metacafe and many other sites that provide embed code.. just don't forget to edit the embed code to the size of your widget box
Version: 1.6
Author: Purple Turtle Productions
Author URI: http://www.w3bdesign.ca/
*/
add_action( 'widgets_init', function()
{
    register_widget( 'VideoBox' );
});


class VideoBox extends WP_Widget
{
    function VideoBox()
    {
        $widget_ops = array('classname' => 'VideoBox', 'description' => 'Paste Embed code from Youtube, Dailymotion, Vimeo, Vevo, Veoh and Metacafe' );
        $this->WP_Widget('VideoBox', ':: Bidx Video', $widget_ops);
    }

    function form($instance)
    {
        $instance = wp_parse_args( (array) $instance, array( 'video_title' => '', 'video_text' => '', 'video_more' => '', 'video_link' => '' ) );
        $video_title = $instance['video_title'];
        $video_text = $instance['video_text'];
        $video_more = $instance['video_more'];
        $video_link = $instance['video_link'];
?>
  <p><label for="<?php echo $this->get_field_id('video_title'); ?>">Title: <input class="widefat" id="<?php echo $this->get_field_id('video_title'); ?>" name="<?php echo $this->get_field_name('video_title'); ?>" type="text" value="<?php echo attribute_escape($video_title); ?>" /></label></p>
  <p><label for="<?php echo $this->get_field_id('video_text'); ?>">Embed Code: <textarea class="widefat" id="<?php echo $this->get_field_id('video_text'); ?>" name="<?php echo $this->get_field_name('video_text'); ?>"><?php echo attribute_escape($video_text); ?></textarea></label></p>
  <p><label for="<?php echo $this->get_field_id('video_more'); ?>">More Text: <input class="widefat" id="<?php echo $this->get_field_id('video_more'); ?>" name="<?php echo $this->get_field_name('video_more'); ?>" type="text" value="<?php echo attribute_escape($video_more); ?>" /></label></p>
  <p><label for="<?php echo $this->get_field_id('video_link'); ?>">Link: <input class="widefat" id="<?php echo $this->get_field_id('video_link'); ?>" name="<?php echo $this->get_field_name('video_link'); ?>" type="text" value="<?php echo attribute_escape($video_link); ?>" /></label></p>
<?php
    }

    function update($new_instance, $old_instance)
    {
        $instance = $old_instance;
        $instance['video_title'] = $new_instance['video_title'];
        $instance['video_text'] = $new_instance['video_text'];
        $instance['video_more'] = $new_instance['video_more'];
        $instance['video_link'] = $new_instance['video_link'];
        return $instance;
    }

    function widget($args, $instance)
    {
        extract( $args );

        $video_title = $instance['video_title'];
        $video_text = $instance['video_text'];
        $video_more = $instance['video_more'];
        $video_link = $instance['video_link'];
        echo $before_widget;
?>
        <div class="video-box text-center">
            <?php if ( strlen($video_title)>0) { echo '<h2>'.$video_title.'</h2>'; } ?>
            <?php echo $video_text; ?>
            <?php if ( strlen($video_more)>0) { echo '<br/><a href="'.$video_link.'">'.$video_more.'</a>'; } ?>
        </div>
<?php
        echo $after_widget;
    }

}

?>
