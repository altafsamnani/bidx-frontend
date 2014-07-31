<?php 
// register widget
add_action( 'widgets_init', function()
{
    register_widget( 'Carousel_Widget' );
});

class Carousel_Widget extends WP_Widget {

    ///////////////////////////
    // Initialise the widget //
    /////////////////////////// 
    function Carousel_Widget()
    {
        $this->WP_Widget
        (
            'carousel_widget',
            __('Carousel'),
            array
            (
                'name' => ': : Bidx Carousel ',
                'classname' => 'widget-carousel-images',
                'description' => __( "Use this widget to choose images to show in a carousel." )
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
            $select ='';
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
                '<select multiple="multiple" name="%s[]" id="%s">',
                $this->get_field_name('select'),
                $this->get_field_id('select')
            );

            foreach ( $query_images->posts as $image) {
                printf(
                    '<option value="%s" %s >%s</option>',
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
        $images_id = $instance['select'];
        $widget_id = $args['widget_id'];

        // Region Check
        $active_region = $args['id'];
        $add_container = false;
        if  ( ( $active_region === 'pub-front-top' || $active_region === 'priv-front-top' ) && get_theme_mod( 'front_top_width' ) === FALSE )
        {
                $add_container = true;
        }
        
        if  ( ( $active_region === 'pub-front-bottom' || $active_region === 'priv-front-bottom' ) && get_theme_mod( 'front_bottom_width' ) === FALSE )
        {
                $add_container = true;
        }

        echo $before_widget;

        if ( count( $images_id ) > 0 )
        {
        ?>
        <!-- IMAGE Carousel -->

            <div id="<?php echo $widget_id ?>" class="carousel slide">
<?php
                $count = 0;
                if ( $images_id )
                {

                // If there is only 1 image in the array don't show the nav arrows and the indicator
                //
                if ( count( $images_id ) != 1 )
                {
?>
                    <ol class="carousel-indicators">
<?php
                        $count = 0;
                        foreach ( $images_id as $image_id )
                        {
?>
                            <li data-target="#<?php echo $widget_id ?>" data-slide-to="<?php echo $count ?>" <?php if ($count == 0) { ?>class="active" <?php } $count++; ?> ></li>
<?php
                        }
?>
                    </ol>
<?php
                }
?>
                <!-- Carousel items -->
                <div class="carousel-inner">
<?php
                        foreach ( $images_id as $image_id )
                        {
                            $img = wp_get_attachment_image_src( $image_id, 'full' );
                            $img_meta = wp_get_attachment_metadata($image_id);
                            $img_height = $img_meta['height'] . 'px';
                            //parse URL to ensure having only relative links
                            $img_url = parse_url($img[0]);

                            // Get Caption and Description
                            $caption = get_post_field('post_excerpt', $image_id );
                            $description = get_post_field('post_content', $image_id );

                            // Alt text -- Not in use --
                            $alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);
    ?>
                            <div class="item <?php if ($count == 0) { ?>active<?php } $count++; ?>"
                                 style="background: url(<?php echo $img_url['path'] ?>) top center no-repeat; height: <?php echo $img_height; ?>; ">
    <?php

                                if ( $caption )
                                {
    ?>
                                    <div class="carousel-caption"><?php echo $caption ?></div>
    <?php
                                }

                                if ( $description )
                                {
    ?>
                                    <div class="carousel-description"><?php echo $description ?></div>
    <?php
                                }
    ?>
                            </div>
    <?php
                        } // foreach
?>
                </div>
<?php

                // If there is only 1 image in the array don't show the nav arrows and the indicator
                if ( count($images_id) != 1 )
                {
?>
                    <!-- Carousel nav -->
                    <a class="left carousel-control img-rounded" href="#<?php echo $widget_id ?>" data-slide="prev"><span class="fa fa-chevron-left"></span></a>
                    <a class="right carousel-control img-rounded" href="#<?php echo $widget_id ?>" data-slide="next"><span class="fa fa-chevron-right"></span></a>
<?php
                }
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
                        <p><?php _e('Please select the images you want to show to this carousel from the widget', 'bidxtheme') ?></p>
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
?>
            </div>

        <!-- // IMAGE Carousel -->
<?php
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
                    <p><?php _e('Please select the images you want to show to this carousel from the widget', 'bidxtheme') ?></p>
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
