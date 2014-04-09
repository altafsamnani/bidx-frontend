<?php 

require_once("../../../../wp-load.php");

$base = "http://www.cbi.eu";
if ( isset($_REQUEST['URL']) ) {
	$url =  $base . str_replace ( ' ', '%20', $_REQUEST['URL']);
	
	//TODO : check if in cache /wp-content/uploads/cbi
	
	$args = array(
			'timeout'     => 10,
			'redirection' => 5,
			'httpversion' => '1.0',
			'user-agent'  => 'bidx/' . $wp_version . '; ' . get_bloginfo( 'url' ),
			'blocking'    => true,
			'headers'     => array(),
			'cookies'     => array(),
			'body'        => null,
			'compress'    => false,
			'decompress'  => false,
			'sslverify'   => false,
			'stream'      => false,
			'filename'    => null
	);
	
	$response = wp_remote_get( $url, $args );
	
	if ( !is_wp_error( $response ) && 200 == $response['response']['code'] ) {
		
		$type = wp_remote_retrieve_header( $get, 'content-type' );
		header('Content-type: ' . $type);
		echo $response["data"];
		$body = wp_remote_retrieve_body( $response );
		
		//TODO : store $body in cache
		
		echo $body;
	
	} else {
		print_r($url);
		print_r($response);
		error_log("Cannot load ". $url . " using CBI Proxy");
		
	}
} else {
	
	error_log("No URL defined using CBI Proxy");
	
}

?>