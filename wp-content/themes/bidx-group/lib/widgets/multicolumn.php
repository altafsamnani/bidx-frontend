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

    private $columns_list    = array( 1,2,3,4 );
	private $items_list 	 = array( 2,3,4,5,6 );
	
	private $column_contents = array( 
    									'', 'Empty',
    									'[bidx app="group" view="widget-latest-members"]'=>'Latest Members',
    									'[bidx app="group" view="widget-latest-business-summaries"]'=>'Latest Business Summaries',
    									'[bidx app="group" view="widget-latest-news"]'=>'Latest Posts',	
    //                                  '[bidx app=\" \"]'=>'Latest Companies',
    //                                  '[bidx app=\" \"]'=>'Latest Mentors',
    //                                  '[bidx app=\" \"]'=>'Active Competition(s)',    
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
            $latest_items   = $instance['items'];
            $has_bg   = $instance['has_bg'] ? 'checked="checked"' : '';
            $bg_color = esc_attr($instance['bg_color']);
            $col1     = $instance['col1'];
            $col2     = $instance['col2'];
            $col3     = $instance['col3'];
            $col4     = $instance['col4'];
            
        } else {
            $columns = 2;
            $latest_items   = 3;
            $has_bg   = '';
            $bg_color = 'bg-primary-darker';
            $col1     = $this->column_contents[1];
            $col2     = $this->column_contents[1];
            $col3     = $this->column_contents[1];
            $col4     = $this->column_contents[1];
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

        <p>
            <label for="<?php echo $this->get_field_id( 'items' ); ?>"><?php _e('Amount of items', 'wp_widget_plugin'); ?></label>
            <select name="<?php echo $this->get_field_name( 'items' ) ?>" 
                    id="<?php echo $this->get_field_id( 'items' ) ?>"
                    onchange="jQuery('.<?php echo $this->get_field_id( 'items' ) ?>').show();jQuery('.<?php echo $this->get_field_id( 'items' ) ?>.mc'+this.value).hide();"
            >
<?php 
            foreach ( $this->items_list as $item_option ) {
                printf(
                    '<option value="%s" %s >%s</option>',
                    $item_option,
                    $item_option == $latest_items ? 'selected="selected"' : '',
                    $item_option
                );
            }
?>
            </select>
        </p>

        <p>
            <input class="checkbox" type="checkbox" <?php echo $has_bg; ?> id="<?php echo $this->get_field_id('has_bg'); ?>" name="<?php echo $this->get_field_name('has_bg'); ?>" />
            <label for="<?php echo $this->get_field_id('has_bg'); ?>"><?php _e('Add Background Color', 'wp_widget_plugin'); ?></label>
        </p>

        <p>
            <label><?php _e('Background Color', 'wp_widget_plugin'); ?></label><br>
            <label for="<?php echo $this->get_field_id('white'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('white'); ?>"
                name="<?php echo $this->get_field_name('bg_color'); ?>"
                value="bg-white" <?php if($bg_color === 'bg-white'){ echo 'checked="checked"'; } ?>
            /><?php _e('White', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('center'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('primary'); ?>"
                name="<?php echo $this->get_field_name('bg_color'); ?>"
                value="bg-primary-darker" <?php if($bg_color === 'bg-primary-darker'){ echo 'checked="checked"'; } ?>
            /><?php _e('Primary', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('right'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('secondary'); ?>"
                name="<?php echo $this->get_field_name('bg_color'); ?>"
                value="bg-secondary-darker" <?php if($bg_color === 'bg-secondary-darker'){ echo 'checked="checked"'; } ?>
            /><?php _e('Secondary', 'wp_widget_plugin'); ?>&nbsp;
            </label>
        </p>

<?php
        //get heighest number from array
        for ( $column_option=1; $column_option <= 4; $column_option++)
        {
?>
            <p>
<?php  
                printf(
                    '<div class="%s%s%s%s">',
                    $this->get_field_id( 'columns' ),
                    $column_option == 3 ? ' mc2' : '',
                    $column_option == 4 ? ' mc3 mc2' : '',              
                    $columns < $column_option ? ' hidden' : ''
                );
?> 
                    <label for="<?php echo $this->get_field_id( 'col'.$column_option ); ?>"><?php _e('Column', 'wp_widget_plugin'); ?> <?php echo $column_option ?></label>
                    <select name="<?php echo $this->get_field_name( 'col'.$column_option ) ?>" 
                            id="<?php echo $this->get_field_id( 'col'.$column_option ) ?>"
                    >
<?php 
                    if ( empty( $column_data[$column_option] ) ) {
                        $column_data[$column_option] = $this->column_contents[1];       
                    }

                    foreach ( $this->column_contents as $column_content)
                    {
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
<?php  
        }
    } 

   /**
    * The update function to insert the chosen values in to the db
    * Also validates the list of chosen widgets
    **/
    function update( $new_instance, $old_instance )
    {
        $instance = $old_instance;
        $instance['columns'] = esc_sql( $new_instance['columns'] );
        $instance['items'] = esc_sql( $new_instance['items'] );
        $instance['has_bg'] = esc_sql( $new_instance['has_bg'] ? true : false );
        $instance['bg_color'] = strip_tags( $new_instance['bg_color'] );
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

        global $latest_items;
        // these are the widget options
        $columns = $instance['columns'];
        $latest_items = $instance['items'];
        $has_bg = $instance['has_bg'] ? true : false;
        $bg_color = $instance['bg_color'];
        $col1 = array_search($instance['col1'], $this->column_contents);
        $col2 = array_search($instance['col2'], $this->column_contents);
        $col3 = array_search($instance['col3'], $this->column_contents);
        $col4 = array_search($instance['col4'], $this->column_contents);
        $col_class = '';
        $empty_cols = false;
        $all_cols = array( $col1, $col2, $col3, $col4 );
        
        // Check if the text color needs to be white
        $text_color = '';
        if ( $bg_color === 'bg-primary-darker' || $bg_color === 'bg-secondary-darker' )
        {
            $text_color = ' text-white';
        }

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
        
        if ( $columns === "4" )
        {
            $col_class = 'col-sm-3';
            if ( $instance['col1'] === "Empty" || $instance['col2'] === "Empty" || $instance['col3'] === "Empty" || $instance['col4'] === "Empty" )
            {
                $empty_cols = true;
            }
        }
        elseif ( $columns === "3" )
        {
            $col_class = 'col-sm-4';
            if ( $instance['col1'] === "Empty" || $instance['col2'] === "Empty" || $instance['col3'] === "Empty" )
            {
                $empty_cols = true;
            }
        }
        elseif ( $columns === "2" )
        {
            $col_class = 'col-sm-6';
            if ( $instance['col1'] === "Empty" || $instance['col2'] === "Empty" )
            {
                $empty_cols = true;
            }
        }
        elseif ( $columns === "1" )
        {
            $col_class = 'col-sm-12';
            if ( $instance['col1'] === "Empty" )
            {
                $empty_cols = true;
            }
        }
        else
        {
            $col_class = 'col-sm-4';
            if ( $instance['col1'] === "Empty" || $instance['col2'] === "Empty" )
            {
                $empty_cols = true;
            }
        }

        if ( $has_bg ) :
    		echo '<div class="main-padding '. $bg_color . $text_color .'">';
        endif; 

        if ( $add_container ) :
?>
            <div class="container">
<?php                 
        endif; 

        if ( $empty_cols )
        {
?>
            <div class="alert alert-danger">
                <blockquote>
                    <p><?php _e('One or more columns are empty', 'bidxtheme') ?></p>
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
        else
        {
            echo '<div class="row">';

            for ( $col=1; $col <= $columns; $col++ )
            {
    			echo '<div class="' . $col_class . '">';
        			do_shortcode( $all_cols[$col-1] );
                echo '</div>';
            }
                       
            echo '</div>';
        }

        if ( $add_container ) :
?>
            </div>
<?php                 
        endif;

        if ( $has_bg ) :
            echo '</div>';
        endif; 

    	echo $after_widget;
    }

} 
