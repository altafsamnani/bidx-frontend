<?php 
// register widget
add_action( 'widgets_init', function()
{
    register_widget( 'Button_Widget' );
});

class Button_Widget extends WP_Widget {

    ///////////////////////////
    // Initialise the widget //
    /////////////////////////// 
    function Button_Widget()
    {
        $this->WP_Widget
        (
            'button_widget',
            __('Carousel'),
            array
            (
                'name' => ': : Bidx Button ',
                'classname' => 'widget-button',
                'description' => __( "Use this widget add a button." )
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
            $buttontext = $instance['buttontext'];
            $buttonlink = $instance['buttonlink'];
            $buttonblock = $instance['buttonblock'] ? 'checked="checked"' : '';
            $buttonalign = esc_attr($instance['buttonalign']);
            $buttonstyle = esc_attr($instance['buttonstyle']);
            $buttonsize = esc_attr($instance['buttonsize']);
        }
        else
        {
            $title ='';
            $buttontext ='';
            $buttonlink ='';
            $buttonblock ='';
            $buttonalign ='text-center';
            $buttonstyle ='btn-primary';
            $buttonsize ='btn';
        }
?>

        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Widget Title:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('buttontext'); ?>"><?php _e('Text: (required)', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('buttontext'); ?>" name="<?php echo $this->get_field_name('buttontext'); ?>" type="text" value="<?php echo $buttontext; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('buttonlink'); ?>"><?php _e('Link: (required)', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('buttonlink'); ?>" name="<?php echo $this->get_field_name('buttonlink'); ?>" type="text" value="<?php echo $buttonlink; ?>" />
        </p>
        <p>
            <label><?php _e('Style', 'wp_widget_plugin'); ?></label><br>
            <label for="<?php echo $this->get_field_id('primary'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('primary'); ?>"
                name="<?php echo $this->get_field_name('buttonstyle'); ?>"
                value="btn-primary" <?php if($buttonstyle === 'btn-primary'){ echo 'checked="checked"'; } ?>
            /><?php _e('Primary', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('secondary'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('secondary'); ?>"
                name="<?php echo $this->get_field_name('buttonstyle'); ?>"
                value="btn-secondary" <?php if($buttonstyle === 'btn-secondary'){ echo 'checked="checked"'; } ?>
            /><?php _e('Secondary', 'wp_widget_plugin'); ?>&nbsp;
            </label>
        </p>
        <p>
            <label><?php _e('Alignment', 'wp_widget_plugin'); ?></label><br>
            <label for="<?php echo $this->get_field_id('left'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('left'); ?>"
                name="<?php echo $this->get_field_name('buttonalign'); ?>"
                value="text-left" <?php if($buttonalign === 'text-left'){ echo 'checked="checked"'; } ?>
            /><?php _e('Left', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('center'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('center'); ?>"
                name="<?php echo $this->get_field_name('buttonalign'); ?>"
                value="text-center" <?php if($buttonalign === 'text-center'){ echo 'checked="checked"'; } ?>
            /><?php _e('Center', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('right'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('right'); ?>"
                name="<?php echo $this->get_field_name('buttonalign'); ?>"
                value="text-right" <?php if($buttonalign === 'text-right'){ echo 'checked="checked"'; } ?>
            /><?php _e('Right', 'wp_widget_plugin'); ?>&nbsp;
            </label>
        </p>
        <p>
            <label><?php _e('Size', 'wp_widget_plugin'); ?></label><br>
            <label for="<?php echo $this->get_field_id('xs'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('xs'); ?>"
                name="<?php echo $this->get_field_name('buttonsize'); ?>"
                value="btn-xs" <?php if($buttonsize === 'btn-xs'){ echo 'checked="checked"'; } ?>
            /><?php _e('XS', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('sm'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('sm'); ?>"
                name="<?php echo $this->get_field_name('buttonsize'); ?>"
                value="btn-sm" <?php if($buttonsize === 'btn-sm'){ echo 'checked="checked"'; } ?>
            /><?php _e('SM', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('btn'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('btn'); ?>"
                name="<?php echo $this->get_field_name('buttonsize'); ?>"
                value="btn" <?php if($buttonsize === 'btn'){ echo 'checked="checked"'; } ?>
            /><?php _e('Normal', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('lg'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('lg'); ?>"
                name="<?php echo $this->get_field_name('buttonsize'); ?>"
                value="btn-lg" <?php if($buttonsize === 'btn-lg'){ echo 'checked="checked"'; } ?>
            /><?php _e('LG', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('xl'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('xl'); ?>"
                name="<?php echo $this->get_field_name('buttonsize'); ?>"
                value="btn-xl" <?php if($buttonsize === 'btn-xl'){ echo 'checked="checked"'; } ?>
            /><?php _e('XL', 'wp_widget_plugin'); ?>&nbsp;
            </label>
        </p>
        <p>
            <input class="checkbox" type="checkbox" <?php echo $buttonblock; ?> id="<?php echo $this->get_field_id('buttonblock'); ?>" name="<?php echo $this->get_field_name('buttonblock'); ?>" />
            <label for="<?php echo $this->get_field_id('buttonblock'); ?>"><?php _e('Block button', 'wp_widget_plugin'); ?></label>
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
        $instance['buttontext'] = esc_sql( $new_instance['buttontext'] );
        $instance['buttonlink'] = esc_sql( $new_instance['buttonlink'] );
        $instance['buttonblock'] = esc_sql( $new_instance['buttonblock'] ? true : false );
        $instance['buttonalign'] = strip_tags( $new_instance['buttonalign'] );
        $instance['buttonstyle'] = strip_tags( $new_instance['buttonstyle'] );
        $instance['buttonsize'] = strip_tags( $new_instance['buttonsize'] );
        return $instance;
    }

    /////////////////////////////////////////
    // The front end display of the widget //
    /////////////////////////////////////////
    function widget($args, $instance) {
        extract( $args );
        // d($instance);
        // these are the widget options
        $buttontext = $instance['buttontext'];
        $buttonlink = $instance['buttonlink'];
        $buttonblock = $instance['buttonblock'] ? ' btn-block' : ' ';
        $buttonalign = $instance['buttonalign'];
        $buttonstyle = $instance['buttonstyle'];
        $buttonsize = $instance['buttonsize'];
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



        if ( $buttonlink && $buttontext )
        {
            if ( $add_container ) :
?>
                <div class="container">
<?php                 
            endif; 
?>
            <div class="promo <?php echo $buttonalign; ?>">
<?php
                if ( $buttonlink ) { echo '<a class="btn' . ' ' . $buttonsize . ' ' . $buttonstyle . ' ' . $buttonblock .' " href="' . $buttonlink . '">'; } 
                    echo $buttontext; 
                if ( $buttonlink ) { echo '</a>'; }
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
            if ( $add_container ) :
?>
                <div class="container">
<?php                 
            endif; 
?>
            <div class="alert alert-danger">
                <blockquote>
                    <p><?php _e('Please add button text and a link', 'bidxtheme') ?></p>
                </blockquote>
                <p class="hide-overflow">
                    <span class="pull-left">
                        <?php _e('Sidebar', 'bidxtheme') ?>: <strong><?php echo $args['name']; ?></strong>&nbsp;
                    </span>
                    <span class="pull-right">
                        <?php _e('Widget', 'bidxtheme') ?>: <strong><?php echo $args['widget_name']; ?></strong>
                    </span>
                </p>
            </div>
<?php
            if ( $add_container ) :
?>
                </div>
<?php                 
            endif; 

        }

       echo $after_widget;
    }

} // END: class HotTopics
