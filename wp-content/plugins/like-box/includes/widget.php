<?php 
/*############################### WIDGET ###############################################*/
class like_box_facbook extends WP_Widget {
	private static $id_of_like_box=0;
	// Constructor //	
	function __construct() {		
		$widget_ops = array( 'classname' => 'like_box_facbook', 'description' => 'Like box Facebook ' ); // Widget Settings
		$control_ops = array( 'id_base' => 'like_box_facbook' ); // Widget Control Settings
		$this->WP_Widget( 'like_box_facbook', 'Like box Facebook', $widget_ops, $control_ops ); // Create the widget

	}

	/*poll display in front*/
	function widget($args, $instance) {
		self::$id_of_like_box++;
		extract( $args );
		$title = $instance['title'];    
		$profile_id = $instance['profile_id'];
		$connections = $instance['connections'];
		$width = $instance['width'];
		$height = $instance['height'];
		$header = ($instance['header']) ? 1 : 0;
		$locale = $instance['locale'];
		// Before widget //
		echo $before_widget;
		
		// Title of widget //
		if ( $title ) { echo $before_title . $title . $after_title; }
		// Widget output //
		echo '<iframe id="like_box_widget_'.self::$id_of_like_box.'" src="http://www.facebook.com/plugins/fan.php?id='.$profile_id.'&amp;width='.$width.'&amp;colorscheme='.$facbook_likbox_theme.'&amp;height='.$height.'&amp;connections='.$connections.'&amp;stream='.$stream.'&amp;header='.$header.'&amp;locale='.$locale.'&amp;show_border='.(($show_border=='yes')?'true':'false').'" scrolling="no" frameborder="0" allowTransparency="true" style="'.(($show_border=='yes')?'border:1px solid '.$facbook_lik_box_border_color.';':'border:none').' overflow:hidden;visibility:hidden; max-width:100%; width:'.$width.'px; height:'.$height.'px;background-color:'.$facbook_bg_color.';"></iframe>';
			echo '<script>jQuery(document).ready(function(){like_box_animated_element("'.like_box_setting::get_animations_type_array($animation).'","like_box_widget_'.self::$id_of_like_box.'"); jQuery(window).scroll(function(){like_box_animated_element("'.like_box_setting::get_animations_type_array($animation).'","like_box_widget_'.self::$id_of_like_box.'");})});</script>';
		// After widget //
		
		echo $after_widget;
	}

	// Update Settings //
		function update($new_instance, $old_instance) {	
		extract( $args );
		$instance['title'] = strip_tags($new_instance['title']);    
		$instance['profile_id'] = $new_instance['profile_id'];
		$instance['connections'] = $new_instance['connections'];
		$instance['width'] = $new_instance['width'];
		$instance['height'] = $new_instance['height'];
		$instance['header'] = $new_instance['header'];
		$instance['locale'] = $new_instance['locale'];
		return $instance;  /// return new value of parametrs
		
	}

	/* admin page opions */
	function form($instance) {
		
		$defaults = array( 'title' => '','profile_id' => '', 'connections' => '6','width' => '300','height' => '550','header' => false,'locale' => 'en_US');
		$instance = wp_parse_args( (array) $instance, $defaults );
		?>
        

        <p class="flb_field">
          <label for="title">Title:</label>
          <br>
          <input id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $instance['title']; ?>" class="widefat">
        </p>
        <p class="flb_field">
          <label for="<?php echo $this->get_field_id('profile_id'); ?>">Page ID:</label>
          <br>
          <input id="<?php echo $this->get_field_id('profile_id'); ?>" name="<?php echo $this->get_field_name('profile_id'); ?>" type="text" value="<?php echo $instance['profile_id']; ?>" class="widefat">
        </p>
        
        <label>Facebook Like box Theme <span style="color:rgba(10, 154, 62, 1);;font-weight:bold;">Pro feature!</span></label>
        <br>
        <select onclick="alert('If you want to use this feature upgrade to Like box Pro')">
         	<option selected="selected" value="light">Light</option>
          	<option value="dark">Dark</option>
        </select>
        <br>
        <br>
         <label>Facebook Like box Animation<span style="color:rgba(10, 154, 62, 1);;font-weight:bold;">Pro feature!</span></label>
        <br>
       
        <?php  like_box_setting::generete_animation_select('gagggoo','none') ?>
        <br>
        <br>
         <label>Facebook Like box background color <span style="color:rgba(10, 154, 62, 1);;font-weight:bold;">Pro feature!</span></label>
        <br>
        <div class="disabled_for_pro" onclick="alert('If you want to use this feature upgrade to Like box Pro')">
          <div class="wp-picker-container"><a tabindex="0" class="wp-color-result" title="Select Color" data-current="Current Color" style="background-color: rgb(255, 255, 255);"></a></div>
        </div>
        <br>
        <label>Facebook Like box Border Color<span style="color:rgba(10, 154, 62, 1);;font-weight:bold;">Pro feature!</span></label>
        <br>
        <div class="disabled_for_pro" onclick="alert('If you want to use this feature upgrade to Like box Pro')">
          <div class="wp-picker-container"><a tabindex="0" class="wp-color-result" title="Select Color" data-current="Current Color" style="background-color: rgb(255, 255, 255);"></a></div>
        </div>
        <br>
        
        <label>Show Facebook Like box border <span style="color:rgba(10, 154, 62, 1);;font-weight:bold;">Pro feature!</span></label>
        <br>
        <input onMouseDown="alert('If you want to use this feature upgrade to Like box Pro')"  name="<?php echo $this->get_field_name('show_border'); ?>" type="radio" value="yes" checked='checked'>Yes
        <input onMouseDown="alert('If you want to use this feature upgrade to Like box Pro')" name="<?php echo $this->get_field_name('show_border'); ?>" type="radio" value="no">No
        <br>
        
        <p class="flb_field">
          <label >Show Facebook latest posts: <span style="color:rgba(10, 154, 62, 1);;font-weight:bold;">Pro feature!</span></label>
          &nbsp;
          <input onMouseDown="alert('If you want to use this feature upgrade to Like box Pro')" type="checkbox" value="1"  >
        </p>
        
        <p class="flb_field">
          <label for="<?php echo $this->get_field_id('connections'); ?>">Number of connections:</label>
          <br>
          <input id="<?php echo $this->get_field_id('connections'); ?>" name="<?php echo $this->get_field_name('connections'); ?>" type="text" value="<?php echo $instance['connections']; ?>" class="" size="3">
          <small>(Max. 100)</small>
        </p>
          
        <p class="flb_field">
          <label for="<?php echo $this->get_field_id('width'); ?>">Like box Width:</label>
          <br>
          <input id="<?php echo $this->get_field_id('width'); ?>" name="<?php echo $this->get_field_name('width'); ?>" type="text" value="<?php echo $instance['width']; ?>" class="" size="3">
          <small>(px)</small>
        </p>
        
        <p class="flb_field">
          <label for="<?php echo $this->get_field_id('height'); ?>">Like box Height:</label>
          <br>
          <input id="<?php echo $this->get_field_id('height'); ?>" name="<?php echo $this->get_field_name('height'); ?>" type="text" value="<?php echo $instance['height']; ?>" class="" size="3">
          <small>(px)</small>
        </p>
        
        <p class="flb_field">
          <label for="<?php echo $this->get_field_id('header'); ?>">Facebook Like box header:</label>
          &nbsp;
          <input id="<?php echo $this->get_field_id('header'); ?>" name="<?php echo $this->get_field_name('header'); ?>" type="checkbox" value="1" class="" size="" <?php checked($instance['header'],1) ?>>
          <small>Show/Hide</small>
        </p>
        
        <p class="flb_field">
          <label for="<?php echo $this->get_field_id('locale'); ?>">Like box language:</label>
          <br>
          <input id="<?php echo $this->get_field_id('locale'); ?>" name="<?php echo $this->get_field_name('locale'); ?>" type="text" value="<?php echo $instance['locale']; ?>" class="" size="4">
          <small>(en_US, de_DE...)</small>
        </p>
        <a href="http://wpdevart.com/wordpress-facebook-like-box-plugin/" target="_blank" style="color: rgba(10, 154, 62, 1);; font-weight: bold; font-size: 18px; text-decoration: none;">Upgrade to Pro Version</a><br>
        <br>
        <input type="hidden" id="flb-submit" name="flb-submit" value="1">
        <script>
		var pro_text='If you want to use this feature upgrade to Like box Pro';
            jQuery(".color_my_likbox").ready(function(e) {
				
				jQuery(".color_my_likbox").each(function(index, element) {
                    if(!jQuery(this).hasClass('wp-color-picker') && jQuery(this).attr('name').indexOf('__i__')==-1){console.log(this); jQuery(this).wpColorPicker()};
                });
               
            });
        </script> 
		<?php 
	}
}
add_action('widgets_init', create_function('', 'return register_widget("like_box_facbook");'));