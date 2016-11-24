<?php
$targets = $wpdb->get_results( $query );

if (count($targets) > 0) {
						
	$start_time = mktime($batch_opts['hour'], $batch_opts['minute'], 0, $batch_opts['month'], $batch_opts['day'], $batch_opts['year']);
	
	if ($batch_opts['timezone'] == 'local') {
		$difference = current_time('timestamp') - time();
		$start_time = $start_time - $difference;
	}
	
	$mysqldate = $Knews_plugin->get_mysql_date($start_time);
	
	$query = 'INSERT INTO ' . KNEWS_NEWSLETTERS_SUBMITS . ' (blog_id, newsletter, finished, paused, start_time, users_total, users_ok, users_error, priority, strict_control, emails_at_once, special, end_time, id_smtp) VALUES (' . get_current_blog_id() . ', ' . $id_newsletter . ', 0, ' . $batch_opts['paused'] . ', \'' . $mysqldate . '\', ' . count($targets) . ', 0, 0, ' . $batch_opts['priority'] . ', \'' . $batch_opts['strict_control'] . '\', ' . $batch_opts['emails_at_once'] . ', \'\', \'0000-00-00 00:00:00\', ' . ((isset($batch_opts['id_smtp'])) ? $batch_opts['id_smtp'] : 1) . ')';
	
	$results = $wpdb->query( $query );
	
	$submit_id = $Knews_plugin->real_insert_id();

	foreach ($targets as $target) {
		
		//$target->id;
		$query = 'INSERT INTO ' . KNEWS_NEWSLETTERS_SUBMITS_DETAILS . ' (submit, user, status) VALUES (' . $submit_id . ', ' . $target->id . ', 0)';
		$results = $wpdb->query( $query );
		
	}
	
	// Extraiem links per estadistiques i la primera imatge
	require( KNEWS_DIR . "/includes/knews_compose_email.php");
	// Thanks to http://www.web-max.ca/PHP/misc_23.php
	/*preg_match_all ("/a[\s]+[^>]*?href[\s]?=[\s\"\']+".
		"(.*?)[\"\']+.*?>"."([^<]+|.*?)?<\/a>/", */

/*	preg_match_all ("/(a|A)[\s]+[^>]*?href[\s]?=[\s\"\']+".
		"(.*?)[\"\']+.*?>"."([^<]+|.*?)?<\/(a|A)>/", 
		$theHtml, $matches);*/
		
	preg_match_all('/<a[^>]+href=([\'"])(.+?)\1[^>]*>/i', $theHtml, $matches);

	$matches = $matches[2];

	foreach($matches as $link) {
		knews_insert_unique_key(1, $submit_id, $link);
	}

	$tracking_code=false;
	if ($knewsOptions['pixel_tracking']==1) {

		/*preg_match_all ("/(img|IMG)[\s]+[^>]*?src[\s]?=[\s\"\']+".
			"(.*?)[\"\']+.*?>"."([^<]+|.*?)?>/", 
			$theHtml, $matches_img);*/

		/* http://stackoverflow.com/questions/138313/how-to-extract-img-src-title-and-alt-from-html-using-php */
		preg_match_all('/<img[^>]+>/i',$theHtml, $result);
		foreach( $result[0] as $img_tag) {
		    //preg_match_all('/(alt|title|src)=("[^"]*")/i',$img_tag, $img);
		    preg_match_all('/(src)=("[^"]*")/i',$img_tag, $img);
		    preg_match_all('/(src)=(\'[^\']*\')/i',$img_tag, $img2);
			if (isset($img[2][0])) {
				if (knews_insert_unique_key(6, $submit_id, substr($img[2][0], 1, -1))) {
					$tracking_code=true;
					break;
		}
			} elseif (isset($img2[2][0])) {
				if (knews_insert_unique_key(6, $submit_id, substr($img2[2][0], 1, -1))) {
					$tracking_code=true;
					break;
	}
			}
		}
	}

	if (!$tracking_code) while (!knews_insert_unique_key(6, $submit_id, KNEWS_URL . '/images/unpix.gif')) {}
	
	echo '<div class="updated"><p>' . __('Batch submit process has been properly scheduled.','knews') . '</p></div>';				
	$submit_enqueued=true;
} else {
	echo '<div class="error"><p>' . __('No active users in the selected list, nothing programmed to send.','knews') . '</p></div>';				
}

?>
	
