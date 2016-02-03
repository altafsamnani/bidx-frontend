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
        $this->WP_Widget
        (
            'videoBox_widget',
            __('VideoBox'),
            array
            (
                'name' => ': : Bidx Video ',
                'classname' => 'widget-video',
                'description' => __( "Paste Embed code from Youtube, Dailymotion, Vimeo, Vevo, Veoh and Metacafe" )
            )
        );
    }



    function form($instance)
    {
        $instance = wp_parse_args( (array) $instance, array( 'title' => '', 'video_text' => '', 'video_more' => '', 'video_link' => '' ) );
        $title = $instance['title'];
        $video_text = $instance['video_text'];
        $video_more = $instance['video_more'];
        $video_link = $instance['video_link'];
?>
  <p><label for="<?php echo $this->get_field_id('title'); ?>">Title: <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo attribute_escape($title); ?>" /></label></p>
  <p><label for="<?php echo $this->get_field_id('video_text'); ?>">Embed Code: <textarea class="widefat" id="<?php echo $this->get_field_id('video_text'); ?>" name="<?php echo $this->get_field_name('video_text'); ?>"><?php echo attribute_escape($video_text); ?></textarea></label></p>
  <p><label for="<?php echo $this->get_field_id('video_more'); ?>">More Text: <input class="widefat" id="<?php echo $this->get_field_id('video_more'); ?>" name="<?php echo $this->get_field_name('video_more'); ?>" type="text" value="<?php echo attribute_escape($video_more); ?>" /></label></p>
  <p><label for="<?php echo $this->get_field_id('video_link'); ?>">Link: <input class="widefat" id="<?php echo $this->get_field_id('video_link'); ?>" name="<?php echo $this->get_field_name('video_link'); ?>" type="text" value="<?php echo attribute_escape($video_link); ?>" /></label></p>
<?php
    }

    function update($new_instance, $old_instance)
    {
        $instance = $old_instance;
        $instance['title'] = $new_instance['title'];
        $instance['video_text'] = $new_instance['video_text'];
        $instance['video_more'] = $new_instance['video_more'];
        $instance['video_link'] = $new_instance['video_link'];
        return $instance;
    }

    function widget($args, $instance)
    {
        extract( $args );

        $title = $instance['title'];
        $video_text = $instance['video_text'];
        $video_more = $instance['video_more'];
        $video_link = $instance['video_link'];

        // Region Check
        $active_region = $args['id'];
        $add_container = false;
        if  ( ( $active_region === 'pub-front-top' || $active_region === 'priv-front-top' ) && get_theme_mod( 'front_top_width' ) !== true )
        {
            $add_container = true;
        }

        if  ( ( $active_region === 'pub-front-bottom' || $active_region === 'priv-front-bottom' ) && get_theme_mod( 'front_bottom_width' ) !== true )
        {
            $add_container = true;
        }

        echo $before_widget;

        if ( $add_container ) :
?>
            <div class="container">
<?php
        endif;

        if ( $video_text )
        {
?>
            <div class="video-box text-center">
                <?php if ( strlen($title)>0) { echo '<h2>'.$title.'</h2>'; } ?>
                <?php echo $video_text; ?>
                <?php if ( strlen($video_more)>0) { echo '<br/><a href="'.$video_link.'">'.$video_more.'</a>'; } ?>
            </div>
<?php
        }
        else
        {
?>
            <div class="alert alert-danger">
                <blockquote>
                    <p><?php _e('The embed code field is empty. Please insert an <code>iframe</code> from Youtube, Dailymotion, Vimeo, Vevo, Veoh or Metacafe', 'bidxplugin') ?></p>
                </blockquote>
                <p class="hide-overflow">
                    <span class="pull-left">
                        <?php _e('Sidebar', 'bidxplugin') ?>: <strong><?php echo $args['name']; ?></strong>&nbsp;
                    </span>
                    <span class="pull-right">
                        <?php _e('Widget', 'bidxplugin') ?>: <strong><?php echo $args['widget_name']; ?></strong>
                    </span>
                </p>
            </div>

<?php
        }

        if ( $add_container ) :
?>
            </div>
<?php
        endif;

        echo $after_widget;
    }

}

?>
