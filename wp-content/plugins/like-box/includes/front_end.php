<?php 

class like_box_front_end{
	private $menu_name;
	
	private $plugin_url;
	
	private $databese_parametrs;
	
	private $params;
	
	public static $id_for_content=0;

	function __construct($params){
		
		$this->databese_parametrs=$params['databese_parametrs'];
		//if plugin url not come in parent class
		if(isset($params['plugin_url']))
			$this->plugin_url=$params['plugin_url'];
		else
			$this->plugin_url=trailingslashit(dirname(plugins_url('',__FILE__)));

		//hooks for popup iframe
		add_action( 'wp_ajax_likeboxfrontend', array($this,'like_box_ifreame_generator') );
		add_action( 'wp_ajax_nopriv_likeboxfrontend', array($this,'like_box_ifreame_generator') );
		//genereting js code for inserting footer
		add_action( 'wp_footer', array($this,'like_box_popup_in_footer'));
		add_action( 'wp_footer', array($this,'like_box_sibar_slider_in_footer'));	
		add_action('wp_head',array($this,'generete_front_javascript'));
		// genereting code for content
		add_shortcode( 'wpdevart_like_box', array($this,'like_box_ifreame_content_generator') );
		$this->params=$this->generete_params();
		
		// add shortcode
		add_shortcode( 'wpdevart_like_box', array($this,'wpdevart_like_box_shortcode') );
		//for updated parametrs
		
		$jsone_enable_like_box= json_decode(stripslashes($this->params['like_box_enable_like_box']), true); 
		if($jsone_enable_like_box!=NULL){
			if($jsone_enable_like_box['yes']==true){
				$this->params['like_box_enable_like_box']='yes';
			}elseif($jsone_enable_like_box['no']==true){
				$this->params['like_box_enable_like_box']='no';
			}else{
				$this->params['like_box_enable_like_box']='yes';
			}
		}
		$jsone_like_box_header= json_decode(stripslashes($this->params['like_box_header']), true); 
		if($jsone_like_box_header!=NULL){
			if($jsone_like_box_header['show']==true){
				$this->params['like_box_header']='yes';
			}else{
				$this->params['like_box_header']='yes';
			}
		}
		
	}
	/*###################### CONECTING TO DATABESE ##################*/
	private function generete_params(){
		
		foreach($this->databese_parametrs as $param_array_key => $param_value){
			foreach($this->databese_parametrs[$param_array_key] as $key => $value){
				$front_end_parametrs[$key]=stripslashes(get_option($key,$value));
			}
		}		
		return $front_end_parametrs;
		
	}
	/*###################### scripts and styles ##################*/
	public function generete_front_javascript(){
			wp_enqueue_style('animated');
			wp_enqueue_style('front_end_like_box');
			wp_enqueue_script('like-box-front-end');
			wp_enqueue_script('thickbox');
			wp_enqueue_style('thickbox');
		
	}
	
	/*creating iframe for content*/
	public function like_box_ifreame_content_generator($atts){
		self::$id_for_content++;
		$atts = shortcode_atts( array(
			'profile_id' =>  '',
			'animation_efect'=>'none',
			'background_color'=>'',
			'theme_color' =>  'light',
			'border_color' =>  '#FFFFF',
			'show_border' =>  'yes',
			'stream' =>  '0',
			'connections' =>  '6',
			'width' =>  '300',
			'height' =>  '550',
			'header' =>  '0',
			'locale' =>  'en_US',
		), $atts, 'wpdevart_like_box' );
			$output='<iframe id="like_box_content_'.self::$id_for_content.'" src="http://www.facebook.com/plugins/fan.php?id='.$atts['profile_id'].'&amp;width='.$atts['width'].'&amp;colorscheme='.$atts['theme_color'].'&amp;height='.$atts['height'].'&amp;connections='.$atts['connections'].'&amp;stream='.$atts['stream'].'&amp;header='.$atts['header'].'&amp;locale='.$atts['locale'].'&amp;show_border='.(($atts['show_border']=='yes')?'true':'false').'" scrolling="no" frameborder="0" allowTransparency="true" style="'.(($atts['show_border']=='yes')?'border:1px solid '.$atts['border_color'].';':'border:none').' overflow:hidden;visibility:hidden; max-width:100%; width:'.$atts['width'].'px; height:'.$atts['height'].'px;background-color:'.$atts['background_color'].';"></iframe>';
			$output.='<script>jQuery(document).ready(function(){like_box_animated_element("'.like_box_setting::get_animations_type_array($atts['animation_efect']).'","like_box_content_'.self::$id_for_content.'"); jQuery(window).scroll(function(){like_box_animated_element("'.like_box_setting::get_animations_type_array($atts['animation_efect']).'","like_box_content_'.self::$id_for_content.'");})});</script>';

		return  $output;
	}
	/*###################### creating iframe Popup ##################*/

	public function like_box_ifreame_generator(){
			
			$iframe_params=array(
				'profile_id'	=>$this->params['like_box_profile_id'],				
				'width'			=>$this->params['like_box_width'],
				'height'		=>$this->params['like_box_height'],	
				'header'		=>($this->params['like_box_header']=='yes')?'true':'false',
				'connections'	=>$this->params['like_box_connections'],
				'locale'		=>$this->params['like_box_locale'],		
			);
			
			
		?>
        <html>
        <head>        
        </head>
        <body>
           <iframe id="like_box_popup" src="http://www.facebook.com/plugins/fan.php?id=<?php echo $iframe_params['profile_id']; ?>&amp;width=<?php echo $iframe_params['width']; ?>&amp;colorscheme=light&amp;height=<?php echo ($iframe_params['height']-64); ?>&amp;connections=<?php echo $iframe_params['connections']; ?>&amp;stream=false&amp;header=<?php echo $iframe_params['header']; ?>&amp;locale=<?php echo $iframe_params['locale']; ?>&amp;show_border=true" scrolling="no" frameborder="0" allowTransparency="true" style="overflow:hidden; width:100%; height:100%"></iframe>
        </body>
         <script>
			document.getElementById('like_box_popup').style.height=document.getElementsByTagName('body')[0].offsetHeight-20;
			window.onresize = function(event) {
				document.getElementById('like_box_popup').style.height=document.getElementsByTagName('body')[0].offsetHeight-8;
			};
        </script>
        </html>
        <?php
			die();

	}
	/*########################## popup ########################*/
	public function like_box_popup_in_footer(){

		$width=$this->params['like_box_width']-30;
		$height=$this->params['like_box_height']-44;
		
		$ifame_parametrs=array();
		
		if($this->params['like_box_enable_like_box']=='yes'){
		?><script>
			var like_box_initial_width=<?php echo $width; ?>;
			var like_box_initial_height=<?php echo $height+12; ?>;
			jQuery(document).ready(function(){ 
			
			
				setTimeout(function(){
					tb_show('<?php echo $this->params['like_box_popup_title']; ?>','<?php echo admin_url('admin-ajax.php').'?action=likeboxfrontend&TB_iframe=true&width='.$width.'&height='.($height-12);?>')
					jQuery('#TB_window').addClass('facbook_like_box_popup');
					jQuery(window).resize(like_box_resize_popup);
					like_box_resize_popup();				
				
				},1000);
				
									
				
			})</script>
			<style>
			.screen-reader-text{
				display:none;
			}
			.facbook_like_box_popup #TB_ajaxWindowTitle{
				color:<?php echo $this->params['like_box_popup_title_color']; ?>;
				font-family:<?php echo $this->params['like_box_popup_title_font_famely']; ?>;
			}
			
			</style>
			<?php
			
		}
	}
	
	public function css_like_box_sibar_slider_in_footer($width,$height){
		echo '<style>';
		
	
	
			echo '.like_box_slideup_close{left:-'.($width+2).'px;}';
			echo '.like_box_slideup_open{left:0px;}';
			echo '.sidbar_slide_header{';
			echo 'float:right; border-radius: 0 4px 4px 0;';
			echo '}';
			echo '.main_sidbar_slide{transition:left .3s;}';
	
		$top_for_margin=120;
		$top_for_margin=($this->params['like_box_sidebar_slide_height']-$this->params['like_box_sidebar_slide_pntik_height'])/2;
		echo '.sidbar_slide_header{height:'.$this->params['like_box_sidebar_slide_pntik_height'].'px; margin-top:'.$top_for_margin.'px;border-color:##405D9A !important;  background-color: #405D9A;}';
		echo '.sidbar_slide_title{font-family:'.$this->params['like_box_sidebar_slide_title_font_famely'].'; color: '.$this->params['like_box_sidebar_slide_title_color'].';}';
		echo '.sidbar_slide_content{width:'.$width.'px;}';
		echo '.sidbar_slide_inner_main {width:'.($width+40).'px;}';		
		echo '</style>';
		
	}

	public function like_box_sibar_slider_in_footer(){
		if($this->params['like_box_sidebar_slide_mode']=='yes'){ 
				$width=$this->params['like_box_sidebar_slide_width'];
				$height=$this->params['like_box_sidebar_slide_height'];
				?>
			   <div class="main_sidbar_slide like_box_slideup_close">
					<div class="sidbar_slide_inner_main ">
						<div class="sidbar_slide_header">
							<span class="sidbar_slide_title"><?php echo $this->params['like_box_sidebar_slide_title']; ?></span>
						</div>
						<div class="sidbar_slide_content">
							<div class="sidbar_slide_inner"><iframe id="like_box_slideup" src="http://www.facebook.com/plugins/fan.php?id=<?php echo $this->params['like_box_sidebar_slide_profile_id']; ?>&amp;width=<?php echo (int)$this->params['like_box_sidebar_slide_width']; ?>&amp;colorscheme=light&amp;height=<?php echo ((int)$this->params['like_box_sidebar_slide_height']); ?>&amp;connections=<?php echo (int)$this->params['like_box_sidebar_slide_connections']; ?>&amp;stream=false&amp;header=<?php echo ($this->params['like_box_sidebar_slide_header']=='yes')?'true':'false'; ?>&amp;locale=<?php echo $this->params['like_box_sidebar_slide_locale']; ?>&amp;show_border=false" scrolling="no" frameborder="0" allowTransparency="true" style="margin-bottom: -5px;overflow:hidden; width:100%; height:<?php echo ((int)$this->params['like_box_sidebar_slide_height']); ?>px"></iframe></div>
							</div>
						</div>
						
					</div>
				</div>
				<?php
				$this->css_like_box_sibar_slider_in_footer($width,$height);
			
		}
		
	}
}
?>