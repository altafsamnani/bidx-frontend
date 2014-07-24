<?php 
// register widget
add_action( 'widgets_init', function()
{
    register_widget( 'Latest_Members_Widget' );
});

class Latest_Members_Widget extends WP_Widget {

    ///////////////////////////
    // Initialise the widget //
    /////////////////////////// 
    function Latest_Members_Widget()
    {
        $this->WP_Widget
        (
            'latest_members_widget',
            __('Carousel'),
            array
            (
                'name' => ': : Bidx Latest Members ',
                'classname' => 'widget-latest-members',
                'description' => __( "Use this widget add a block of the latest members." )
            )
        );
    }

    // The admin form for the widget
    ///////////////////////////
    // Setup the form fields //
    ///////////////////////////
    function form( $instance )
    {
        // d($instance);
        if ( $instance )
        {
            $title = $instance['title'];
        }
        else
        {
            $title ='';
        }
?>

        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Widget Title:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
        </p>

<?php


    } // END: function form( $instance ) 

    //////////////////////////////////////////////////////////////////
    // The update function to insert the chosen values in to the db //
    //////////////////////////////////////////////////////////////////
    function update( $new_instance, $old_instance )
    {
        $instance = $old_instance;
        $instance['title'] = esc_sql( $new_instance['title']);
        return $instance;
    }

    /////////////////////////////////////////
    // The front end display of the widget //
    /////////////////////////////////////////
    function widget($args, $instance) {
        extract( $args );
        // d($instance);
        // these are the widget options
        $widget_id = $args['widget_id'];

        // Region Check
        $active_region = $args['id'];
        $add_container = false;
        $items = 4;
        if  (
                $active_region === 'pub-front-top' ||
                $active_region === 'pub-front-bottom' ||
                $active_region === 'priv-front-top' ||
                $active_region === 'priv-front-bottom'
            )
        {
            $add_container = true;
            $items = 6;
        }

        echo $before_widget;

        if ( $add_container ) :
?>
            <div class="container">
<?php                 
        endif; 
?>
                <div class="panel panel-primary panel-members">
                    <div class="panel-heading hide-overflow">
                        <h4 class="pull-left">
                            <?php _e('New members', 'wp_widget_plugin')?>
                        </h4>
                        <a href="#" class="hide pull-right btn btn-default"><?php _e('view all','bidxplugin')?></a>
                    </div>
                    <div class="panel-body">
                        <!-- Grab latests members -->
<?php
                        echo do_shortcode( '[bidx app="group" view="widget-latest-members" panel="true" region="'.$active_region.'" items="'.$items.'"]' );
?>
                    </div>
                </div>
<?php 
        if ( $add_container ) :
?>
            </div>
<?php                 
        endif; 

        echo $after_widget;
    }

} // END: class HotTopics
