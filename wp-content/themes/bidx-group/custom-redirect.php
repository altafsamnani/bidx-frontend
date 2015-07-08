<?php

$currentUrl 					=	site_url();

$siteUrl['somaliagrifood'] 		=   array(
										'baseUrl' 	=> array( 'somaliland-agrifood'
															, 'somalia-agrifood'
															, 'puntland-agrifood' )
									,	'redirect'	=> 'http://www.somaliagrifood.org'
									);

foreach( $siteUrl as $siteName => $siteData)
{
	$containUrl 	=	$siteData['baseUrl'];
	$redirectUrl    =   $siteData['redirect'];

	foreach( $containUrl as  $visitingtUrl)
	{
		if( strstr( $currentUrl, $visitingtUrl ) )
		{
			wp_redirect( $redirectUrl );
			exit;
		}
	}
}

?>
