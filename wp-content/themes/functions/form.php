<?php 

	function getSchema() {
		//set authentication
		$authUsername = 'bidx'; // Bidx Auth login
		$authPassword = 'gobidx'; // Bidx Auth password
		$url = 'http://test.bidx.net/api/v1/entity/13?csrf=false&groupDomain=beta&schema=true&newSchema';
		
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
		//new dBug($data);
		//$fields = $schema->metadata->schema->personalDetails->properties;
		$schema = $response->metadata->schema;
		//new dBug ($fields);

		/* 
			Available types:
			    array (minItems, maxItems, uniqueItems, items)
			    boolean
			    coordinates (comma-seperated latitude, longitude in decimal degrees) <deprecated: moved to type=string format=location>
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
	
		$res = traverseSchema($schema, $data, "", "");
		echo $res;

	}

	function traverseSchema($schema, $data, $output, $parent) {
		
		//loop 	
		foreach ($schema as $key => $el) {
		//	new dBug($el);


			if($el->type == "object") {
				//there is a collection
				if(isset($el->properties)) {
							
					$output = traverseSchema(
						$el->properties,
						$data, 
						$output, 
						$parent != "" ? $parent . "." . $key : $key
					);
				}
				else if(isset($el->items)) {//this option will be removed and changed to properties
					$output = traverseSchema(
						$el->items, 
						$data, 
						$output, 
						$parent != "" ? $parent . "." . $key : $key
					);
				}

			}
			else {
				$hasOptions=isset($el->options) ? true:false;
				$placeholder=isset($el->placeholder) ? $el->placeholder : "Please type your " . $el->title;
				$fieldname = $parent != "" ? $parent . "." . $key: $key;

				//set HTML wrapper for formfields
				$wrapper_start = "<div class=\"formfield\"><label>" . $el->title . "</label>";
				$wrapper_end = "</div>";
				
				if(isset($el->type)) {
					$type = $hasOptions ? "select": $el->type;


					//create HTML for formfield element
					switch ($type) {
						case 'hidden': 
							$output.= "<input type=\"hidden\" name=\"" . $fieldname ."\"/>";
							break;
						case 'string':
							$dataType="";
							if(isset($el->format)) {
								$dataType = "data-type=\"" . $el->format . "\"";
								/*switch ($el->format) {
									case 'date':
										$dataType = "data-type=\"date\"";
										break;
									case 'location':
										$dataType = "data-type=\"location\"";
										break;
								}*/
							}
							
							$element = 	"<input type=\"text\" name=\"" . $fieldname . "\" value=\"" . "\" placeholder=\"" . $placeholder . "\" " . $dataType . "/>";
							$output.= $wrapper_start . $element . $wrapper_end;
							break;
						case 'select':
							$options="";
							foreach ($el->options as $i => $opt) {
								$options .= "<option value=\"" . $opt->value . "\">" . $opt->label . "</option>";
							}
							unset($opt);
							$element = "<select name=\"" . $fieldname ."\"/>" . $options . "</select>";
							$output.= $wrapper_start . $element . $wrapper_end;
							break;
						default:
							# code...
							break;
					}
				}
				else {
					$output .= "<marquee style=\"color:red\">ELEMENT: " . $el->title . " NO TYPE DEFINED IN SCHEMA</marquee>";
				}
			}

			

		}
		return $output;
	}

?>