<?php
global $Knews_plugin, $knewsOptions, $wpdb;

if ($Knews_plugin) {

	if (! $Knews_plugin->initialized) $Knews_plugin->init();
	require_once( KNEWS_DIR . '/includes/knews_util.php');
	
	$unique = uniqid();
	$site = get_bloginfo('url');
	
	$bounce_header = isset($knewsOptions['bounce_header']) ? $knewsOptions['bounce_header'] : 'returnpath';
	$bounce = ($knewsOptions['bounce_on'] == '1') ? $knewsOptions['bounce_email'] : 'off';
	if (!$Knews_plugin->im_pro()) $bounce = 'off';
	$pixel_tracking = isset($knewsOptions['pixel_tracking']) && $knewsOptions['pixel_tracking']==1 ? 'ON' : 'OFF';
	
	$wp_dirs = wp_upload_dir();
	$img_track = $wp_dirs['baseurl'] . '/knewsimages/testcat.jpg';

	$knewscheck = 'Knews configuration: 
**knewscheck_mode**%s**knewscheck_mode_end**
**knewscheck_site**' . $site . '**knewscheck_site_end**
**knewscheck_unique**' . $unique . '**knewscheck_unique_end**
**knewscheck_bounceheader**' . $bounce_header . '**knewscheck_bounceheader_end**
**knewscheck_bounce**' . $bounce . '**knewscheck_bounce_end**
**knewscheck_pixel**' . $pixel_tracking . '**knewscheck_pixel_end**
**knewscheck_pixel_url**' . $img_track . '**knewscheck_pixel_url_end**';

	$user = new stdClass();
	$user->email = 'check@knewsplugin.com';
	$user->unsubscribe = '#';
	$user->cant_read = '#';
	$user->fb_like = '#';
	$user->tweet = '#';



		$theHtml = '<!DOCTYPE html>
<html dir="ltr">
<head>
<meta http-equiv="Content-Type" content="text/html;
charset=UTF-8">
<title>Knews Plugin</title>
</head>
<body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0">
    	<div id="wrapper" dir="ltr" style="background-color: #f5f5f5; margin: 0; padding: 20px 0 20px 0; -webkit-text-size-adjust: none !important; width: 100%;">
        	<table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
<tr>
	<td align="center" valign="top">
		<table border="0" cellpadding="0" cellspacing="0" width="600" id="template_container" style="box-shadow: 0 1px 4px rgba(0,0,0,0.1) !important; background-color: #fdfdfd; border: 1px solid #dcdcdc; border-radius: 3px !important;">
	<tr>
	<td align="center" valign="top">
		<!-- Header -->
		<table border="0" cellpadding="0" cellspacing="0" width="600" id="template_header" style="background-color: #666666; border-radius: 3px 3px 0 0 !important; color: #ffffff; border-bottom: 0; font-weight: bold; line-height: 100%; vertical-align: middle; font-family: "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;"><tr>
	<td>
		<h1 style="color: #ffffff; display: block; font-family: "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif; font-size: 24px; font-weight: 300; line-height: 130%; margin: 0; padding: 18px 48px; text-align: left; text-shadow: 0 1px 0 #7797b4; -webkit-font-smoothing: antialiased;">Email Testing [Knews]</h1>
		</td>
			</tr></table>
	<!-- End Header -->
	</td>
		</tr>
	<tr>
	<td align="center" valign="top">
		<!-- Body -->
		<table border="0" cellpadding="0" cellspacing="0" width="600" id="template_body"><tr>
	<td valign="top" id="body_content" style="background-color: #fdfdfd;">
		<!-- Content -->
		<table border="0" cellpadding="20" cellspacing="0" width="100%"><tr>
	<td valign="top" style="padding: 48px;">' . sprintf($knewscheck, 'simple') . '</td>
			</tr></table>
	<!-- End Content -->
	</td>
			</tr></table>
	<!-- End Body -->
	</td>
		</tr>
	</table>
	</td>
</tr>
</table>
</div>
</body>
</html>';

		$test_array = array(
					'from_mail_knews' => trim($Knews_plugin->post_safe('from_mail_knews')),
					'from_name_knews' => trim($Knews_plugin->post_safe('from_name_knews')),
					'smtp_host_knews' => trim($Knews_plugin->post_safe('smtp_host_knews')),
					'smtp_port_knews' => trim($Knews_plugin->post_safe('smtp_port_knews')),
					'smtp_user_knews' => trim($Knews_plugin->post_safe('smtp_user_knews')),
					'smtp_pass_knews' => trim($Knews_plugin->post_safe('smtp_pass_knews')),
					'smtp_secure_knews' => $Knews_plugin->post_safe('smtp_secure_knews'),
					'is_sendmail' => $Knews_plugin->post_safe('is_sendmail_knews')
				);


		$enviament = $Knews_plugin->sendMail(array($user), 'Test Knews', clean_permalinks($theHtml), '', $test_array);
	
	if ($enviament['ok'] == 1) {
		echo $unique;
	} else {
		echo '0';
	}
} else {
	echo '0';
}
die();
?>