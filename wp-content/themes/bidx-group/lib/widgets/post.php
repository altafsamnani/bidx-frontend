<?php 
// register widget
add_action( 'widgets_init', function()
{
    register_widget( 'Bidx_Post_Widget' );
});


/**
 * Allows for selecting one post to be displayed in the widget 
 * @author Jaap Gorjup
 */
class Bidx_Post_Widget extends WP_Widget {

    /**
     * Constructor
     * Initializes the WP_Widget base class
     */
    function __construct()
    {
        $this->WP_Widget
        (
            'post_widget',
            __('Post Widget'),
            array
            (
                'name' => ': : Bidx Post ',
                'classname' => 'post',
                'description' => __( "Allows you to select an existing post." )
            )
        );
    }

    /**
     * 
     * The admin form for the widget
     * Setup the form fields
     */
    function form( $instance )
    {
        if ( $instance )
        {
            $title = $instance['title']; 
            $post_id = $instance['post_id'];           
        }
        else
        {
            $title ='';
            $post_id = '';
        }
        
        //get list of posts
        $args = array(
            		'numberposts' => 20,
            		'offset' => 0,
            		'category' => 0,
            		'orderby' => 'post_date',
            		'order' => 'DESC',
            		'post_type' => 'post',
            		'post_status' => 'draft, publish, future, pending, private',
            		'suppress_filters' => true
                );
        
        $recent_posts = wp_get_recent_posts( $args );

        //check if post_id exists in $recent post else add it to the $recent_posts
        //can we update the query to support it on top?
?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Widget Title:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('post_id'); ?>"><?php _e('Post: (required)', 'wp_widget_plugin'); ?></label>
            <select  name="<?php echo $this->get_field_name( 'post_id' ) ?>" 
					id="<?php echo $this->get_field_id( 'post_id' ) ?>"
			>
<?php 
			foreach( $recent_posts as $recent )
            {
                printf(
                    '<option value="%s" %s >%s</option>',
                    $recent["ID"],
                    esc_attr($recent["ID"]) === $post_id ? 'selected="selected"' : '',
                    $recent["post_title"]
                );
			}
?>
			</select>
       </p>
<?php
    } 

   /**
    * The update function to insert the chosen values in to the db
    * Also validates the list of chosen widgets
    **/
    function update( $new_instance, $old_instance )
    {
        $instance = $old_instance;
        $instance['title'] = esc_sql( $new_instance['title']);
        $instance['post_id'] = esc_sql( $new_instance['post_id'] );
        return $instance;
    }

    /**
     * The front end display of the widget 
     * 
     **/
    function widget($args, $instance) {

        extract( $args );
        $post_id = $instance['post_id'];
        $widget_id = $args['widget_id'];
        echo $before_widget;

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

        if ( $add_container ) :
?>
            <div class="container">
<?php                 
        endif; 

        //if wpml replace post_id by the one matching the language
        if( function_exists('icl_object_id' ) ) {
            $post_id = icl_object_id( $post_id, 'post', true );
        }

        $the_query = new WP_Query( array( 'post_id' => $post_id, 'post_status' => 'publish' ) );
        
        if ( $the_query->have_posts() )
        {
            $selected_post = get_post($post_id);
?>
            <h1><?php echo $selected_post->post_title; ?></h1>
            <?php 
            /* Note that 
                 apply_filters('the_content', $selected_post->post_content) 
               might reveal Social Sharing buttons and additional whitespace. 
            */ 
            ?>
            <p><?php echo wpautop($selected_post->post_content, true); ?></p>
<?php 
        }
        else
        {
?>
            <div class="alert alert-danger">
                <blockquote>
                    <p><?php _e('No posts available, please create a post from Posts section ', 'bidxtheme') ?></p>
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
        }

        if ( $add_container ) :
?>
            </div>
<?php                 
        endif;

        /* Restore original Post Data */
        wp_reset_postdata();
        
		echo $after_widget;
		
    }

} 
