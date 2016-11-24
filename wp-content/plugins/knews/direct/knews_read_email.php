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
global $Knews_plugin, $wpdb;

if ($Knews_plugin) {

	if (! $Knews_plugin->initialized) $Knews_plugin->init();

	$id_newsletter = $Knews_plugin->get_safe('id', 0, 'int');
	$submit_id = $Knews_plugin->get_safe('k', 0, 'int');
	$user_id=0;

	$email_or_id = $Knews_plugin->get_safe('e');
	$field = 'email';
	
	if (!$Knews_plugin->validEmail($email_or_id)) {
		$email_or_id = intval($email_or_id);
		$field = 'id';
	}
	
	if ($email_or_id != 0) {
		$user=$wpdb->get_row("SELECT * FROM " . KNEWS_USERS . " WHERE " . $field . "='" . $email_or_id . "'");

		if (count($user)==1) {
			$user_id=$user->id;
			$mysqldate = $Knews_plugin->get_mysql_date();
			$what=2;
			if ($Knews_plugin->get_safe('m')=='mbl') $what=4;
			if ($Knews_plugin->get_safe('mbl')=='1') $what=4;
			
			$query = "INSERT INTO " . KNEWS_STATS . " (what, user_id, submit_id, date, statkey) VALUES (" . $what . ", " . $user_id . ", " . $submit_id . ", '" . $mysqldate . "', 0)";
			$result=$wpdb->query( $query );

		}
	} else {
		$user=array();
	}
	
	$do_mobile=false;
	require( KNEWS_DIR . "/includes/knews_compose_email.php");

	if (count($user)==1) {
		$aux_array=array();
		//array('token'=>$token->token, 'id'=>$token->id, 'default'=>$tokenfound[1])

		foreach ($used_tokens as $token) {
			$theHtml = str_replace($token['token'], $Knews_plugin->get_user_field($user->id, $token['id']), $theHtml);
			//$aux_array[] = array( 'token' => $token['token'], 'value' => $Knews_plugin->get_user_field($user->id, $token['id'], $token['defaultval']) );
		}

		$unsubscribe_string = 'knews=unsubscribe&e=' . $user->id . '&k=' . $user->confkey . '&n=' . $id_newsletter;
		if ($Knews_plugin->get_safe('k') != '') $unsubscribe_string .= '&id=' . $Knews_plugin->get_safe('k');
		$theHtml = str_replace('%unsubscribe_href%', $Knews_plugin->get_localized_home($user->lang, $unsubscribe_string), $theHtml);

		$theHtml = str_replace('%mobile_version_href%', $Knews_plugin->get_localized_home($user->lang, 'knews=readEmail&id=' . $id_newsletter . '&e=' . $user->id . '&mbl=' . (($results[0]->mobile==0) ? '1' : '0')), $theHtml);

	} else {
		foreach ($used_tokens as $token) {
			$theHtml = str_replace($token['token'], $token['defaultval'], $theHtml);
		}

		$theHtml = str_replace('%unsubscribe_href%', '#', $theHtml);

		$theHtml = str_replace('%mobile_version_href%', $Knews_plugin->get_localized_home('', 'knews=readEmail&id=' . $id_newsletter . '&mbl=' . (($results[0]->mobile==0) ? '1' : '0')), $theHtml);
	}
	$theHtml = str_replace('%cant_read_href%', '#' , $theHtml);

	if ($Knews_plugin->get_safe('preview',0)!=1) $theHtml = knews_extract_code('<!--cant_read_block_start-->','<!--cant_read_block_end-->',$theHtml,true);
	
	if ($do_mobile) $theHtml=str_replace('</head>','<meta name="viewport" content="width=480"></head>',$theHtml);

	/*
	if ($Knews_plugin->get_safe('preview',0) != 1 && $Knews_plugin->get_safe('knewsLb',0) != 1) {

		$start = strpos($theHtml,'<body>');
		$end = strpos($theHtml,'</body>');
		
		if ($start !== false && $end !== false) {
			$start=$start+6;
			echo substr($theHtml, 0, $start);
			echo '<div class="knews_pop_bg" style="display:block;">&nbsp;</div><div class="knews_pop_news">';
			echo substr($theHtml, $start, $end-$start);
			echo '</div><iframe src="' . get_bloginfo('url') . '?knewspophome=1" class="knews_base_home"></iframe><a href="' . get_bloginfo('url') . '" class="knews_pop_x" title="close" target="_parent" style="display:block;">&nbsp;</a>';
			require( KNEWS_DIR . '/includes/dialogs.php');
			echo '</html></body>';
		} else {
			echo $theHtml;
		}
	} else {*/
		echo $theHtml;	
	//}
	
} else {
	echo 'Knews is not active';
}
if (!defined('KNEWS_POP_HOME')) die();
?>