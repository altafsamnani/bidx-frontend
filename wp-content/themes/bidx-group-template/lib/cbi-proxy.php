<?php 
require_once("../../../../wp-load.php");

$base = "http://www.cbi.eu";
$cache_base = "/wp-content/uploads/cbi/cache";

if ( isset($_REQUEST['URL']) ) {
	$url =  $base . str_replace ( ' ', '%20', $_REQUEST['URL'] );
	
	$lookup = str_replace( '/','__', $_REQUEST['URL']);
		
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
	
		//else try to stream the file to a location
		$args = array(
				'timeout'     => 10,
				'redirection' => 5,
				'httpversion' => '1.1',
				'user-agent'  => 'bidx/' . $wp_version . '; ' . get_bloginfo( 'url' ),
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

?>