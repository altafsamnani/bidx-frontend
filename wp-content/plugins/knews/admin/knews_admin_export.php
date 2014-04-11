<?php
//Security for CSRF attacks
$knews_nonce_action='kn-adm-export';
$knews_nonce_name='_admexp';
if (!empty($_POST)) $w=check_admin_referer($knews_nonce_action, $knews_nonce_name);
//End Security for CSRF attacks

	global $wpdb, $Knews_plugin, $knews_delimiters, $knews_enclosure, $knews_encode, $knews_line_endings;
//	global $knews_delimiters, $knews_enclosure, $knews_encode, $knews_line_endings, $knews_import_errors, $knews_import_users_error, $col_options, $submit_confirmation_id, $confirmation_sql_count;

	require_once( KNEWS_DIR . '/includes/knews_util.php');

    // specify allowed field delimiters
    $knews_delimiters = array(
        'comma ,'     => ',',
        'semicolon ;' => ';',
        'tab'         => "\t",
        'pipe |'         => '|',
        'colon :'     => ':',
        'space'     => ' ',
    );

    $knews_enclosure = array(
        'double'	=> '"',
        'simple'	=> '\''
    );

	function put_format_selects() {

		global $knews_delimiters, $knews_enclosure, $knews_encode, $knews_line_endings, $Knews_plugin;

		?>
			<p><?php _e('Separator','knews'); ?>: <select name="knews_delimiters" id="knews_delimiters">
				<?php
				while ($d = current($knews_delimiters)) {
					echo '<option value="' . key($knews_delimiters) . '"' . (( $Knews_plugin->post_safe('knews_delimiters') == key($knews_delimiters)) ? ' selected="selected"' : '') . '>' . key($knews_delimiters) . '</option>';
					next($knews_delimiters);
				}
				?>
			</select>
			<?php _e('Enclosure','knews'); ?>: <select name="knews_enclosure" id="knews_enclosure">
				<?php
				while ($d = current($knews_enclosure)) {
					echo '<option value="' . key($knews_enclosure) . '"' . (( $Knews_plugin->post_safe('knews_enclosure') == key($knews_enclosure)) ? ' selected="selected"' : '') . '>' . key($knews_enclosure) . '</option>';
					next($knews_enclosure);
				}
				?>
			</select>
			</p>
		<?php
	}

	$step = $Knews_plugin->post_safe('step', 1);
	$knews_has_header = $Knews_plugin->post_safe('knews_has_header', 0, 'int');
	
	$query = "SELECT * FROM " . KNEWS_LISTS . " ORDER BY orderlist";
	$lists = $wpdb->get_results( $query );
	$languages = $Knews_plugin->getLangs();
	
	if ($step==2) {
		$no_list=true; $no_lang=true; $all_langs=true; $all_lists=true; $indexed_list=array();
		
		foreach ($lists as $list) {
			if ($Knews_plugin->post_safe('list_' . $list->id) == 1) {
				$no_list = false;
			} else {
				$all_lists = false;
			}
			$indexed_list[$list->id]=$list->name;
		}
		foreach ($languages as $lang) {
			if ($Knews_plugin->post_safe('lang_' . $lang['language_code']) == 1) {
				$no_lang=false;
			} else {
				$all_langs = false;
			}
		}
		
		if ($no_lang || $no_list) {
			$step=1;
			echo '<div class="error"><p>' . __('Select at least one list and one language.','knews') . '</p></div>';
		}
	}
?>
	<div class="wrap">
		<div class="icon32" style="background:url(<?php echo KNEWS_URL; ?>/images/icon32.png) no-repeat 0 0;"><br></div><h2><?php _e('Export users','knews');?></h2>
		<?php
		$exported_users = 0;

		if ($step=='2') {
			$csv_code = '';
			$delimiter = $knews_delimiters[$Knews_plugin->post_safe('knews_delimiters')];
			$enclosure = $knews_enclosure[$Knews_plugin->post_safe('knews_enclosure')];
			$extra_fields = $Knews_plugin->get_extra_fields();

			if ($knews_has_header==1) {
					$csv_code .= $enclosure . __('E-mail','knews') . $enclosure . $delimiter;

					foreach ($extra_fields as $ef) {
						$csv_code .= $enclosure . $ef->name . $enclosure . $delimiter;					
					}

					$csv_code .= $enclosure . __('Language','knews') . $enclosure . $delimiter;
					$csv_code .= $enclosure . __('State','knews') . $enclosure . $delimiter;
					$csv_code .= $enclosure . __('Lists','knews') . $enclosure . $delimiter;
					$csv_code .= $enclosure . __('Register Date','knews') . $enclosure . $delimiter;
					$csv_code .= $enclosure . __('Register IP','knews') . $enclosure . "\r\n";
			}
			
			/*$query = "SELECT * FROM " . KNEWS_LISTS . " ORDER BY orderlist";
			$lists = $wpdb->get_results( $query );
			$languages = $Knews_plugin->getLangs();*/

			$select_sql = 'FROM ' . KNEWS_USERS . ' ku';

			$where_lang = '';
			if (!$all_langs) {
				foreach ($languages as $lang) {
					if ($Knews_plugin->post_safe('lang_' . $lang['language_code']) == 1) {

						if ($where_lang !='') $where_lang .= ' OR ';							
						$where_lang .= "ku.lang='" . $lang['language_code'] . "'";
					}
				}
			}

			$where_list = ''; $l = 0;
			if (!$all_lists) {
				$select_sql .= ', ' . KNEWS_USERS_PER_LISTS . ' kupl';
				foreach ($lists as $list) {
					if ($Knews_plugin->post_safe('list_' . $list->id) == 1) {
						$l++;
						if ($where_list !='') $where_list .= ' OR ';							
						$where_list .= "kupl.id_list=" . $list->id;
					}
				}

				$where_list = ' kupl.id_user = ku.id AND ' . (($l > 1) ? '(' : '') . $where_list . (($l > 1) ? ')' : '');
			}
			
			if ($where_lang != '' && $where_list != '') {
				$where_lang = '(' . $where_lang . ')';
				$where_list = '(' . $where_list . ')';
			}
			
			if ($where_lang != '' || $where_list != '') $select_sql .= ' WHERE ' . $where_lang;
			if ($where_lang != '' && $where_list != '') $select_sql .= ' AND ';
			$select_sql .= $where_list;
			
			if ($l > 1) {
				$select_sql = ' SELECT DISTINCT(ku.*) ' . $select_sql;
			} else {
				$select_sql = ' SELECT ku.* ' . $select_sql;
			}
			//echo  $select_sql;
			
			$users = $wpdb->get_results( $select_sql );
			
			foreach ($users as $user) {
				$in_lists=false;
				$lists_user='';
				/*foreach ($lists as $list) {
					if ($Knews_plugin->post_safe('list_' . $list->id) == 1) {*/
						
				$query = "SELECT * FROM " . KNEWS_USERS_PER_LISTS . " WHERE id_user=" . $user->id; // . " AND id_list=" . $list->id;
						$subscription_found = $wpdb->get_results( $query );
					
				foreach ($subscription_found as $sf) {
							if ($lists_user != '') $lists_user .=', ';
					$lists_user .= $indexed_list[$sf->id_list];
						}
				//}*/
				/*$in_langs=false;
				if ($in_lists) {
					foreach ($languages as $lang) {
						 if ($Knews_plugin->post_safe('lang_' . $lang['language_code']) == 1) {
							 if ($user->lang == $lang['language_code']) $in_langs=true;
						 }
					}
				}*/
				//if ($in_langs && $in_lists)  {
					$exported_users++;
					$csv_code .= $enclosure . $user->email . $enclosure . $delimiter;

				$query = "SELECT * FROM " . KNEWS_USERS_EXTRA . " WHERE user_id=" . $user->id;
				$results = $wpdb->get_results($query);

					foreach ($extra_fields as $ef) {
					$ef_val='';
					foreach ($results as $efr) {
						if ($efr->field_id == $ef->id) {
							$ef_val = $efr->value;
							break;
						}
					}		
					$csv_code .= $enclosure . $ef_val . $enclosure . $delimiter;					
					}

					$csv_code .= $enclosure . $user->lang . $enclosure . $delimiter;
					$csv_code .= $enclosure . $user->state . $enclosure . $delimiter;
				$csv_code .= $enclosure . $lists_user . $enclosure . $delimiter;
				$csv_code .= $enclosure . $user->joined . $enclosure . $delimiter;
				$csv_code .= $enclosure . $user->ip . $enclosure . "\r\n";
				//}
			}
			
			if ($exported_users != 0) {

				$file_name = uniqid() . '.csv';
				$fp = fopen(KNEWS_DIR . '/tmp/' . $file_name, 'w');
				if ($fp) {
					fwrite($fp, $csv_code);
				}

				echo '<div class="updated"><p>';
				printf(__('%s users have been exported.','knews'), $exported_users);
				echo '</p></div>';
				
				if ($fp) {
					echo '<p>';
					printf(__('To download the .CSV, click %s here','knews'), '<a href="' . get_admin_url() . 'admin-ajax.php?action=knewsSafeDownload&file=' . $file_name . '">');
					echo '</a></p>';
				} else {
					echo '<p>' . __("Error: I can't write the .CSV file.",'knews') . ' ' . __('The directory /wp-content/plugins/knews/tmp must be writable (chmod 700)', 'knews') . '</p>';
				}
		?>
				<textarea style="width:75%; height:400px;"><?php echo $csv_code; ?></textarea>
		<?php
			}
		}
		if ($step=='1' || ($step=='2' && $exported_users == 0)) {
			if ($step=='2') echo '<div class="updated"><p>' . __('No users match criteria','knews') . '</p></div>';
		?>
			<form method="post" action="<?php echo $_SERVER["REQUEST_URI"]; ?>">
			<input type="hidden" name="step" id="step" value="2" />

			<h3><?php 
			
			_e('1. Select the users you want to export:','knews');
			
			echo '</h3><p>';
			
			_e('1.1. Select the lists to export:','knews');
			
			echo '</p>';
			
			knews_print_mailinglists();
			
			echo '<p>';
			
			_e('1.2. Select the languages to export:','knews');
			
			echo '<blockquote>';
			
			foreach ($languages as $lang) {
				echo '<input type="checkbox" value="1" name="lang_' . $lang['language_code'] . '"' . (($Knews_plugin->post_safe('lang_' . $lang['language_code'])==1) ? ' checked="checked"' : '') . '>' . $lang['translated_name'] . '<br>';
			}
			
			echo '</blockquote></p>';

			_e ('Note: mark all lists and the desired language/s to filter by language, or all languages and desired lists to filter by list,','knews');
			echo '<br>';
			_e ('...or all lists and all languages to export all users.','knews');

			echo '</p><h3>';

			_e('2. Format options:','knews');
			
			?></h3>
			<p><input type="checkbox" name="knews_has_header" id="knews_has_header" value="1"<?php if ( $knews_has_header==1 ) echo ' checked="checked"'; ?> /> <?php _e('Insert a header in the first row','knews'); ?></p>
			<?php
			
			put_format_selects();
			?>
			<div class="submit">
				<input type="submit" class="button-primary" value="<?php _e('Export users','knews');?>">
			</div>
			<?php 
			//Security for CSRF attacks
			wp_nonce_field($knews_nonce_action, $knews_nonce_name); 
			?>
			</form>
			<?php
		}
		?>
	</div>
