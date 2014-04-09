<div class="container cbi-content">
	<?php while (have_posts()) : the_post(); ?>
		<?php the_content(); ?>
	<?php endwhile; ?>
</div>

<?php
	$base = "http://www.cbi.eu";
	if ( isset($_REQUEST['URL']) ) {
		$url = $base . $_REQUEST['URL'];
	} else {
		$url = $base . "/marketintel_platform/platform/177482/affiliate";
	}
	
	/**
	 * Optionally add storage here for performance enhancement
	 */
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
		'decompress'  => true,
		'sslverify'   => false,
		'stream'      => false,
		'filename'    => null
	);
	$response = wp_remote_get( $url, $args );
	$data = $response['body'];
	
	$self_base = get_permalink( $post->ID ); 
	
	//rewrite images that are relative
	$data = str_replace("src=\"/", "src=\"/wp-content/themes/bidx-group-template/lib/cbi-proxy.php?URL=/", $data);
	//rewrite images that are explicit
	$data = str_replace("src=\"".$base, "src=\"/wp-content/themes/bidx-group-template/lib/cbi-proxy.php?URL=", $data);	
	//rewrite javascript linkup
	$data = str_replace("http://' + window.location.host", $self_base ."?URL='", $data);
	//rewrite direct links
	$data = str_replace("href=\"/","href=\"" . $self_base ."?URL=/", $data);


	?>
	<article>
		<div id="cbi-container">
	<?php print_r( $data ); ?>
		</div>
	</article>