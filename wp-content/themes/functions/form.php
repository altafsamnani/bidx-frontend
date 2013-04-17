<?php 

	function getSchema() {
		//set authentication
		$authUsername = 'bidx'; // Bidx Auth login
		$authPassword = 'gobidx'; // Bidx Auth password
		$url = 'http://test.bidx.net/api/v1/entity/13?csrf=false&groupDomain=beta&schema=true';
		
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl,CURLOPT_HTTPHEADER,array('Authorization: Basic ' . base64_encode("$authUsername:$authPassword")));

		$curl_response = curl_exec($curl);
		if ($curl_response === false) {
			$info = curl_getinfo($curl);
			curl_close($curl);
			die('error occured during curl exec. Additioanl info: ' . var_export($info));
		}
		curl_close($curl);
		return json_decode($curl_response);
	}
	
	function generateFormFields($entity, $fields) {
		include "dbug.php";
		
		$response = getSchema();	
		$data =  $response -> data;
		//$fields = $schema->metadata->schema->personalDetails->properties;
		$schema = $response->metadata->schema;
		//new dBug ($fields);

		/* 
			Available types:
			    array (minItems, maxItems, uniqueItems, items)
			    boolean
			    coordinates (comma-seperated latitude, longitude in decimal degrees)
			    hidden
			    integer (format, minimum, exclusiveMinimum, maximum, exclusiveMaximum)
			    number (format, minimum, exclusiveMinimum, maximum, exclusiveMaximum)
			    object (properties)
			    options
			    string (format, minLength, maxLength, maxWords, pattern)
			    utc-millisec
		*/
		$output = "";

		//new dBug($schema);
		/*echo "<pre>";
		print_r(traverseSchema($schema, ""));
		echo "</pre>";*/
		$res = traverseSchema($schema, "start", "");
		echo $res;

	}

	function traverseSchema($schema, $output, $parent) {
		


		foreach ($schema as $key => $el) {
			echo "key: " . $key . "<BR>";
			//new dBug($el);

			//there is a collection
			if(isset($el->properties)) {
				$output = traverseSchema($el->properties,$output, $key);
			}
			//else it is an element
			else {
				$options=isset($el->options) ? true:false;
				$placeholder=isset($el->placeholder) ? $el->placeholder : "Please type your " . $el->title;
				$fieldname = $parent != "" ? $parent . "." . $key: $key;
				//set HTML wrapper for formfields
				$wrapper_start = "<div class=\"formfield\"><label>" . $el->title . "</label>";
				$wrapper_end = "</div>";
				
				if(isset($el->type)) {
					//create HTML for formfield element
					switch ($el->type) {
						case 'hidden': 
							$output.= "<input type=\"hidden\" name=\"" . $fieldname ."\"/>";
							break;
						case 'string':
							$element = 	"<input type=\"text\" name=\"" . $fieldname . "\" placeholder=\"" . $placeholder . "\" />";
							$output.= $wrapper_start . $element . $wrapper_end;
							break;
						
						default:
							# code...
							break;
					}
				}
				else {
					$output .= $wrapper_start . "<marquee style=\"color:red\">NO TYPE DEFINED IN SCHEMA</marquee>" . $wrapper_end;
				}

			}
		}
		return $output;
	}

?>