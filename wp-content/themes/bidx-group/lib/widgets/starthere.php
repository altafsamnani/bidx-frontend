<?php 

// register widget
add_action( 'widgets_init', function()
{
    register_widget( 'Start_Here_Widget' );
});

class Start_Here_Widget extends WP_Widget {

    ///////////////////////////
    // Initialise the widget //
    /////////////////////////// 
    function Start_Here_Widget()
    {
        $this->WP_Widget
        (
            'start_here_widget',
            __('Carousel'),
            array
            (
                'name' => ': : Bidx Start Button ',
                'classname' => 'widget-start-btn',
                'description' => __( "Use this widget to add the START HERE button. Works only in Public regions" )
            )
        );
    }

    // The admin form for the widget
    ///////////////////////////
    // Setup the form fields //
    ///////////////////////////
    function form( $instance )
    {
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
            <p><?php _e('Use this widget to add the START HERE button. Works only in Public regions', 'wp_widget_plugin'); ?></p>
            <br>
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

        // these are the widget options
        $widget_id = $args['widget_id'];

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

        $session = BidxCommon::$staticSession;
        if ( isset( $session->authenticated ) && $session->authenticated !== "true" ) {

            echo $before_widget;

            if ( $add_container ) :
?>
                <div class="container">
<?php                 
            endif; 
?>
                <a href="/join" class="btn btn-secondary btn-lg start-btn btn-block"><?php _e('Start Here', 'wp_widget_plugin'); ?></a>
<?php 
            if ( $add_container ) :
?>
                </div>
<?php                 
            endif; 

            echo $after_widget;
        }
    }

} // END: class HotTopics
