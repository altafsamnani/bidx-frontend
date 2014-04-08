<?php 

require_once("../../../../wp-load.php");

$base = "http://www.cbi.eu";
if ( isset($_REQUEST['URL']) ) {
	$url = $base . $_REQUEST['URL'];
}
//all in condition

$args = array(
		'timeout'     => 5,
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

if ( 200 == $response['response']['code'] ) {
	$type = wp_remote_retrieve_header( $get, 'content-type' );
	header('Content-type: ' . $type);
	echo $response["data"];
	echo wp_remote_retrieve_body( $response );
} else {
	echo "Error";
}

?>