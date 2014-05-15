<?php 
// register widget
add_action( 'widgets_init', function()
{
    register_widget( 'Promo_Widget' );
});

class Promo_Widget extends WP_Widget {

    ///////////////////////////
    // Initialise the widget //
    /////////////////////////// 
    function Promo_Widget()
    {
        $this->WP_Widget
        (
            'promo_widget',
            __('Carousel'),
            array
            (
                'name' => ': : Bidx Promo Text ',
                'classname' => 'widget-promo-text',
                'description' => __( "Use this widget add a promotinal text." )
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
            $promotext = $instance['promotext'];
            $promolink = $instance['promolink'];
            $promobold = $instance['promobold'] ? 'checked="checked"' : '';
            $promoalign = esc_attr($instance['promoalign']);
        }
        else
        {
            $title ='';
            $promotext ='';
            $promolink ='';
            $promobold ='';
            $promoalign ='text-center';
        }
?>

        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Widget Title:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('promotext'); ?>"><?php _e('Text:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('promotext'); ?>" name="<?php echo $this->get_field_name('promotext'); ?>" type="text" value="<?php echo $promotext; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('promolink'); ?>"><?php _e('Link: (optional)', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('promolink'); ?>" name="<?php echo $this->get_field_name('promolink'); ?>" type="text" value="<?php echo $promolink; ?>" />
        </p>
        <p>
            <label><?php _e('Style', 'wp_widget_plugin'); ?></label><br>
            <input class="checkbox" type="checkbox" <?php echo $promobold; ?> id="<?php echo $this->get_field_id('promobold'); ?>" name="<?php echo $this->get_field_name('promobold'); ?>" />
            <label for="<?php echo $this->get_field_id('promobold'); ?>"><?php _e('Bold text', 'wp_widget_plugin'); ?></label>
        </p>
        <p>
            <label><?php _e('Alignment', 'wp_widget_plugin'); ?></label><br>
            <label for="<?php echo $this->get_field_id('left'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('left'); ?>"
                name="<?php echo $this->get_field_name('promoalign'); ?>"
                value="text-left" <?php if($promoalign === 'text-left'){ echo 'checked="checked"'; } ?>
            /><?php _e('Left', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('center'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('center'); ?>"
                name="<?php echo $this->get_field_name('promoalign'); ?>"
                value="text-center" <?php if($promoalign === 'text-center'){ echo 'checked="checked"'; } ?>
            /><?php _e('Center', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('right'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('right'); ?>"
                name="<?php echo $this->get_field_name('promoalign'); ?>"
                value="text-right" <?php if($promoalign === 'text-right'){ echo 'checked="checked"'; } ?>
            /><?php _e('Right', 'wp_widget_plugin'); ?>&nbsp;
            </label>
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
        $instance['promotext'] = esc_sql( $new_instance['promotext'] );
        $instance['promolink'] = esc_sql( $new_instance['promolink'] );
        $instance['promobold'] = esc_sql( $new_instance['promobold'] ? true : false );
        $instance['promoalign'] = strip_tags( $new_instance['promoalign'] );
        return $instance;
    }

    /////////////////////////////////////////
    // The front end display of the widget //
    /////////////////////////////////////////
    function widget($args, $instance) {
        extract( $args );
        // d($instance);
        // these are the widget options
        $promotext = $instance['promotext'];
        $promolink = $instance['promolink'];
        $promobold = $instance['promobold'];
        $promoalign = $instance['promoalign'];
        $widget_id = $args['widget_id'];

        // Region Check
        $active_region = $args['id'];
        $add_container = false;
        if  (
                $active_region === 'pub-front-top' ||
                $active_region === 'pub-front-bottom' ||
                $active_region === 'priv-front-top' ||
                $active_region === 'priv-front-bottom'
            )
        {
            $add_container = true;
        }

        echo $before_widget;



        if ( $promotext )
        {
            if ( $add_container ) :
?>
                <div class="container">
<?php                 
            endif; 
?>
            <div class="promo <?php echo $promoalign; ?>">
<?php
                if ( $promolink ) { echo '<a href="' . $promolink . '">'; } 
                    if ( $promobold ) { echo '<strong>'; } 
                        echo $promotext; 
                    if ( $promobold ) { echo '</strong>'; } 
                 if ( $promolink ) { echo '</a>'; }
?>
            </div>
<?php             
            if ( $add_container ) :
?>
                </div>
<?php                 
            endif; 
        }
        else
        {
?>
            <div class="alert alert-danger">
                <?php _e('Please add text and an optional link', 'bidxtheme') ?>
            </div>
<?php
        }

       echo $after_widget;
    }

} // END: class HotTopics
