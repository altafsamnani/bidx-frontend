<?php
//This method is maintained for old Knews submitted newsletters (1.0.x and 1.1.x Knews versions)
if (!function_exists('add_action')) {
	$path='./';
	for ($x=1; $x<6; $x++) {
		$path .= '../';
		if (@file_exists($path . 'wp-config.php')) {
		    require_once($path . "wp-config.php");
			break;
		}
	}
}
global $Knews_plugin, $knewsOptions;

if ($Knews_plugin) {

	if (! $Knews_plugin->initialized) $Knews_plugin->init();

	$user_lang = $Knews_plugin->get_user_lang($Knews_plugin->get_safe('e'));
	$extra_params = 'unsubscribe=' . $Knews_plugin->block_user_self() ? 'ok' : 'error';
	$url_home = $Knews_plugin->get_localized_home($user_lang, $extra_params);

	
	wp_redirect( $url_home );
	
} else {

	wp_redirect( get_bloginfo('url'));
}
exit;
?>