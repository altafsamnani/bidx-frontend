<?php
/**
* Register sidebars and widgets
*/
function bidx_widgets_init() {

//Public
register_sidebar(array(
    'name'          => __('Public Front Top', 'bidx_group_theme'),
    'id'            => 'pub-front-top',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>',
));
register_sidebar(array(
    'name'          => __('Public Front Body', 'bidx_group_theme'),
    'id'            => 'pub-front-body',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>',
));
register_sidebar(array(
    'name'          => __('Public Front Sidebar', 'bidx_group_theme'),
    'id'            => 'pub-front-side',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>',
));
register_sidebar(array(
    'name'          => __('Public Front Bottom', 'bidx_group_theme'),
    'id'            => 'pub-front-bottom',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>',
)); 
register_sidebar(array(
    'name'          => __('Public Member Sidebar', 'bidx_group_theme'),
    'id'            => 'pub-member-side',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>',
)); 

//Private
register_sidebar(array(
    'name'          => __('Private Front Top', 'bidx_group_theme'),
    'id'            => 'priv-front-top',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>',
));
register_sidebar(array(
    'name'          => __('Private Front Body', 'bidx_group_theme'),
    'id'            => 'priv-front-body',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>',
));
register_sidebar(array(
    'name'          => __('Private Front Sidebar', 'bidx_group_theme'),
    'id'            => 'priv-front-side',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>',
));
register_sidebar(array(
    'name'          => __('Private Front Bottom', 'bidx_group_theme'),
    'id'            => 'priv-front-bottom',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>',
)); 
register_sidebar(array(
    'name'          => __('Private Member Sidebar', 'bidx_group_theme'),
    'id'            => 'priv-member-side',
    'before_widget' => '<section class="widget %1$s %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h3>',
    'after_title'   => '</h3>',
)); 


// register_widget('Bidx_Widget');
// register_widget('Carousel_Widget');
}
add_action('widgets_init', 'bidx_widgets_init');


/**
* --------------------------
* bidx Widgets list
*  
* User Interface
* 1] Caroussel widget (stand-alone, select from media and optionally add call-to-action)
* 2] Testimonial widget (public Testimonial information)
* 3] Big Quote widget (creates a big quote with name)
* 4] Post widget (select any post and add it)
* 5] Start Now or Join	
* 6] Sponsors
* 
* Information
* 1] bidx group changes (selector for members / businessplans / changes / all + view-type + amount 3-5)
* 2] active competitions (integrates with XML feed from Skipso)
* 3] bidx conversion widget (logged-in for access plan / profile + create new)
* 4] bidx search widget (quick access to search function)
* 5] bidx maps search widget (map view from a central location in a range)
* 
* --------------------------
*/



// register widget
add_action( 'widgets_init', function() {
    register_widget( 'Carousel_Widget' );
});

class Carousel_Widget extends WP_Widget {

///////////////////////////
// Initialise the widget //
/////////////////////////// 

    function Carousel_Widget() {
        $this->WP_Widget(
            'carousel_widget',
            __('Carousel'),
            array(
                'name' => 'Carousel',
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
        if( $instance ) {
            $title = $instance['title'];
            $select = $instance['select'];
        } else {
            $title ='';
            $select ='';
        } ?>

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
       // d($images_id);
       echo $before_widget;


    $images = array();

    foreach ($images_id as $image) {
        $images[] = wp_get_attachment_metadata( $image );
    }
    d($images);
    // get images associated with this post
    //

    if ( count( $images ) > 0 ) {
?>
    <!-- IMAGE Carousel -->

        <div id="groupCarousel" class="carousel slide spacer">
<?php
            // If there is only 1 image in the array don't show the nav arrows and the indicator
            // TODO: Don't load the carousel plugin and the extra markup
            if ( count($images) != 1 ) {
?>
                <ol class="carousel-indicators">
<?php
                    $count = 0;
                    foreach ( $images as $id => $image ) {
?>
                        <li data-target="#groupCarousel" data-slide-to="<?php echo $count ?>" <?php if ($count == 0) { ?>class="active" <?php } $count++; ?> ></li>
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
            $count = 0;
            foreach ( $images as $id => $image ) {
                // d( $image -> post_excerpt );
                $img = wp_get_attachment_image_src( $image->ID, 400 );
                $img_meta = wp_get_attachment_metadata($image->ID);
                $img_height = $img_meta['height'] . 'px';
                //parse URL to ensure having only relative links
                $img_url = parse_url($img[0]);

?>
                <div class="item <?php if ($count == 0) { ?>active<?php } $count++; ?>" style="background: url(<?php echo $img_url['path'] ?>) top center no-repeat; height: <?php echo $img_height; ?>; ">
                    <!-- <img class="img" src="<?php echo $img_url['path'] ?>" /> -->
<?php
                    // if ( !empty( $image -> post_excerpt ) ) {
                    //     echo $image -> post_excerpt;
                    // }

                    if ( !empty( $image -> post_excerpt ) ) {
?>
                        <div class="carousel-caption"><?php echo $image -> post_excerpt ?></div>
<?php
                    } // !empty( $image  -> post_excerpt )
?>
                </div>
<?php
            } // foreach
?>
            </div>
<?php
            // If there is only 1 image in the array don't show the nav arrows and the indicator
            // TODO: Don't load the carousel plugin and the extra markup
            if ( count($images) != 1 ) {
?>

            <!-- Carousel nav -->
            <a class="left carousel-control img-rounded" href="#groupCarousel" data-slide="prev"><span class="fa fa-chevron-left"></span></a>
            <a class="right carousel-control img-rounded" href="#groupCarousel" data-slide="next"><span class="fa fa-chevron-right"></span></a>
<?php
            }
?>
        </div>

    <!-- // IMAGE Carousel -->
<?php

    }  else {
?>

    <div class="alert alert-danger">
        <?php _e('Please add images using the mediamanager for this page in the Wordpress Admin', 'bidxtheme') ?>
    </div>

<?php
    }









       echo $after_widget;
    }

} // END: class HotTopics
