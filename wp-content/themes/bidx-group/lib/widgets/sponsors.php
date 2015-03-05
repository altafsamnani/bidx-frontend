<?php
// register widget
add_action( 'widgets_init', function()
{
    register_widget( 'Sponsors_Widget' );
});

class Sponsors_Widget extends WP_Widget {

    ///////////////////////////
    // Initialise the widget //
    ///////////////////////////
    function Sponsors_Widget()
    {
        $this->WP_Widget
        (
            'sponsors_widget',
            __('Carousel'),
            array
            (
                'name' => ': : Bidx Sponsors ',
                'classname' => 'widget-sponsors-images',
                'description' => __( "Use this widget to choose images to show in a sponsors facet." )
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
            $select = $instance['select'];
        }
        else
        {
            $title ='';
            $select = array();
        }
?>

        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Widget Title:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
        </p>

<?php
            $query_images_args = array(
                'post_type' => 'attachment', 'post_mime_type' =>'image', 'post_status' => 'inherit', 'posts_per_page' => -1,
            );

            $query_images = new WP_Query( $query_images_args );
            $images = array();

            printf (
                '<select multiple="multiple" style="width:21em;" name="%s[]" id="%s">',
                $this->get_field_name('select'),
                $this->get_field_id('select')
            );

            foreach ( $query_images->posts as $image) {
                printf(
                    '<option style="background-image:url(%s); background-repeat:no-repeat; height: 100px; background-size: 21em;" value="%s" %s >%s</option>',
                    wp_get_attachment_url( $image->ID ),
                    $image->ID,
                    in_array( $image->ID, $select) ? 'selected="selected"' : '',
                    $image->post_title
                );
            }

            echo '</select>';


    } // END: function form( $instance )

    //////////////////////////////////////////////////////////////////
    // The update function to insert the chosen values in to the db //
    //////////////////////////////////////////////////////////////////
    function update( $new_instance, $old_instance )
    {
        $instance = $old_instance;
        $instance['select'] = esc_sql( $new_instance['select'] );
        $instance['title'] = esc_sql( $new_instance['title']);
        return $instance;
    }

    /////////////////////////////////////////
    // The front end display of the widget //
    /////////////////////////////////////////
    function widget($args, $instance) {
        extract( $args );
        // these are the widget options
        $sponsors_id = $instance['select'];
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

        echo $before_widget;


        if ( $add_container ) :
?>
            <div class="container">
<?php
        endif;

        if ( count( $sponsors_id ) > 0 )
        {
            if ( $sponsors_id )
            {
?>
                <div class="sponsors">
<?php

                    $count = 1;
                    foreach ( $sponsors_id as $sponsor_id )
                    {
                        $img = wp_get_attachment_image_src( $sponsor_id, 'full' );
                        $img_meta = wp_get_attachment_metadata($sponsor_id);
                        //parse URL to ensure having only relative links
                        $img_url = parse_url($img[0]);

                        // Get Caption, Description and Alt text
                        $caption = get_post_field('post_excerpt', $sponsor_id );
                        $description = get_post_field('post_content', $sponsor_id );
                        $alt = get_post_meta($sponsor_id, '_wp_attachment_image_alt', true);
?>
                        <span class="item <?php echo $count; $count++; ?>">
<?php
                            if ( $caption )
                            {
?>
                                <a href="<?php echo $caption ?>" target="_blank">
<?php
                            }

?>
                                <img src="<?php echo $img_url['path']; ?>" alt="<?php echo $alt; ?>">
<?php
                            if ( $caption )
                            {
?>
                                </a>
<?php
                            }
?>
                        </span> <!-- item -->
<?php
                    } // foreach
                }
                else
                {
?>
                    <div class="alert alert-danger">
                        <blockquote>
                            <p><?php _e('Please select the images you want to show to this sponsors widget', 'bidxplugin') ?></p>
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
                </div>
<?php
                }
?>
<?php
        }
        else
        {
?>
            <div class="alert alert-danger">
                <blockquote>
                    <p><?php _e('Please select the images you want to show to this sponsors widget', 'bidxplugin') ?></p>
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

} // END: class HotTopics
