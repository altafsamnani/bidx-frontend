<?php

/*
  Plugin Name: bidx-cbi-plugin
  Plugin URI: http://bidx.net/plugin/bidx-cbi-plugin
  Description: Wordpress plugin for adding CBI site functions to a bidX website.
  Version: 0.1.1
  Author: bidX development team
  Author URI: http://bidx.net/plugin/bidx-cbi-plugin
  License: Commercial
 */

/**
 * Proxy class for interaction with CBI website.
 * Caches the data in the uploads directory
 * 
 * TODO : Consolidate remote get calls (code cleanup)
 * TODO : Dropdown view for shortcode for easy inclusion in a sidebar?
 * TODO : Support cache expiration 
 * 
 * @author Jaap Gorjup
 */
class CBIShortCode {
	
	/** url base where to load the content from **/
	private $base = "http://www.cbi.eu";
	/** query parameter for loading the references **/
	private $URL_id = "CBIURL";

	/**
	 * Loads the binary data using this proxy.
	 * Checks if the binary is already stored and else streams it to that location to load it.
	 */
	public function loadBinary() {
		
		if ( isset( $_REQUEST[$this -> URL_id] ) ) {
			
			$url =  $this -> base . str_replace ( ' ', '%20', $_REQUEST[$this -> URL_id] );
			$lookup = str_replace( '/','__', $_REQUEST[$this -> URL_id] );
			//check the file location : if exists load it
			$upload_dir = trailingslashit( WP_CONTENT_DIR ) . 'uploads/cbi/cache/';
			$filename = $upload_dir . $lookup;
		
			if ( file_exists( $filename ) ) {
		
				$lastpart = strrpos( $filename , '__' );
				if (strpos( $filename, '.js', $lastpart ) > 0 ) {
					$type = 'application/javascript';
				} else {
					$finfo = finfo_open( FILEINFO_MIME_TYPE );
					$type = finfo_file( $finfo, $filename );
				}
				header ( 'Content-type: ' . $type ) ;
				include( $filename );
		
			} else {
		
				$args = array(
						'timeout'     => 10,
						'redirection' => 5,
						'httpversion' => '1.1',
						'user-agent'  => 'bidx/1.0',
						'blocking'    => true,
						'headers'     => array(),
						'cookies'     => array(),
						'body'        => null,
						'compress'    => false,
						'decompress'  => false,
						'sslverify'   => false,
						'stream'      => true,
						'filename'    => $filename
				);
		
				$response = wp_remote_get( $url, $args );
		
				if ( !is_wp_error( $response ) && 200 == $response['response']['code'] ) {
						
					$type = wp_remote_retrieve_header( $get, 'content-type' );
					header( 'Content-type: ' . $type );
					echo file_get_contents ( $filename );
		
				} else {
						
					error_log( print_r( $response,true ) );
					error_log( "Cannot load ". $url . " using CBI Proxy" );
				}
			}
		
		} else {
		
			error_log( "No URL defined using CBI Proxy" );
		
		}
	}
	
	
	/**
	 * Loads the page from the CBI server.
	 * HTML is rewritten in order to support relinking content
	 */
	public function loadPage( $atts=null, $content=null ) {
		
		$uri = "/marketintel_platform/platform/177482/affiliate";
		if ( isset( $_REQUEST[$this -> URL_id] ) ) {
			$uri = $_REQUEST[$this -> URL_id];
		}
		$url = $this -> base . $uri;
		$upload_dir = trailingslashit( WP_CONTENT_DIR ) . 'uploads/cbi/cache/';
		if ( !file_exists( $upload_dir ) ) {
			mkdir( $upload_dir, 0777, true );
		}
		
		$filename = $upload_dir . str_replace( '/','__', $uri );
		if( file_exists( $filename ) ) {
		
			$data = file_get_contents ( $filename );
		
		} else {
		
			$args = array(
					'timeout'     => 10,
					'redirection' => 5,
					'httpversion' => '1.1',
					'user-agent'  => 'bidx/1.0',
					'blocking'    => true,
					'headers'     => array(),
					'cookies'     => array(),
					'body'        => null,
					'compress'    => false,
					'decompress'  => true,
					'sslverify'   => false,
					'stream'      => false,
					'filename'    => null
			);
			$response = wp_remote_get( $url, $args );
		
			if ( is_wp_error( $response ) ) {
		
				$data = "<div id=\"well error\">Could not load the data referenced <br/><div style=\"color: red\">". $response->get_error_message() ."</div>";
		
			} else {
		
				$data = wp_remote_retrieve_body( $response );
				
				//rewrite images that are relative (regex can be used for replacing full string and encode the url)
				$data = str_replace( "src=\"/", "src=\"/wp-content/plugins/bidx-cbi-plugin/cbi-bin.php?". $this -> URL_id ."=/", $data );
				//rewrite images that are explicit
				$data = str_replace( "src=\"".$this -> base, "src=\"/wp-content/plugins/bidx-cbi-plugin/cbi-bin.php?". $this -> URL_id ."=", $data );
				//rewrite javascript linkup
				$data = str_replace( "http://' + window.location.host", "?". $this -> URL_id ."='" , $data );				
				//rewrite direct links
				$data = str_replace( "href=\"/","href=\"" . "?". $this -> URL_id ."=/", $data );
				//remove script elements
				$data = preg_replace( "/@import url\(([^)]+)\);/", "", $data );
					
				//store locally
				file_put_contents ( $filename , $data );
			}
		}	
		?>
			<div class="cbi-content">
				<div id="cbi-container">
					<?php echo $data ?>
				</div>
			</div>
			<!--  TODO copy chosen to bidx-cbi -->
			<script type="text/javascript" src="<?php get_template_directory_uri(); ?>/../../wp-content/plugins/bidx-plugin/static/vendor/chosen_v1.0.0/chosen.jquery.js"></script>
			<script type="text/javascript">
				$( function() {
		    		$( "#sectorChangeSelect" ).chosen({
		    			disable_search: true
		    		});
				});
			</script>
		<?php 
			
	}
	
	/**
	 * Creates the upload directory if not exists during activation
	 */
	public function load() {
		$upload_dir = trailingslashit( WP_CONTENT_DIR ) . 'uploads/cbi/cache/';
		if ( !file_exists( $upload_dir ) ) {
			mkdir( $upload_dir, 0777, true );
		}
	}
	
	/**
	 * Remove the cached contents during unloading of the plugin
	 */
	public function unload() {
// 		$upload_dir = trailingslashit( WP_CONTENT_DIR ) . 'uploads/cbi/cache/';
// 		if ( file_exists( $upload_dir ) ) {
// 			foreach(glob($dir.'*.*') as $v){
// 				unlink($v);
// 			}
// 		}
	}
	
}

/*  Enqueue css
/* ------------------------------------ */ 
function cbi_style() 
{
    wp_enqueue_style( 'cbi', plugins_url('/bidx-cbi-plugin/cbi.css') );
}
add_action( 'wp_enqueue_scripts', 'cbi_style' ); 

/**
 * CBI viewing widget 
 */
class CBI_Widget extends WP_Widget {

	/**
	 * Constructor.
	 */
	function __construct() {
	
		$this->WP_Widget (
			'bidx_cbi_widget',
			__('CBI Widget'),
			array (
				'name' => ': : Bidx CBI Data ',
				'classname' => 'bidx_cbi_widget',
				'description' => __( "Add data from CBI to your pages." )
			)
		);
	}

	/**
	 * Maintenance of the widget
	 * @param WP_Widget $instance
	 */
	function form( $instance ) {
		?>
	        <p><?php _e( 'No configuration options available', 'wp_widget_plugin'); ?></p>
		<?php
	} 

    /**
     * Stores the value of the widget
     * @param WP_Widget $new_instance
     * @param WP_Widget $old_instance
     * @return WP_Widget
     */
    function update( $new_instance, $old_instance ) {
        $instance = $old_instance;
        $instance['cbi_code'] = esc_sql( $new_instance['cbi_code']);
        return $instance;
    }
   
    /**
     * Output
     * @param array $args arguments for input
     * @param WP_Widget $instance instance of this widget
     */
    function widget($args, $instance) {
        extract( $args );
        // these are the widget options
        $cbi_code = $instance['cbi_code'];
       
        echo $before_widget;
        
        //CBI data via class ?? static?
        $cbi = new CBIShortCode();
        $cbi->loadPage();
        
        echo $after_widget;
    }


}

$cbi = new CBIShortCode();
add_shortcode( 'cbi', array ( $cbi, 'loadPage' ) );

add_action( 'widgets_init', function() {
	register_widget( 'CBI_Widget' );
});


register_activation_hook ( __FILE__, array ( $cbi, 'load' ) );
register_deactivation_hook ( __FILE__, array ( $cbi, 'unload' ) );

	
