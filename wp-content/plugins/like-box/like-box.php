<?php 
/*
Plugin Name: Facebook Like Box
Plugin URI: https://wordpress.org/plugins/like-box
Description: Our Facebook like box plugin will help you to display Facebook like box on your wesite, just add Facebook Like box widget to your sidebar and use it. Also you can use Facebook Like box on your pages/posts and create Facebook Like box popup for your website.
Version: 0.5.1
Author: smplug-in
Author URI: wordpress.org
License: GPL3
*/
add_action('wp_head','requared_javascript_functions_fb_likbox_front');
function requared_javascript_functions_fb_likbox_front(){
		wp_enqueue_script('jquery');
		wp_enqueue_style('thickbox'); 
		wp_print_scripts('thickbox');
}
add_action('admin_head','requared_javascript_functions_fb_likbox');
function requared_javascript_functions_fb_likbox(){
		wp_enqueue_script('wp-color-picker');
		wp_enqueue_style( 'wp-color-picker' );
}
function like_box_facebook($profile_id, $connections = 5, $width = 300, $height = 550, $header = 0, $locale = '') {
  $output = '';
  if ($profile_id != '') {
		$header = ($header == 1) ? 'true' : 'false'; 		     
		$output = '<iframe src="http://www.facebook.com/plugins/fan.php?id='.$profile_id.'&amp;width='.$width.'&amp;colorscheme=light&amp;height='.$height.'&amp;connections='.$connections.'&amp;stream=false&amp;header='.$header.'&amp;locale='.$locale.'" scrolling="no" frameborder="0" allowTransparency="true" style="border:1px solid #FFFFFF; overflow:hidden; width:'.$width.'px; height:'.$height.'px"></iframe>';
  }
  return $output;
}
class like_box_facbook extends WP_Widget {
	// Constructor //	
	function __construct() {		
		$widget_ops = array( 'classname' => 'like_box_facbook', 'description' => 'Like box Facebook ' ); // Widget Settings
		$control_ops = array( 'id_base' => 'like_box_facbook' ); // Widget Control Settings
		$this->WP_Widget( 'like_box_facbook', 'Like box Facebook', $widget_ops, $control_ops ); // Create the widget
	}

	/*poll display in front*/
	function widget($args, $instance) {
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
			echo like_box_facebook($profile_id, $connections, $width, $height, $header, $locale);
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
		global $wpdb;
		$defaults = array( 'title' => '','profile_id' => '','theme_color' => 'light','border_color' => '#FFF','show_border' => 'yes','stream' => false, 'connections' => '6','width' => '300','height' => '550','header' => false,'locale' => 'en_US');
		$instance = wp_parse_args( (array) $instance, $defaults );
		$poll_answers=$wpdb->get_results('SELECT * FROM '.$wpdb->prefix.'polls_question');
		$poll_themes=$wpdb->get_results('SELECT * FROM '.$wpdb->prefix.'polls_templates');
		?>
        

        <p class="flb_field">
          <label for="title">Title:</label>
          <br>
          <input id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $instance['title']; ?>" class="widefat">
        </p>
        <p class="flb_field">
          <label for="<?php echo $this->get_field_id('profile_id'); ?>">Page ID(URL):</label>
          <br>
          <input id="<?php echo $this->get_field_id('profile_id'); ?>" name="<?php echo $this->get_field_name('profile_id'); ?>" type="text" value="<?php echo $instance['profile_id']; ?>" class="widefat">
        </p>
        
        <label>Facebook Like box Theme <span style="color:rgba(10, 154, 62, 1);;font-weight:bold;">Pro feature!</span></label>
        <br>
        <select onclick="alert('To use this features get the pro version for only 8$ !')">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <br>
        <br>
        
        <label for="border_color">Facebook Like box Border Color <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label>
        <br>
         <div class="disabled_for_pro" onclick="alert('To use this features get the pro version for only 8$ !')">
          <div class="wp-picker-container"><a tabindex="0" class="wp-color-result" title="Select Color" data-current="Current Color" style="background-color: rgb(255, 255, 255);"></a></div>
        </div>
        <br>
        
        <label>Show Facebook Like box border <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label>
        <br>
        <input type="radio" value="yes" name="<?php echo $this->get_field_name('width'); ?>11"  onclick="alert('To use this features get the pro version for only 8$ !'); return false;" checked >Yes
        <input type="radio" value="no" name="<?php echo $this->get_field_name('width'); ?>11" onclick="alert('To use this features get the pro version for only 8$ !'); return false;" >No
        <br>
        
        <p class="flb_field">
          <label>Show Facebook latest posts: <span style="color:rgba(10, 154, 62, 1); font-weight:bold;">Pro feature!</span></label>
          &nbsp;
          <input onclick="alert('To use this features get the pro version for only 8$ !'); return false;" type="checkbox" value="1" >
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
            jQuery(document).ready(function(e) {
                if(!jQuery(".color_my_likbox").hasClass('wp-color-picker')) jQuery(".color_my_likbox").wpColorPicker();
            });
        </script> 
		<?php 
	}
}
add_action('widgets_init', create_function('', 'return register_widget("like_box_facbook");'));

/*  Like Box Button */

add_action('media_buttons_context', 'like_box_button');

function like_box_button($context) {
  
  $img = plugins_url( '/images/post.button.png' , __FILE__ );

  $title = 'Add Like Box';

  $context .= '<a class="button thickbox" title="Create facebook like box and insert in posts/pages"    href="'.admin_url("admin-ajax.php").'?action=like_box_window_manager&height=750">
		<span class="wp-media-buttons-icon" style="background: url('.$img.'); background-repeat: no-repeat; background-position: left bottom;"></span>
	Add like box
	</a>';  
  return $context;
}


add_action( 'wp_ajax_like_box_window_manager', 'like_box_window_insert_content' );


function like_box_window_insert_content(){
?> <?php
		global $wpdb;
		$instance = array( 'title' => '','profile_id' => '','theme_color' => 'light','border_color' => '#FFF','show_border' => 'yes','stream' => false, 'connections' => '6','width' => '300','height' => '550','header' => false,'locale' => 'en_US');
		$poll_answers=$wpdb->get_results('SELECT * FROM '.$wpdb->prefix.'polls_question');
		$poll_themes=$wpdb->get_results('SELECT * FROM '.$wpdb->prefix.'polls_templates');
		?>
        
        <div id="miain_like_box_window_manager">	

          <label for="like_box_profile_id">Page ID(URL):</label>
          <br>
          <input id="like_box_profile_id" type="text" value="<?php echo $instance['profile_id']; ?>" class="widefat">
        
        
        <label for="like_box_theme_color">Facebook Like box Theme <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label>
        <br>
        <select id="like_box_theme_color" onclick="alert('To use this features get the pro version for only 8$ !'); return false;">
          <option <?php selected( $instance['theme_color'],"light") ?> value="light">Light</option>
          <option <?php selected( $instance['theme_color'],"dark") ?> value="dark">Dark</option>
        </select>
        <br>
        <br>
        
        <label for="border_color">Facebook Like box Border Color <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label>
        <br>
         <div class="disabled_for_pro" onclick="alert('To use this features get the pro version for only 8$ !')">
          <div class="wp-picker-container"><a tabindex="0" class="wp-color-result" title="Select Color" data-current="Current Color" style="background-color: rgb(255, 255, 255);"></a></div>
        </div>
        <br>
        
        <label>Show Facebook Like box border <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label>
        <br>
        <input type="radio" value="yes" name="like_box_show_bord11"  onclick="alert('To use this features get the pro version for only 8$ !'); return false;" checked >Yes
        <input type="radio" value="no" name="like_box_show_bord11" onclick="alert('To use this features get the pro version for only 8$ !'); return false;" >No
        <br>
        
        <p class="flb_field">
          <label>Show Facebook latest posts: <span style="color:rgba(10, 154, 62, 1); font-weight:bold;">Pro feature!</span></label>
          &nbsp;
          <input onclick="alert('To use this features get the pro version for only 8$ !'); return false;" type="checkbox" value="1" >
        </p>
        
        <p class="flb_field">
          <label for="like_box_connections">Number of connections:</label>
          <br>
          <input id="like_box_connections" type="text" value="<?php echo $instance['connections']; ?>" class="" size="3">
          <small>(Max. 100)</small>
        </p>
          
        <p class="flb_field">
          <label for="like_box_width">Like box Width:</label>
          <br>
          <input id="like_box_width"  type="text" value="<?php echo $instance['width']; ?>" class="" size="3">
          <small>(px)</small>
        </p>
        
        <p class="flb_field">
          <label for="like_box_height">Like box Height:</label>
          <br>
          <input id="like_box_height" type="text" value="<?php echo $instance['height']; ?>" class="" size="3">
          <small>(px)</small>
        </p>
        
        <p class="flb_field">
          <label for="like_box_header">Facebook Like box header:</label>
          &nbsp;
          <input id="like_box_header" type="checkbox" value="1" class="" size="" <?php checked($instance['header'],1) ?>>
          <small>Show/Hide</small>
        </p>
        
        <p class="flb_field">
          <label for="like_box_locale">Like box language:</label>
          <br>
          <input id="like_box_locale" type="text" value="<?php echo $instance['locale']; ?>" class="" size="4">
          <small>(en_US, de_DE...)</small>
        </p>	
	</div>
    <div class="mceActionPanel">
            <div style="float: left">
                <input type="button" id="cancel" name="cancel" value="Insert Like Box" class="button button-primary" onClick="insert_like_box();"/>
            </div> 
            <div style="float: right">   
            	<span style="float:right"><a href="http://wpdevart.com/wordpress-facebook-like-box-plugin/" target="_blank" style="color: rgba(10, 154, 62, 1);; font-weight: bold; font-size: 18px; text-decoration: none;">Upgrade to Pro Version</a><br></span>      
  			</div> 
    </div>
    <script type="text/javascript">
	  jQuery('#miain_like_box_window_manager').ready(function(e) {
                jQuery(".color_my_likbox").wpColorPicker();
            });
        function insert_like_box() {
          
			if(jQuery('#poll_answer_id').val()!='0'){
                var tagtext;
				like_box_header=0;
				if(jQuery('#like_box_header').prop('checked'))
					like_box_header=1;
				like_box_stream=0;
				if(jQuery('#like_box_stream').prop('checked'))
					like_box_stream=1;
				var generete_atributes = 'profile_id="'+jQuery('#like_box_profile_id').val()+'" connections="'+jQuery('#like_box_connections').val()+'" width="'+jQuery('#like_box_width').val()+'" height="'+jQuery('#like_box_height').val()+'" header="'+like_box_header+'" locale="'+jQuery('#like_box_locale').val()+'"';
                tagtext = '[wpdevart_like_box '+generete_atributes+']';
				window.send_to_editor(tagtext);
              	tb_remove()
            }
			else{
				tb_remove()
			}
        }

    </script>
    </body>
    </html>
<?php
die;	
}
function wpdevart_like_box_shortcode( $atts ) {
	return like_box_facebook($atts['profile_id'], $atts['connections'], $atts['width'], $atts['height'], $atts['header'], $atts['locale']);
}
add_shortcode( 'wpdevart_like_box', 'wpdevart_like_box_shortcode' );



/* Like Box admin menu*/



add_action( 'wp_ajax_like_box_popup_save_parametrs', 'like_box_save_in_databese' );
function like_box_save_in_databese(){
	$instance= array( 
		'like_box_enable_like_box' =>  '{"yes":false,"no":true}',
		'like_box_profile_id' =>  '',
		'like_box_connections' =>  '6',
		'like_box_width' =>  '300',
		'like_box_height' =>  '550',
		'like_box_header' =>  '1',
		'like_box_locale' =>  'en_US',
	);
	$kk=1;	
		if(isset($_POST['like_box_save_nonce_request']) && wp_verify_nonce( $_POST['like_box_save_nonce_request'],'like_box_save_nonce')){
			
			foreach($instance as $key => $value){
				if(isset($_POST[$key])){
					update_option($key,stripslashes($_POST[$key]));
				}
				else{
					$kk=0;
					printf('error saving %s <br>',$key);
				}
			}	
		}
		else{
			die('Authorization Problem ');
		}
		if($kk==0){
			exit;
		}
		die('sax_normala');
	
}
add_action('admin_menu', 'like_box_create_menu');
function like_box_create_menu(){
	$manage_page = add_menu_page('Like box','Like box', 'manage_options', 'like-box', 'facbook_like_box_menu');
	add_action('admin_print_styles-' .$manage_page, 'like_box_menu_requeried_scripts');	
}
function like_box_menu_requeried_scripts(){
	wp_enqueue_style('like-box-admin-style',plugins_url('',__FILE__).'/style/admin_style.css');
}
function facbook_like_box_menu(){
	$instance= array( 
		'like_box_enable_like_box' =>  '{"yes":false,"no":true}',
		'like_box_profile_id' =>  '',
		'like_box_connections' =>  '6',
		'like_box_width' =>  '300',
		'like_box_height' =>  '550',
		'like_box_header' =>  '{"show":false}',
		'like_box_locale' =>  'en_US' 
	);
	foreach($instance as $key => $value){
		if(!get_option($key,FALSE)===FALSE)
			$instance[$key]=get_option($key);
	}
	?>
		
        
        <h2>Facebook like box popup</h2>	
        <div id="miain_like_box_popup_menu">	
        <table class="wp-list-table widefat fixed posts" style="width: 85%; min-width:320px !important">
            <thead>
                <tr>
                    <th>
                   		<span> Facebook like box popup Settings </span>
                    </th>
                    <th>
                   		<span style="float:right"><a href="http://wpdevart.com/wordpress-facebook-like-box-plugin/" target="_blank" style="color: rgba(10, 154, 62, 1);; font-weight: bold; font-size: 18px; text-decoration: none;">Upgrade to Pro Version</a><br></span>
                    </th>               
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>     
                    <?php $jsone_enable_like_box= json_decode(stripslashes($instance['like_box_enable_like_box']), true);?>              		
                        <label class="like_box_titile">Facebook Like box popup:</label><br>
                            <label style="margin-right:10px">
                            <input id="like_box_show_border_yes" class radio class="enable_like_box" type="radio" name="enable_like_box" value="yes" <?php checked($jsone_enable_like_box['yes'],true) ?> >Enable
                        </label>
                        <label> 
                        	<input id="like_box_show_border_no" class="enable_like_box" type="radio" name="enable_like_box" value="no" <?php checked($jsone_enable_like_box['no'],true) ?> >Disable
                        </label>
                        <input type="hidden" id="like_box_enable_like_box" class="like_box_hidden_parametr" value='<?php echo $instance['like_box_enable_like_box']; ?>'>
                    </td>
                </tr>
                
                <tr>
                    <td>                  
                   	 	<label class="like_box_titile">Display Like box on: <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label><br>
                        <input id="like_box_show_in_home" onclick="alert('To use this features get the pro version for only 8$ !'); return false;" type="checkbox" value="home" checked ><small>Home</small><br>
                        <input id="like_box_show_in_post" onclick="alert('To use this features get the pro version for only 8$ !'); return false;" type="checkbox" value="post" checked><small>Post</small><br>
                        <input id="like_box_show_in_page" onclick="alert('To use this features get the pro version for only 8$ !'); return false;" type="checkbox" value="page" checked><small>Page</small><br>
                        <input id="like_box_show_in_everywhere" onclick="alert('To use this features get the pro version for only 8$ !'); return false;" type="checkbox" value="everywhere" checked><small>Everywhere</small><br>                        
                    </td>
               </tr>
               
               <tr>
                    <td>                
                        <label class="like_box_titile">Show Like box One time or Every time when user visit website  <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label></label>
                        <br>
                        <select onclick="alert('To use this features get the pro version for only 8$ !'); return false;" id="like_box_popup_show_quantity">
                            <option>Оne Тime</option>
                            <option selected>Еvery Тime</option>
                        </select>
                    </td>
                </tr>
                
               <tr>
                    <td>
                        <label  class="like_box_titile">Seconds for Like box popup to appear ?: <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label>
                        <br>
                        <input id="like_box_secont_befor_show" type="text" value="3" onclick="alert('To use this features get the pro version for only 8$ !'); return false;" size="3"><small>(Seconds)</small>
                    </td>
                </tr>
                
                <tr>
                    <td>       
                        <label class="like_box_titile">Page ID(URL):</label>
                        <br>
                        <input id="like_box_profile_id" type="text" placeholder="Example: uefachampionsleague" size="30" value="<?php echo $instance['like_box_profile_id']; ?>" >
                    </td>
                </tr>
                
                <tr>
                    <td>                
                        <label class="like_box_titile">Facebook Like box Theme <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label>
                        <br>
                        <select id="like_box_theme_color" onclick="alert('To use this features get the pro version for only 8$ !'); return false;">
                            <option selected value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </td>
                </tr>
                
                <tr>
                    <td>
                       <label for="border_color" class="like_box_titile">Facebook Like box Border Color <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label>
                        <br>
                         <div class="disabled_for_pro" onclick="alert('To use this features get the pro version for only 8$ !')">
                          <div class="wp-picker-container"><a tabindex="0" class="wp-color-result" title="Select Color" data-current="Current Color" style="background-color: rgb(255, 255, 255);"></a></div>
                        </div>
                        <br>
                    </td>
                </tr>
                
                <tr>
                    <td>    
                        <label class="like_box_titile">Show Facebook Like box border <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label>
                        <br>
                        <label style="margin-right:10px">
                        	<input id="like_box_show_border33" onclick="alert('To use this features get the pro version for only 8$ !'); return false;"  class="like_box_show_border" type="radio" name="like_box_show_border" value="yes" checked >Yes
                        </label>
                        <label> 
                        	<input id="like_box_show_border1" onclick="alert('To use this features get the pro version for only 8$ !'); return false;" class="like_box_show_border" type="radio" name="like_box_show_border" value="no" >No
                        </label>
                    </td>
                </tr>
                
                <tr>
                    <td>
                        <label class="like_box_titile">Show Facebook latest posts:  <span style="color:rgba(10, 154, 62, 1);font-weight:bold;">Pro feature!</span></label>                     
                        <input id="like_box_stream_radio" onclick="alert('To use this features get the pro version for only 8$ !'); return false;"  type="checkbox" value="show">
                    </td>
                </tr>
                
                <tr>
                    <td>
                        <label class="like_box_titile">Number of connections:</label>
                        <br>
                        <input id="like_box_connections" type="text" value="<?php echo $instance['like_box_connections']; ?>" class="" size="3"> <small>(Max. 100)</small>
                    </td>
                </tr>
                
                <tr>
                    <td>
                        <label class="like_box_titile">Like box Width:</label>
                        <br>
                        <input id="like_box_width"  type="text" value="<?php echo $instance['like_box_width']; ?>" class="" size="3"><small>(px)</small>
                    </td>
                </tr>
                
                <tr>
                    <td>
                        <label class="like_box_titile">Like box Height:</label>
                        <br>
                        <input id="like_box_height" type="text" value="<?php echo $instance['like_box_height']; ?>" class="" size="3"><small>(px)</small>
                    </td>
                </tr>
                
                <tr>
                    <td>
                     <?php $jsone_like_box_header= json_decode(stripslashes($instance['like_box_header']), true);?> 
                        <label class="like_box_titile">Facebook Like box header:</label>
                        <br>
                        
                        <input id="like_box_headeras" type="checkbox" value="show" <?php checked($jsone_like_box_header['show'],true) ?>><small>Show/Hide</small>
                         <input id="like_box_header" type="hidden" class="like_box_hidden_parametr" value='<?php echo $instance['like_box_header']; ?>' >
                    </td>
                </tr>
                
                <tr>
                    <td>
                        <label class="like_box_titile">Like box language:</label>
                        <br>
                       
                        <input id="like_box_locale" type="text" value="<?php echo $instance['like_box_locale']; ?>" class="" size="4">
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="2" width="100%"><button type="button" id="save_button_design" class="save_button button button-primary"><span class="save_button_span">Save Settings</span> <span class="saving_in_progress"> </span><span class="sucsses_save"> </span><span class="error_in_saving"> </span></button></th>
                    
                </tr>
            </tfoot>
		</table>
	</div>

            	<br /><br />
            <span class="error_massage"></span>
            <?php wp_nonce_field('like_box_save_nonce','like_box_save_nonce'); ?>
		<script>
		jQuery(document).ready(function(e) {

            jQuery("#like_box_border_color").wpColorPicker();
			
			 //generete_radio_input(jQuery('#coming_soon_page_radio_backroundcolor'));
			 jQuery('#save_button_design').click(function(){
					
					jQuery('#save_button_design').addClass('padding_loading');
					jQuery("#save_button_design").prop('disabled', true);
					jQuery('.saving_in_progress').css('display','inline-block');
					jQuery('.like_box_hidden_parametr').each(function(index, element) {
                        generete_input_values(this);
                    });
					
					//generete_radio_input_hidden(jQuery('#page_content_position'));
					jQuery.ajax({
						type:'POST',
						url: "<?php echo admin_url( 'admin-ajax.php?action=like_box_popup_save_parametrs' ); ?>",
						data: {like_box_save_nonce_request:jQuery('#like_box_save_nonce').val()<?php foreach($instance as $key => $value){echo ','.$key.':jQuery("#'.$key.'").val()';} ?>},
					}).done(function(date) {
						if(date=='sax_normala'){
							console.log
						jQuery('.saving_in_progress').css('display','none');
						jQuery('.sucsses_save').css('display','inline-block');
						setTimeout(function(){jQuery('.sucsses_save').css('display','none');jQuery('#save_button_design').removeClass('padding_loading');jQuery("#save_button_design").prop('disabled', false);},2500);
						}else{
							jQuery('.saving_in_progress').css('display','none');
							jQuery('.error_in_saving').css('display','inline-block');
							jQuery('.error_massage').css('display','inline-block');
							jQuery('.error_massage').html(date);
							setTimeout(function(){jQuery('#coming_soon_options_form .error_massage').css('display','none');jQuery('#coming_soon_options_form .error_in_saving').css('display','none');jQuery('#save_button_design').removeClass('padding_loading');jQuery("#save_button_design").prop('disabled', false);},5000);
						}

					});
				});
				function generete_input_values(hidden_element){
					var element_array = {};
					jQuery(hidden_element).parent().find('input[type=radio],input[type=checkbox]').each(function(index, element) {						
                        element_array[jQuery(this).val()]=jQuery(this).prop('checked');
                    });
					jQuery(hidden_element).val(JSON.stringify(element_array));
				}

		});
			
        </script>
		<?php
}
function leike_box_get_jsoned_parametrs($jsone_string){
	$return_array= array();
	if($jsone_string){
		$jsone_array= json_decode(stripslashes($jsone_string), true); 
		if(count( $jsone_array)>0){
			foreach($jsone_array as $key => $value){
				if($value==true || $value=='true')
			  		$return_array[$key]=$value;
			}
		}
	}	
	return $return_array;
}





/*FRONT END*/
add_action( 'wp_ajax_likeboxfrontend', 'like_box_ifreame_generator' );
add_action( 'wp_ajax_nopriv_likeboxfrontend', 'like_box_ifreame_generator' );
function like_box_ifreame_generator(){
	$instance= array( 
		'like_box_enable_like_box' =>  '{"yes":false,"no":true}',		
		'like_box_profile_id' =>  '',
		'like_box_connections' =>  '6',
		'like_box_width' =>  '300',
		'like_box_height' =>  '550',
		'like_box_header' =>  '{"show":false}',
		'like_box_locale' =>  'en_US' 
	);
	foreach($instance as $key => $value){
		if(!get_option($key,FALSE)===FALSE)
			$instance[$key]=get_option($key);
	}
		$jsone_like_box_header= json_decode(stripslashes($instance['like_box_header']), true); 
	echo like_box_facebook($instance['like_box_profile_id'], $instance['like_box_connections'], $instance['like_box_width'],  $instance['like_box_height'], $jsone_like_box_header['show'], $instance['like_box_locale']);
die();
}
add_action( 'wp_footer','like_box_add_code_in_footer');	
function like_box_add_code_in_footer(){
	
	$instance= array( 
		'like_box_enable_like_box' =>  '{"yes":false,"no":true}',
		'like_box_profile_id' =>  '',
		'like_box_connections' =>  '6',
		'like_box_width' =>  '300',
		'like_box_height' =>  '550',
		'like_box_header' =>  '{"show":false}',
		'like_box_locale' =>  'en_US' 
	);
	foreach($instance as $key => $value){
		if(!get_option($key,FALSE)===FALSE)
			$instance[$key]=get_option($key);
	}
	$instance['like_box_width']=$instance['like_box_width']-9;
	$instance['like_box_height']=$instance['like_box_height']+9;
	$jsone_enable_like_box= json_decode(stripslashes($instance['like_box_enable_like_box']), true);
	if($jsone_enable_like_box['yes']== true){	
		?><script>
		function like_box_setCookie(cname, cvalue, exdays) {
			var d = new Date();
			d.setTime(d.getTime() + (exdays*24*60*60*1000));
			var expires = "expires="+d.toUTCString();
			document.cookie = cname + "=" + cvalue + "; " + expires+"; path=/";
		}
		function like_box_getCookie(cname) {
			var name = cname + "=";
			var ca = document.cookie.split(';');
			for(var i=0; i<ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1);
				if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
			}
			return "";
		}
		
		jQuery(document).ready(function(){ 
			setTimeout(function(){tb_show('','<?php echo admin_url('admin-ajax.php').'?action=likeboxfrontend&TB_iframe=true&height='.$instance['like_box_height'].'&width='.$instance['like_box_width'] ?>')},3000);
		})</script><?php
	}
}
