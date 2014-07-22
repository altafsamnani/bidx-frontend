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
            $post_id = $instance['post'];           
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
        		'suppress_filters' => true );
        
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
			foreach( $recent_posts as $recent ){
				echo '<option value="' . get_permalink($recent["ID"]) . '" '.esc_attr($recent["post_title"]).'" >' .   $recent["post_title"].'</a> </li> ';
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
			
        $the_query = new WP_Query( array( 'post_id' => $post_id, 'post_status' => 'publish' ) );

 //
 // TODO : add HTML layout for the post
 //       
        
        
        if ( $the_query->have_posts() ) {

        	while ( $the_query->have_posts() ) {
        		$the_query->the_post();
        		echo '<h2>' . get_the_title() . '</h2>';
        		echo '<p>' . get_the_content() . '</p>';
        	}
        } else {
        	// no posts found
        }
        /* Restore original Post Data */
        wp_reset_postdata();
        
		echo $after_widget;
		
    }

} 
