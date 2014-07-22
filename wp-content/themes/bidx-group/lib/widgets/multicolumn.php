<?php 
// register widget
add_action( 'widgets_init', function()
{
    register_widget( 'Bidx_MultiColumn_Widget' );
});


/**
 * Creates a widget field with multiple columns.
 * Every column can contain a widget which is configurable separately.
 * 
 * 
 * TODO : Render out the data
 * TODO : add shortcodes for latest companies, mentors and active competitions 
 * 
 * @author Jaap Gorjup
 */
class Bidx_MultiColumn_Widget extends WP_Widget {

	private $columns_list 	  = array( 2,3,4 );
	
	private $column_contents = array( 
									'', 'Empty',
									'[bidx app="group" view="last-members" authenticated="true"]'=>'Latest Members',
									'[bidx app="group" view="latest-business-summaries"]'=>'Latest Business Summaries',
//									'[bidx app=\" \"]'=>'Latest Companies',
//									'[bidx app=\" \"]'=>'Latest Mentors',
//									'[bidx app=\" \"]'=>'Active Competition(s)',	
									'[bidx app="group" view="latest-news"]'=>'Latest Posts',	
			);
	
    /**
     * Constructor
     * Initializes the WP_Widget base class
     */
    function __construct()
    {
        $this->WP_Widget
        (
            'multicolumn_widget',
            __('Multicolumn Widget'),
            array
            (
                'name' => ': : Bidx Multi Column ',
                'classname' => 'multi-column',
                'description' => __( "Allows you to create multiple widget columns." )
            )
        );
    }

    /**
     * 
     * The admin form for the widget
     * Setup the form fields
     */
    function form( $instance ) {
    	
        if ( $instance && isset( $instance['columns'] ) )  {
            $columns = $instance['columns'];
            $col1 = $instance['col1'];
            $col2 = $instance['col2'];
            $col3 = $instance['col3'];
            $col4 = $instance['col4'];
            
        } else {
            $columns = 2;
            $col1 = $this->column_contents[1];
            $col2 = $this->column_contents[1];
            $col3 = $this->column_contents[1];
            $col4 = $this->column_contents[1];
        }
        $all_cols = array( $col1, $col2, $col3, $col4 );
?>
        <p>
            <label for="<?php echo $this->get_field_id( 'columns' ); ?>"><?php _e('Amount of columns', 'wp_widget_plugin'); ?></label>
			<select name="<?php echo $this->get_field_name( 'columns' ) ?>" 
					id="<?php echo $this->get_field_id( 'columns' ) ?>"
					onchange="jQuery('.<?php echo $this->get_field_id( 'columns' ) ?>').show();jQuery('.<?php echo $this->get_field_id( 'columns' ) ?>.mc'+this.value).hide();"
			>
			<?php 
            foreach ( $this->columns_list as $column_option ) {
                printf(
                    '<option value="%s" %s >%s</option>',
                    $column_option,
                    $column_option == $columns ? 'selected="selected"' : '',
                    $column_option
                );
            }
            ?>
            </select>
        </p>
        <?php
        //get heighest number from array
        for ( $column_option=1; $column_option <= 4; $column_option++) {
        ?>
        <p>
         <?php  
         		printf(
                    '<div class="%s%s%s%s">',
                    $this->get_field_id( 'columns' ),
                    $column_option == 3 ? ' mc2' : '',
                    $column_option == 4 ? ' mc3 mc2' : '',              
                    $columns < $column_option ? ' hidden' : ''
                );?> 
                	<label for="<?php echo $this->get_field_id( 'col'.$column_option ); ?>"><?php _e('Column', 'wp_widget_plugin'); ?> <?php echo $column_option ?></label>
					<select name="<?php echo $this->get_field_name( 'col'.$column_option ) ?>" 
							id="<?php echo $this->get_field_id( 'col'.$column_option ) ?>"
			>
				<?php 
				if ( empty( $column_data[$column_option] ) ) {
					$column_data[$column_option] = $this->column_contents[1];		
				}

	            foreach ( $this->column_contents as $column_content) {

	                printf(
	                    '<option value="%s" %s >%s</option>',
	                    $column_content,
	                    $all_cols[ $column_option-1 ] == $column_content ? 'selected="selected"' : '',
	                    $column_content
	                );
	            }
            ?>
            </select>
                </div>       	
        </p>
<?php  } 

    } 

   /**
    * The update function to insert the chosen values in to the db
    * Also validates the list of chosen widgets
    **/
    function update( $new_instance, $old_instance )
    {
        $instance = $old_instance;
        $instance['columns'] = esc_sql( $new_instance['columns'] );
        $instance['col1'] = esc_sql( $new_instance['col1'] );
        $instance['col2'] = esc_sql( $new_instance['col2'] );
        $instance['col3'] = esc_sql( $new_instance['col3'] );
        $instance['col4'] = esc_sql( $new_instance['col4'] );
        return $instance;
    }

    /**
     * The front end display of the widget 
     * 
     **/
    function widget($args, $instance) {
        extract( $args );

        // these are the widget options
        $columns = $instance['columns'];
        $col1 = array_search($instance['col1'], $this->column_contents);
        $col2 = array_search($instance['col2'], $this->column_contents);
        $col3 = array_search($instance['col3'], $this->column_contents);
        $col4 = array_search($instance['col4'], $this->column_contents);
        $all_cols = array( $col1, $col2, $col3, $col4 );
        
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
        
        //
        // TODO : finalize HTML output
        //
        
		echo '<div class="row">';
        for ( $col=1; $col <= $columns; $col++ ) {
			echo '<div class="infocol'.$col.' col-sm-4">';
			do_shortcode( $all_cols[$col-1] );
			echo '</div>';
		}
		echo '</div>';
		echo $after_widget;
    }

} 
