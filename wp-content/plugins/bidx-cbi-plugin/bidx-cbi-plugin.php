<?php

/*
  Plugin Name: bidx-cbi-plugin
  Plugin URI: http://bidx.net/plugin/bidx-cbi-plugin
  Description: Wordpress plugin for adding CBI site functions to a bidX website.
  Version: 0.1.0
  Author: bidX development team
  Author URI: http://bidx.net/plugin/bidx-cbi-plugin
  License: Commercial
 */

class CBIShortCode {
	
	private $base = "http://www.cbi.eu";
	private $cachetime = 300;
	private $uri = "/marketintel_platform/platform/177482/affiliate";	
	private $URL_id = "CBIURL";
	//private $cache_base = "/wp-content/uploads/cbi/cache";

	/**
	 * Loads the binary data using this proxy.
	 * Checks if the binary is already stored and else streams it to that location to load it.
	 */
	public function loadBinary() {
		
		if ( isset($_REQUEST[$this -> URL_id]) ) {
			
			$url =  $this -> base . str_replace ( ' ', '%20', $_REQUEST[$this -> URL_id] );
			$lookup = str_replace( '/','__', $_REQUEST[$this -> URL_id]);
			//check the file location : if exists load it
			$upload_dir = trailingslashit( WP_CONTENT_DIR ) . 'uploads/cbi/cache/';
			$filename = $upload_dir . $lookup;
		
			if ( file_exists( $filename ) ) {
		
				$lastpart = strrpos( $filename , '__' );
				if (strpos( $filename, '.js', $lastpart ) > 0 ) {
					$type = 'application/javascript';
				} else {
					$finfo = finfo_open(FILEINFO_MIME_TYPE);
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
					header('Content-type: ' . $type);
					echo file_get_contents ( $filename );
		
				} else {
						
					error_log( print_r( $response,true ) );
					error_log( "Cannot load ". $url . " using CBI Proxy" );
				}
			}
		
		} else {
		
			error_log("No URL defined using CBI Proxy");
		
		}
	}
	
	
	/**
	 * Loads the page from the CBI server.
	 * HTML is rewritten in order to support relinking content
	 */
	public function loadPage( $atts, $content=null ) {
		
		$uri = "/marketintel_platform/platform/177482/affiliate";
		if ( isset($_REQUEST[$this -> URL_id]) ) {
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
		
			if (is_wp_error($response)) {
		
				$data = "<div id=\"well error\">Could not load the data referenced <br/><div style=\"color: red\">". $response->get_error_message() ."</div>";
		
			} else {
		
				$data = wp_remote_retrieve_body( $response );
				
				//rewrite images that are relative (regex can be used for replacing full string and encode the url)
				$data = str_replace( "src=\"/", "src=\"/wp-content/plugins/bidx-cbi-plugin/cbi-bin.php?". $this -> URL_id ."=/", $data );
				//rewrite images that are explicit
				$data = str_replace( "src=\"".$this -> base, "src=\"/wp-content/plugins/bidx-cbi-plugin/cbi-bin.php?". $this -> URL_id ."=", $data );
				//rewrite javascript linkup
				//$data = str_replace( "http://' + window.location.host", $self_base ."?". $URL_id ."='" , $data );
				$data = str_replace( "http://' + window.location.host", "?". $this -> URL_id ."='" , $data );
				
				//rewrite direct links
				//$data = str_replace( "href=\"/","href=\"" . $self_base ."?". $URL_id ."=/", $data );
				$data = str_replace( "href=\"/","href=\"" . "?". $this -> URL_id ."=/", $data );
				
				//remove script elements
				$data = preg_replace( "/@import url\(([^)]+)\);/", "", $data );
					
				//store locally
				file_put_contents ( $filename , $data );
			}
		}	
		?>
			<div class="container cbi-content">
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
	
}

$cbi = new CBIShortCode();
add_shortcode( 'cbi', array ( $cbi, 'loadPage' ) );

	