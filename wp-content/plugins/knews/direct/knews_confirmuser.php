<?php
global $Knews_plugin, $knewsOptions;

if ($Knews_plugin) {

	if (! $Knews_plugin->initialized) $Knews_plugin->init();

	$user_lang = $Knews_plugin->get_user_lang($Knews_plugin->get_safe('e'));
	$extra_params = 'subscription=' . $Knews_plugin->confirm_user_self() ? 'ok' : 'error';
	$url_home = $Knews_plugin->get_localized_home($user_lang, $extra_params);
	
	wp_redirect( $url_home );

} else {

	wp_redirect( get_bloginfo('url'));
}
exit;
?>