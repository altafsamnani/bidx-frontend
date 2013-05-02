
/*==============================================================================================
									COUNTRY AUTOCOMPLETE PLUGIN
							creates autocomplete using an external source
===============================================================================================*/
(function($){
	var elements = {};
	var methods = {

		init : function (options){

 			return this.each(function(){
 				
 				var $this = $(this);
 				//elements[$this.attr("name")] = $this;
 				var that = this; //lock reference to input
 				this.options = {};//local collection of plugin options

				if($this.data("type-arguments")) {
 					$.extend(this.options,$this.data("type-arguments"));
 				}
/*				if(!this.options["listId"]) {
					alert("Please define list id by adding \"list-id\":\"[listid]\" to data-type-arguments for field '" + $this.attr("name") + "'");
					return false;
				}*/
				
				//set emptyClass if not provided.
 				if(!this.options.emptyClass) {
 					this.options.emptyClass="empty";
 				}

				$this.autocomplete({
					source: methods.getCountryList(),
					select: function(event, ui) {
						event.preventDefault();
		        		
						//if listId is available, the selected autocomplete value will be added to a list
		        		if(this.options["listId"]) {
		        			
			        		$this.val(ui.item.label);
			    			$list=$("#" + that.options["listId"]);
								
							if($list.find(".empty")) {
								$list.find(".empty").hide();
							}
							
							var $li=$("<li><div class=\"label\">" + ui.item.label + "<span class=\"control icon-remove icon-white\"></div></li>");
							
							//add delete handler						
							$li.find(".control.icon-remove").click(function(){
								$li.fadeOut('fast', function(){
									methods.removeLocationData($this, $li.index(), $list.find("li > div:not(." + that.options.emptyClass + ")").length);
									$li.remove();
									
									if($list.find("li > div:not(.empty)").length == 0) {
										$list.find(".empty").fadeIn('fast');
									}
								});
								
							});
							//add item to list
							$list.append($li);
							this.value = "";
							//create hidden bidx addressfields
							methods.setLocationData($this, ui.item.value, ($list.find("li > div:not(." + that.options.emptyClass + ")").length -1));
						}
						else {
							$this.val(ui.item.label);
						}
		    		},
		    		focus: function(event, ui) {
		    			event.preventDefault();
		        		$this.val(ui.item.label);
		        		

		    		}
				});
			});
		},

		/*this function is specifically for bidx Address. Always needs to be converted to format defined below*/
		setLocationData : function(input,location, index)	 {
			var fieldname=(index!="undefined" ? "["+index+"].":"") + "country";
		 	methods.createHiddenField(input, fieldname, location);				
			
		},

		//this function removes a set of bidx hidden address fields and renumbers the other sets of fields so the order is consistent
		removeLocationData : function (input, index, listLength) {
			$("[name^='" + (input.attr("name") + "[" + (index-1) + "]") + "']").remove();
			if(index != listLength) {
				//all fields above this index need to receive an decrement of the indexnumber in the name
				for(var i=index+1;i<=listLength;i++){
					$("[name^='" + (input.attr("name") + "[" + (i-1) + "]") + "']").each(function(index,it){
						var $it=$(it);
						$it.attr("name", $it.attr("name").replace(input.attr("name") + "[" + (i-1) + "]",input.attr("name") + "[" + (i-2) + "]"));
						
					});


					
				}
			}
			
		},

		//create hiddenfield for bidX address storage
		createHiddenField : function(input, name, val) {
			var fieldname = input.attr("name") + name;
			//check if hiddenfield already exists
			if(input.nextAll("[name='" + fieldname + "']").length == 0) {
				input.after("<input type=\"hidden\" name=\"" + input.attr("name") + name + "\" value=\"" + val + "\">");
			}
			//if exists, update value
			else {
				input.nextAll("[name='" + fieldname + "']").val(val);
			}
			
		},

		getCountryList : function() {
			return [
				{			
				  "value" : "AF",
				  "label" : "Afghanistan"
				}, {
				  "value" : "AX",
				  "label" : "Åland Islands"
				}, {
				  "value" : "AL",
				  "label" : "Albania"
				}, {
				  "value" : "DZ",
				  "label" : "Algeria"
				}, {
				  "value" : "AS",
				  "label" : "American Samoa"
				}, {
				  "value" : "AD",
				  "label" : "Andorra"
				}, {
				  "value" : "AO",
				  "label" : "Angola"
				}, {
				  "value" : "AI",
				  "label" : "Anguilla"
				}, {
				  "value" : "AQ",
				  "label" : "Antarctica"
				}, {
				  "value" : "AG",
				  "label" : "Antigua and Barbuda"
				}, {
				  "value" : "AR",
				  "label" : "Argentina"
				}, {
				  "value" : "AM",
				  "label" : "Armenia"
				}, {
				  "value" : "AW",
				  "label" : "Aruba"
				}, {
				  "value" : "AU",
				  "label" : "Australia"
				}, {
				  "value" : "AT",
				  "label" : "Austria"
				}, {
				  "value" : "AZ",
				  "label" : "Azerbaijan"
				}, {
				  "value" : "BS",
				  "label" : "Bahamas"
				}, {
				  "value" : "BH",
				  "label" : "Bahrain"
				}, {
				  "value" : "BD",
				  "label" : "Bangladesh"
				}, {
				  "value" : "BB",
				  "label" : "Barbados"
				}, {
				  "value" : "BY",
				  "label" : "Belarus"
				}, {
				  "value" : "BE",
				  "label" : "Belgium"
				}, {
				  "value" : "BZ",
				  "label" : "Belize"
				}, {
				  "value" : "BJ",
				  "label" : "Benin"
				}, {
				  "value" : "BM",
				  "label" : "Bermuda"
				}, {
				  "value" : "BT",
				  "label" : "Bhutan"
				}, {
				  "value" : "BO",
				  "label" : "Bolivia"
				}, {
				  "value" : "BQ",
				  "label" : "Bonaire"
				}, {
				  "value" : "BA",
				  "label" : "Bosnia and Herzegovina"
				}, {
				  "value" : "BW",
				  "label" : "Botswana"
				}, {
				  "value" : "BV",
				  "label" : "Bouvet Island"
				}, {
				  "value" : "BR",
				  "label" : "Brazil"
				}, {
				  "value" : "IO",
				  "label" : "British Indian Ocean Territory"
				}, {
				  "value" : "VG",
				  "label" : "British Virgin Islands"
				}, {
				  "value" : "BN",
				  "label" : "Brunei"
				}, {
				  "value" : "BG",
				  "label" : "Bulgaria"
				}, {
				  "value" : "BF",
				  "label" : "Burkina Faso"
				}, {
				  "value" : "BI",
				  "label" : "Burundi"
				}, {
				  "value" : "KH",
				  "label" : "Cambodia"
				}, {
				  "value" : "CM",
				  "label" : "Cameroon"
				}, {
				  "value" : "CA",
				  "label" : "Canada"
				}, {
				  "value" : "CV",
				  "label" : "Cape Verde"
				}, {
				  "value" : "KY",
				  "label" : "Cayman Islands"
				}, {
				  "value" : "CF",
				  "label" : "Central African Republic"
				}, {
				  "value" : "TD",
				  "label" : "Chad"
				}, {
				  "value" : "CL",
				  "label" : "Chile"
				}, {
				  "value" : "CN",
				  "label" : "China"
				}, {
				  "value" : "CX",
				  "label" : "Christmas Island"
				}, {
				  "value" : "CC",
				  "label" : "Cocos Islands"
				}, {
				  "value" : "CO",
				  "label" : "Colombia"
				}, {
				  "value" : "KM",
				  "label" : "Comoros"
				}, {
				  "value" : "CG",
				  "label" : "Congo"
				}, {
				  "value" : "CK",
				  "label" : "Cook Islands"
				}, {
				  "value" : "CR",
				  "label" : "Costa Rica"
				}, {
				  "value" : "CI",
				  "label" : "Côte d'Ivoire"
				}, {
				  "value" : "HR",
				  "label" : "Croatia"
				}, {
				  "value" : "CU",
				  "label" : "Cuba"
				}, {
				  "value" : "CW",
				  "label" : "Curaçao"
				}, {
				  "value" : "CY",
				  "label" : "Cyprus"
				}, {
				  "value" : "CZ",
				  "label" : "Czech Republic"
				}, {
				  "value" : "DK",
				  "label" : "Denmark"
				}, {
				  "value" : "DJ",
				  "label" : "Djibouti"
				}, {
				  "value" : "DM",
				  "label" : "Dominica"
				}, {
				  "value" : "DO",
				  "label" : "Dominican Republic"
				}, {
				  "value" : "EC",
				  "label" : "Ecuador"
				}, {
				  "value" : "EG",
				  "label" : "Egypt"
				}, {
				  "value" : "SV",
				  "label" : "El Salvador"
				}, {
				  "value" : "GQ",
				  "label" : "Equatorial Guinea"
				}, {
				  "value" : "ER",
				  "label" : "Eritrea"
				}, {
				  "value" : "EE",
				  "label" : "Estonia"
				}, {
				  "value" : "ET",
				  "label" : "Ethiopia"
				}, {
				  "value" : "FK",
				  "label" : "Falkland Islands"
				}, {
				  "value" : "FO",
				  "label" : "Faroe Islands"
				}, {
				  "value" : "FJ",
				  "label" : "Fiji"
				}, {
				  "value" : "FI",
				  "label" : "Finland"
				}, {
				  "value" : "FR",
				  "label" : "France"
				}, {
				  "value" : "GF",
				  "label" : "French Guiana"
				}, {
				  "value" : "PF",
				  "label" : "French Polynesia"
				}, {
				  "value" : "TF",
				  "label" : "French Southern Territories"
				}, {
				  "value" : "GA",
				  "label" : "Gabon"
				}, {
				  "value" : "GM",
				  "label" : "Gambia"
				}, {
				  "value" : "GE",
				  "label" : "Georgia"
				}, {
				  "value" : "DE",
				  "label" : "Germany"
				}, {
				  "value" : "GH",
				  "label" : "Ghana"
				}, {
				  "value" : "GI",
				  "label" : "Gibraltar"
				}, {
				  "value" : "GR",
				  "label" : "Greece"
				}, {
				  "value" : "GL",
				  "label" : "Greenland"
				}, {
				  "value" : "GD",
				  "label" : "Grenada"
				}, {
				  "value" : "GP",
				  "label" : "Guadeloupe"
				}, {
				  "value" : "GU",
				  "label" : "Guam"
				}, {
				  "value" : "GT",
				  "label" : "Guatemala"
				}, {
				  "value" : "GG",
				  "label" : "Guernsey"
				}, {
				  "value" : "GN",
				  "label" : "Guinea"
				}, {
				  "value" : "GW",
				  "label" : "Guinea-Bissau"
				}, {
				  "value" : "GY",
				  "label" : "Guyana"
				}, {
				  "value" : "HT",
				  "label" : "Haiti"
				}, {
				  "value" : "HM",
				  "label" : "Heard Island And McDonald Islands"
				}, {
				  "value" : "HN",
				  "label" : "Honduras"
				}, {
				  "value" : "HK",
				  "label" : "Hong Kong"
				}, {
				  "value" : "HU",
				  "label" : "Hungary"
				}, {
				  "value" : "IS",
				  "label" : "Iceland"
				}, {
				  "value" : "IN",
				  "label" : "India"
				}, {
				  "value" : "ID",
				  "label" : "Indonesia"
				}, {
				  "value" : "IR",
				  "label" : "Iran"
				}, {
				  "value" : "IQ",
				  "label" : "Iraq"
				}, {
				  "value" : "IE",
				  "label" : "Ireland"
				}, {
				  "value" : "IM",
				  "label" : "Isle Of Man"
				}, {
				  "value" : "IL",
				  "label" : "Israel"
				}, {
				  "value" : "IT",
				  "label" : "Italy"
				}, {
				  "value" : "JM",
				  "label" : "Jamaica"
				}, {
				  "value" : "JP",
				  "label" : "Japan"
				}, {
				  "value" : "JE",
				  "label" : "Jersey"
				}, {
				  "value" : "JO",
				  "label" : "Jordan"
				}, {
				  "value" : "KZ",
				  "label" : "Kazakhstan"
				}, {
				  "value" : "KE",
				  "label" : "Kenya"
				}, {
				  "value" : "KI",
				  "label" : "Kiribati"
				}, {
				  "value" : "KW",
				  "label" : "Kuwait"
				}, {
				  "value" : "KG",
				  "label" : "Kyrgyzstan"
				}, {
				  "value" : "LA",
				  "label" : "Laos"
				}, {
				  "value" : "LV",
				  "label" : "Latvia"
				}, {
				  "value" : "LB",
				  "label" : "Lebanon"
				}, {
				  "value" : "LS",
				  "label" : "Lesotho"
				}, {
				  "value" : "LR",
				  "label" : "Liberia"
				}, {
				  "value" : "LY",
				  "label" : "Libya"
				}, {
				  "value" : "LI",
				  "label" : "Liechtenstein"
				}, {
				  "value" : "LT",
				  "label" : "Lithuania"
				}, {
				  "value" : "LU",
				  "label" : "Luxembourg"
				}, {
				  "value" : "MO",
				  "label" : "Macao"
				}, {
				  "value" : "MK",
				  "label" : "Macedonia"
				}, {
				  "value" : "MG",
				  "label" : "Madagascar"
				}, {
				  "value" : "MW",
				  "label" : "Malawi"
				}, {
				  "value" : "MY",
				  "label" : "Malaysia"
				}, {
				  "value" : "MV",
				  "label" : "Maldives"
				}, {
				  "value" : "ML",
				  "label" : "Mali"
				}, {
				  "value" : "MT",
				  "label" : "Malta"
				}, {
				  "value" : "MH",
				  "label" : "Marshall Islands"
				}, {
				  "value" : "MQ",
				  "label" : "Martinique"
				}, {
				  "value" : "MR",
				  "label" : "Mauritania"
				}, {
				  "value" : "MU",
				  "label" : "Mauritius"
				}, {
				  "value" : "YT",
				  "label" : "Mayotte"
				}, {
				  "value" : "MX",
				  "label" : "Mexico"
				}, {
				  "value" : "FM",
				  "label" : "Micronesia"
				}, {
				  "value" : "MD",
				  "label" : "Moldova"
				}, {
				  "value" : "MC",
				  "label" : "Monaco"
				}, {
				  "value" : "MN",
				  "label" : "Mongolia"
				}, {
				  "value" : "ME",
				  "label" : "Montenegro"
				}, {
				  "value" : "MS",
				  "label" : "Montserrat"
				}, {
				  "value" : "MA",
				  "label" : "Morocco"
				}, {
				  "value" : "MZ",
				  "label" : "Mozambique"
				}, {
				  "value" : "MM",
				  "label" : "Myanmar"
				}, {
				  "value" : "NA",
				  "label" : "Namibia"
				}, {
				  "value" : "NR",
				  "label" : "Nauru"
				}, {
				  "value" : "NP",
				  "label" : "Nepal"
				}, {
				  "value" : "NL",
				  "label" : "Netherlands"
				}, {
				  "value" : "AN",
				  "label" : "Netherlands Antilles"
				}, {
				  "value" : "NC",
				  "label" : "New Caledonia"
				}, {
				  "value" : "NZ",
				  "label" : "New Zealand"
				}, {
				  "value" : "NI",
				  "label" : "Nicaragua"
				}, {
				  "value" : "NE",
				  "label" : "Niger"
				}, {
				  "value" : "NG",
				  "label" : "Nigeria"
				}, {
				  "value" : "NU",
				  "label" : "Niue"
				}, {
				  "value" : "NF",
				  "label" : "Norfolk Island"
				}, {
				  "value" : "KP",
				  "label" : "North Korea"
				}, {
				  "value" : "MP",
				  "label" : "Northern Mariana Islands"
				}, {
				  "value" : "NO",
				  "label" : "Norway"
				}, {
				  "value" : "OM",
				  "label" : "Oman"
				}, {
				  "value" : "PK",
				  "label" : "Pakistan"
				}, {
				  "value" : "PW",
				  "label" : "Palau"
				}, {
				  "value" : "PS",
				  "label" : "Palestine"
				}, {
				  "value" : "PA",
				  "label" : "Panama"
				}, {
				  "value" : "PG",
				  "label" : "Papua New Guinea"
				}, {
				  "value" : "PY",
				  "label" : "Paraguay"
				}, {
				  "value" : "PE",
				  "label" : "Peru"
				}, {
				  "value" : "PH",
				  "label" : "Philippines"
				}, {
				  "value" : "PN",
				  "label" : "Pitcairn"
				}, {
				  "value" : "PL",
				  "label" : "Poland"
				}, {
				  "value" : "PT",
				  "label" : "Portugal"
				}, {
				  "value" : "PR",
				  "label" : "Puerto Rico"
				}, {
				  "value" : "QA",
				  "label" : "Qatar"
				}, {
				  "value" : "RE",
				  "label" : "Reunion"
				}, {
				  "value" : "RO",
				  "label" : "Romania"
				}, {
				  "value" : "RU",
				  "label" : "Russia"
				}, {
				  "value" : "RW",
				  "label" : "Rwanda"
				}, {
				  "value" : "BL",
				  "label" : "Saint Barthélemy"
				}, {
				  "value" : "SH",
				  "label" : "Saint Helena"
				}, {
				  "value" : "KN",
				  "label" : "Saint Kitts And Nevis"
				}, {
				  "value" : "LC",
				  "label" : "Saint Lucia"
				}, {
				  "value" : "MF",
				  "label" : "Saint Martin"
				}, {
				  "value" : "PM",
				  "label" : "Saint Pierre And Miquelon"
				}, {
				  "value" : "VC",
				  "label" : "Saint Vincent And The Grenadines"
				}, {
				  "value" : "WS",
				  "label" : "Samoa"
				}, {
				  "value" : "SM",
				  "label" : "San Marino"
				}, {
				  "value" : "ST",
				  "label" : "Sao Tome And Principe"
				}, {
				  "value" : "SA",
				  "label" : "Saudi Arabia"
				}, {
				  "value" : "SN",
				  "label" : "Senegal"
				}, {
				  "value" : "RS",
				  "label" : "Serbia"
				}, {
				  "value" : "SC",
				  "label" : "Seychelles"
				}, {
				  "value" : "SL",
				  "label" : "Sierra Leone"
				}, {
				  "value" : "SG",
				  "label" : "Singapore"
				}, {
				  "value" : "SX",
				  "label" : "Sint Maarten (Dutch part)"
				}, {
				  "value" : "SK",
				  "label" : "Slovakia"
				}, {
				  "value" : "SI",
				  "label" : "Slovenia"
				}, {
				  "value" : "SB",
				  "label" : "Solomon Islands"
				}, {
				  "value" : "SO",
				  "label" : "Somalia"
				}, {
				  "value" : "ZA",
				  "label" : "South Africa"
				}, {
				  "value" : "GS",
				  "label" : "South Georgia And The South Sandwich Islands"
				}, {
				  "value" : "KR",
				  "label" : "South Korea"
				}, {
				  "value" : "ES",
				  "label" : "Spain"
				}, {
				  "value" : "LK",
				  "label" : "Sri Lanka"
				}, {
				  "value" : "SD",
				  "label" : "Sudan"
				}, {
				  "value" : "SR",
				  "label" : "Suriname"
				}, {
				  "value" : "SJ",
				  "label" : "Svalbard And Jan Mayen"
				}, {
				  "value" : "SZ",
				  "label" : "Swaziland"
				}, {
				  "value" : "SE",
				  "label" : "Sweden"
				}, {
				  "value" : "CH",
				  "label" : "Switzerland"
				}, {
				  "value" : "SY",
				  "label" : "Syria"
				}, {
				  "value" : "TW",
				  "label" : "Taiwan"
				}, {
				  "value" : "TJ",
				  "label" : "Tajikistan"
				}, {
				  "value" : "TZ",
				  "label" : "Tanzania"
				}, {
				  "value" : "TH",
				  "label" : "Thailand"
				}, {
				  "value" : "CD",
				  "label" : "The Democratic Republic Of Congo"
				}, {
				  "value" : "TL",
				  "label" : "Timor-Leste"
				}, {
				  "value" : "TG",
				  "label" : "Togo"
				}, {
				  "value" : "TK",
				  "label" : "Tokelau"
				}, {
				  "value" : "TO",
				  "label" : "Tonga"
				}, {
				  "value" : "TT",
				  "label" : "Trinidad and Tobago"
				}, {
				  "value" : "TN",
				  "label" : "Tunisia"
				}, {
				  "value" : "TR",
				  "label" : "Turvalue"
				}, {
				  "value" : "TM",
				  "label" : "Turkmenistan"
				}, {
				  "value" : "TC",
				  "label" : "Turks And Caicos Islands"
				}, {
				  "value" : "TV",
				  "label" : "Tuvalu"
				}, {
				  "value" : "VI",
				  "label" : "U.S. Virgin Islands"
				}, {
				  "value" : "UG",
				  "label" : "Uganda"
				}, {
				  "value" : "UA",
				  "label" : "Ukraine"
				}, {
				  "value" : "AE",
				  "label" : "United Arab Emirates"
				}, {
				  "value" : "GB",
				  "label" : "United Kingdom"
				}, {
				  "value" : "US",
				  "label" : "United States"
				}, {
				  "value" : "UM",
				  "label" : "United States Minor Outlying Islands"
				}, {
				  "value" : "UY",
				  "label" : "Uruguay"
				}, {
				  "value" : "UZ",
				  "label" : "Uzbekistan"
				}, {
				  "value" : "VU",
				  "label" : "Vanuatu"
				}, {
				  "value" : "VA",
				  "label" : "Vatican"
				}, {
				  "value" : "VE",
				  "label" : "Venezuela"
				}, {
				  "value" : "VN",
				  "label" : "Vietnam"
				}, {
				  "value" : "WF",
				  "label" : "Wallis And Futuna"
				}, {
				  "value" : "EH",
				  "label" : "Western Sahara"
				}, {
				  "value" : "YE",
				  "label" : "Yemen"
				}, {
				  "value" : "ZM",
				  "label" : "Zambia"
				}, {
				  "value" : "ZW",
				  "label" : "Zimbabwe"
				}
			];
		}
	}

	$.fn.countryAutocomplete = function(method) {
		if(methods[method]) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}
		else if(typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
		else {
			$.error( 'Method ' +  method + ' does not exist on jQuery Form' );
		}
  	};
})(jQuery);
