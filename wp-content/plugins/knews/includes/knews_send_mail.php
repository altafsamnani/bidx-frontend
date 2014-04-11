<?php
			$test_smtp=is_array($test_array);
			
			if (!is_array($recipients)) {
				$myobject = new stdClass;
				$myobject->email = $recipients;
				$recipients = array($myobject);
			}
			
			global $knewsOptions, $wpdb;

			if ($knewsOptions['smtp_knews']=='0' && !$test_smtp) {
				$headers='';

				$headers .= 'From: ' . $knewsOptions['from_name_knews'] . ' <' . $knewsOptions['from_mail_knews'] . '>' . "\r\n";
				if ($theHtml != '') add_filter('wp_mail_content_type',create_function('', 'return "text/html";'));

			} else {
				
				//include_once (KNEWS_DIR . '/includes/class-phpmailer.php');
				//include_once (KNEWS_DIR . '/includes/class-smtp.php');
				if ( !class_exists("PHPMailer") ) require_once ABSPATH . WPINC . '/class-phpmailer.php';
				if ( !class_exists("SMTP") ) require_once ABSPATH . WPINC . '/class-smtp.php';
				
				if (!$test_smtp) {

					if (!$smtpdata = $this->get_smtp_multiple($id_smtp)) {
						$smtpdata = $this->get_smtp_multiple(1, true);
						//$smtpdata = $smtpdata[1];
					}
					
					$mail=new PHPMailer();
					if ($smtpdata['is_sendmail']=='1') {
						$mail->IsSendmail();
					} else {
						$mail->IsSMTP();
					}
					$mail->CharSet='UTF-8';

					if (isset ($knewsOptions['bounce_on']) && $knewsOptions['bounce_on'] == '1') $mail->Sender=$knewsOptions['bounce_email'];
					
					$mail->From = $smtpdata['from_mail_knews'];
					$mail->FromName = $smtpdata['from_name_knews'];
				
					$mail->Host = $smtpdata['smtp_host_knews'];
					$mail->Port = $smtpdata['smtp_port_knews'];
					$mail->Timeout = 30;
	
					if ($smtpdata['smtp_user_knews']!='' || $smtpdata['smtp_pass_knews'] != '') {
		
						$mail->SMTPAuth=true;
						$mail->Username = $smtpdata['smtp_user_knews'];
						$mail->Password = $smtpdata['smtp_pass_knews'];
						if ($smtpdata['smtp_secure_knews'] != '') $mail->SMTPSecure = $smtpdata['smtp_secure_knews'];
					}

				} else {

					$mail=new PHPMailer();
					if ($test_array['is_sendmail']=='1') {
						$mail->IsSendmail();
					} else {
						$mail->IsSMTP();
					}
					$mail->CharSet='UTF-8';

					//$mail->From = $knewsOptions['from_mail_knews'];
					//$mail->FromName = $knewsOptions['from_name_knews'];
					$mail->From = $test_array['from_mail_knews'];
					$mail->FromName = $test_array['from_name_knews'];

					$mail->Host = $test_array['smtp_host_knews'];
					$mail->Port = $test_array['smtp_port_knews'];
					$mail->Timeout = 30;
					$mail->SMTPDebug=1;
					
					if ($test_array['smtp_user_knews']!='' || $test_array['smtp_pass_knews'] != '') {
		
						$mail->SMTPAuth=true;
						$mail->Username = $test_array['smtp_user_knews'];
						$mail->Password = $test_array['smtp_pass_knews'];
						if ($test_array['smtp_secure_knews'] != '') $mail->SMTPSecure = $test_array['smtp_secure_knews'];
					}
					
				}
				
				if (count($recipients) > 1) $mail->SMTPKeepAlive = true;
			}

			$submit_error=0;
			$submit_ok=0;
			$error_info=array();

			foreach ($recipients as $recipient) {
				$customHtml = $theHtml; $customText = $theText;

				if (isset($recipient->confirm)) {
					$customHtml=str_replace('#url_confirm#', $recipient->confirm, $customHtml);
					$customText=str_replace('#url_confirm#', $recipient->confirm, $customText);
				}
				if (isset($recipient->unsubscribe)) {
					$customHtml=str_replace('%unsubscribe_href%', $recipient->unsubscribe, $customHtml);
					$customText=str_replace('%unsubscribe_href%', $recipient->unsubscribe, $customText);
				}

				if (isset($recipient->cant_read)) {
					$customHtml=str_replace('%cant_read_href%', $recipient->cant_read, $customHtml);
					$customText=str_replace('%cant_read_href%', $recipient->cant_read, $customText);

					$customHtml=str_replace('%mobile_version_href%', $recipient->cant_read . (($mobile) ? '&m=dsk' : '&m=mbl'), $customHtml);
					$customText=str_replace('%mobile_version_href%', $recipient->cant_read . (($mobile) ? '&m=dsk' : '&m=mbl'), $customText);
				}

				$customSubject=$theSubject;
				if (isset($recipient->tokens)) {
					foreach ($recipient->tokens as $token) {
						$customHtml=str_replace($token['token'], $token['value'], $customHtml);
						$customText=str_replace($token['token'], $token['value'], $customText);
						$customSubject=str_replace($token['token'], $token['value'], $customSubject);
					}
				}

				$customHtml = str_replace('#blog_name#', get_bloginfo('name'), $customHtml);
				$customText = str_replace('#blog_name#', get_bloginfo('name'), $customText);

				if (isset($recipient->confkey)) {
					$customHtml = str_replace('%confkey%', $recipient->confkey, $customHtml);
					$customText = str_replace('%confkey%', $recipient->confkey, $customText);
				}

				$customHtml = $this->htmlentities_corrected($customHtml); $customText = $this->htmlentities_corrected($customText);

				if ($knewsOptions['smtp_knews']=='0' && !$test_smtp) {

					$message = (($theHtml!='') ? $customHtml : $customText);
					
					if (strpos($recipient->email , '@knewstest.com') === false) {
						$mail_recipient = $recipient->email;
					} else {
						$mail_recipient = get_option('admin_email');
					}

					if (wp_mail($mail_recipient, $customSubject, $message, $headers)) {
						$submit_ok++;
						$error_info[]='submit ok [wp_mail()]';
						$status_submit=1;
					} else {
						$submit_error++;
						$error_info[]='wp_mail() error';
						$status_submit=2;
					}

				} else {

					$mail->Subject=$customSubject;

					if (strpos($recipient->email , '@knewstest.com') === false) {
						$mail_recipient = $recipient->email;
					} else {
						$mail_recipient = get_option('admin_email');
					}

					$mail->AddAddress($mail_recipient);

					//if ($theHtml != '') $mail->Body=utf8_encode($customHtml);
					//if ($theText != '') $mail->AltBody=utf8_encode($customText);
					if ($theHtml != '') $mail->Body=$customHtml;
					if ($theText != '') $mail->AltBody=$customText;
					if ($theHtml != '') $mail->IsHTML(true);

					if ($mail->Send()) {
						$submit_ok++;
						$error_info[]='submit ok [smtp]';
						$status_submit=1;
					} else {
						$submit_error++;
						$error_info[]=$mail->ErrorInfo . ' [smtp]';
						$status_submit=2;
					}
						
					$mail->ClearAddresses();
					$mail->ClearAttachments();
					$mail->ClearCustomHeaders();

				}

				if (count($recipients) > 1) {
					if( !ini_get('safe_mode') ) set_time_limit(25);
					echo ' ';
				}

				if (isset($recipient->unique_submit)) {
					$query = "UPDATE " . KNEWS_NEWSLETTERS_SUBMITS_DETAILS . " SET status=" . $status_submit . " WHERE id=" .$recipient->unique_submit;
					$result = $wpdb->query( $query );
				}
				
				if ($fp) {
					$hour = date('H:i:s', current_time('timestamp'));
					fwrite($fp, '  ' . $hour . ' | ' . $recipient->email . ' | ' . $error_info[count($error_info)-1] . "<br>\r\n");
				}
				
				if ($submit_error != 0) {
					for ($i = $submit_ok+1; $i < count($recipients); $i++) {
						if (isset($recipients[$i]->unique_submit)) {
							$query = "UPDATE " . KNEWS_NEWSLETTERS_SUBMITS_DETAILS . " SET status=0 WHERE id=" .$recipients[$i]->unique_submit;
							$unlock = $wpdb->query( $query );
						}
					}
					break;
				}
			}
		
			if (count($recipients) > 1 && ($knewsOptions['smtp_knews']!='0') || $test_smtp) $mail->SmtpClose();
			
			$reply = array('ok'=>$submit_ok, 'error'=>$submit_error, 'error_info'=>$error_info);
