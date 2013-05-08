<?php

add_action( 'wp_footer', 'bidx_memberprofile_add_to_footer' );

/**
 * Add script block to footer
 */
function bidx_memberprofile_add_to_footer() {
	?>
<script>
	window.bidx = bidx || {};
	window.bidx.api = {
		settings: {
              servicesPath:   "../../static/js/bidxAPI/services/"
            }
    };
</script>
	<?php
}

$view -> render('view.phtml');


?>
<div class="block-odd">
	<div class="container">

		<div class="">
			<h1>member-profile</h1>
		</div>

		<a class="btn btn-primary" href="#edit">Edit</a>


		<!-- START OF APP -->

		<div id="memberEdit">

			<!-- LOAD -->
			<div class="view viewLoad">
				<span>Retrieving member information...</span>
			</div>

			<!-- ERROR -->
			<div class="view viewError">
				<h2>Error</h2>
				<p class="errorMsg"></p>
			</div>

			<!-- SHOW -->
			<div class="view viewShow">
				<a class="btn btn-primary" href="#edit">Edit</a>
			</div>

			<!-- EDIT -->
			<div class="view viewEdit">

				<form>

					<div class="formfield">
						<label>First name</label> <input type="text"
							name="personalDetails.firstName"
							placeholder="Please type your first name" />
					</div>

					<div class="formfield">
						<label>Last name</label> <input type="text"
							name="personalDetails.lastName"
							placeholder="Please type your last name" />
					</div>

					<div class="formfield">
						<label>Professional title</label> <input type="text"
							name="personalDetails.professionalTitle"
							placeholder="Please type your professional title" />
					</div>

					<div class="formfield">
						<label>Gender</label> <label class="radio" for="male"><input
							type="radio" id="m" value="m" name="personalDetails.gender" />
							Male</label> <label class="radio" for="female"><input
							type="radio" id="f" value="f" name="personalDetails.gender" />
							Female</label>
					</div>

					<div class="formfield">
						<label>Nationality</label> <select
							name="personalDetails.nationality">
							<option value="">Please select your nationality</option>
							<option value="AD">Andorra</option>
							<option value="AF">Afghanistan</option>
							<option value="AX">Åland Islands</option>
							<option value="AL">Albania</option>
							<option value="DZ">Algeria</option>
							<option value="AS">American Samoa</option>
							<option value="AO">Angola</option>
							<option value="AI">Anguilla</option>
							<option value="AQ">Antarctica</option>
							<option value="AG">Antigua and Barbuda</option>
							<option value="AR">Argentina</option>
							<option value="AM">Armenia</option>
							<option value="AW">Aruba</option>
							<option value="AU">Australia</option>
							<option value="AT">Austria</option>
							<option value="AZ">Azerbaijan</option>
							<option value="BS">Bahamas</option>
							<option value="BH">Bahrain</option>
							<option value="BD">Bangladesh</option>
							<option value="BB">Barbados</option>
							<option value="BY">Belarus</option>
							<option value="BE">Belgium</option>
							<option value="BZ">Belize</option>
							<option value="BJ">Benin</option>
							<option value="BM">Bermuda</option>
							<option value="BT">Bhutan</option>
							<option value="BO">Bolivia</option>
							<option value="BQ">Bonaire</option>
							<option value="BA">Bosnia and Herzegovina</option>
							<option value="BW">Botswana</option>
							<option value="BV">Bouvet Island</option>
							<option value="BR">Brazil</option>
							<option value="IO">British Indian Ocean Territory</option>
							<option value="VG">British Virgin Islands</option>
							<option value="BN">Brunei</option>
							<option value="BG">Bulgaria</option>
							<option value="BF">Burkina Faso</option>
							<option value="BI">Burundi</option>
							<option value="KH">Cambodia</option>
							<option value="CM">Cameroon</option>
							<option value="CA">Canada</option>
							<option value="CV">Cape Verde</option>
							<option value="KY">Cayman Islands</option>
							<option value="CF">Central African Republic</option>
							<option value="TD">Chad</option>
							<option value="CL">Chile</option>
							<option value="CN">China</option>
							<option value="CX">Christmas Island</option>
							<option value="CC">Cocos Islands</option>
							<option value="CO">Colombia</option>
							<option value="KM">Comoros</option>
							<option value="CG">Congo</option>
							<option value="CK">Cook Islands</option>
							<option value="CR">Costa Rica</option>
							<option value="CI">Côte d'Ivoire</option>
							<option value="HR">Croatia</option>
							<option value="CU">Cuba</option>
							<option value="CW">Curaçao</option>
							<option value="CY">Cyprus</option>
							<option value="CZ">Czech Republic</option>
							<option value="DK">Denmark</option>
							<option value="DJ">Djibouti</option>
							<option value="DM">Dominica</option>
							<option value="DO">Dominican Republic</option>
							<option value="EC">Ecuador</option>
							<option value="EG">Egypt</option>
							<option value="SV">El Salvador</option>
							<option value="GQ">Equatorial Guinea</option>
							<option value="ER">Eritrea</option>
							<option value="EE">Estonia</option>
							<option value="ET">Ethiopia</option>
							<option value="FK">Falkland Islands</option>
							<option value="FO">Faroe Islands</option>
							<option value="FJ">Fiji</option>
							<option value="FI">Finland</option>
							<option value="FR">France</option>
							<option value="GF">French Guiana</option>
							<option value="PF">French Polynesia</option>
							<option value="TF">French Southern Territories</option>
							<option value="GA">Gabon</option>
							<option value="GM">Gambia</option>
							<option value="GE">Georgia</option>
							<option value="DE">Germany</option>
							<option value="GH">Ghana</option>
							<option value="GI">Gibraltar</option>
							<option value="GR">Greece</option>
							<option value="GL">Greenland</option>
							<option value="GD">Grenada</option>
							<option value="GP">Guadeloupe</option>
							<option value="GU">Guam</option>
							<option value="GT">Guatemala</option>
							<option value="GG">Guernsey</option>
							<option value="GN">Guinea</option>
							<option value="GW">Guinea-Bissau</option>
							<option value="GY">Guyana</option>
							<option value="HT">Haiti</option>
							<option value="HM">Heard Island And McDonald Islands</option>
							<option value="HN">Honduras</option>
							<option value="HK">Hong Kong</option>
							<option value="HU">Hungary</option>
							<option value="IS">Iceland</option>
							<option value="IN">India</option>
							<option value="ID">Indonesia</option>
							<option value="IR">Iran</option>
							<option value="IQ">Iraq</option>
							<option value="IE">Ireland</option>
							<option value="IM">Isle Of Man</option>
							<option value="IL">Israel</option>
							<option value="IT">Italy</option>
							<option value="JM">Jamaica</option>
							<option value="JP">Japan</option>
							<option value="JE">Jersey</option>
							<option value="JO">Jordan</option>
							<option value="KZ">Kazakhstan</option>
							<option value="KE">Kenya</option>
							<option value="KI">Kiribati</option>
							<option value="KW">Kuwait</option>
							<option value="KG">Kyrgyzstan</option>
							<option value="LA">Laos</option>
							<option value="LV">Latvia</option>
							<option value="LB">Lebanon</option>
							<option value="LS">Lesotho</option>
							<option value="LR">Liberia</option>
							<option value="LY">Libya</option>
							<option value="LI">Liechtenstein</option>
							<option value="LT">Lithuania</option>
							<option value="LU">Luxembourg</option>
							<option value="MO">Macao</option>
							<option value="MK">Macedonia</option>
							<option value="MG">Madagascar</option>
							<option value="MW">Malawi</option>
							<option value="MY">Malaysia</option>
							<option value="MV">Maldives</option>
							<option value="ML">Mali</option>
							<option value="MT">Malta</option>
							<option value="MH">Marshall Islands</option>
							<option value="MQ">Martinique</option>
							<option value="MR">Mauritania</option>
							<option value="MU">Mauritius</option>
							<option value="YT">Mayotte</option>
							<option value="MX">Mexico</option>
							<option value="FM">Micronesia</option>
							<option value="MD">Moldova</option>
							<option value="MC">Monaco</option>
							<option value="MN">Mongolia</option>
							<option value="ME">Montenegro</option>
							<option value="MS">Montserrat</option>
							<option value="MA">Morocco</option>
							<option value="MZ">Mozambique</option>
							<option value="MM">Myanmar</option>
							<option value="NA">Namibia</option>
							<option value="NR">Nauru</option>
							<option value="NP">Nepal</option>
							<option value="NL">Netherlands</option>
							<option value="AN">Netherlands Antilles</option>
							<option value="NC">New Caledonia</option>
							<option value="NZ">New Zealand</option>
							<option value="NI">Nicaragua</option>
							<option value="NE">Niger</option>
							<option value="NG">Nigeria</option>
							<option value="NU">Niue</option>
							<option value="NF">Norfolk Island</option>
							<option value="KP">North Korea</option>
							<option value="MP">Northern Mariana Islands</option>
							<option value="NO">Norway</option>
							<option value="OM">Oman</option>
							<option value="PK">Pakistan</option>
							<option value="PW">Palau</option>
							<option value="PS">Palestine</option>
							<option value="PA">Panama</option>
							<option value="PG">Papua New Guinea</option>
							<option value="PY">Paraguay</option>
							<option value="PE">Peru</option>
							<option value="PH">Philippines</option>
							<option value="PN">Pitcairn</option>
							<option value="PL">Poland</option>
							<option value="PT">Portugal</option>
							<option value="PR">Puerto Rico</option>
							<option value="QA">Qatar</option>
							<option value="RE">Reunion</option>
							<option value="RO">Romania</option>
							<option value="RU">Russia</option>
							<option value="RW">Rwanda</option>
							<option value="BL">Saint Barthélemy</option>
							<option value="SH">Saint Helena</option>
							<option value="KN">Saint Kitts And Nevis</option>
							<option value="LC">Saint Lucia</option>
							<option value="MF">Saint Martin</option>
							<option value="PM">Saint Pierre And Miquelon</option>
							<option value="VC">Saint Vincent And The Grenadines</option>
							<option value="WS">Samoa</option>
							<option value="SM">San Marino</option>
							<option value="ST">Sao Tome And Principe</option>
							<option value="SA">Saudi Arabia</option>
							<option value="SN">Senegal</option>
							<option value="RS">Serbia</option>
							<option value="SC">Seychelles</option>
							<option value="SL">Sierra Leone</option>
							<option value="SG">Singapore</option>
							<option value="SX">Sint Maarten (Dutch part)</option>
							<option value="SK">Slovakia</option>
							<option value="SI">Slovenia</option>
							<option value="SB">Solomon Islands</option>
							<option value="SO">Somalia</option>
							<option value="ZA">South Africa</option>
							<option value="GS">South Georgia And The South Sandwich Islands</option>
							<option value="KR">South Korea</option>
							<option value="ES">Spain</option>
							<option value="LK">Sri Lanka</option>
							<option value="SD">Sudan</option>
							<option value="SR">Suriname</option>
							<option value="SJ">Svalbard And Jan Mayen</option>
							<option value="SZ">Swaziland</option>
							<option value="SE">Sweden</option>
							<option value="CH">Switzerland</option>
							<option value="SY">Syria</option>
							<option value="TW">Taiwan</option>
							<option value="TJ">Tajikistan</option>
							<option value="TZ">Tanzania</option>
							<option value="TH">Thailand</option>
							<option value="CD">The Democratic Republic Of Congo</option>
							<option value="TL">Timor-Leste</option>
							<option value="TG">Togo</option>
							<option value="TK">Tokelau</option>
							<option value="TO">Tonga</option>
							<option value="TT">Trinidad and Tobago</option>
							<option value="TN">Tunisia</option>
							<option value="TR">Turkey</option>
							<option value="TM">Turkmenistan</option>
							<option value="TC">Turks And Caicos Islands</option>
							<option value="TV">Tuvalu</option>
							<option value="VI">U.S. Virgin Islands</option>
							<option value="UG">Uganda</option>
							<option value="UA">Ukraine</option>
							<option value="AE">United Arab Emirates</option>
							<option value="GB">United Kingdom</option>
							<option value="US">United States</option>
							<option value="UM">United States Minor Outlying Islands</option>
							<option value="UY">Uruguay</option>
							<option value="UZ">Uzbekistan</option>
							<option value="VU">Vanuatu</option>
							<option value="VA">Vatican</option>
							<option value="VE">Venezuela</option>
							<option value="VN">Vietnam</option>
							<option value="WF">Wallis And Futuna</option>
							<option value="EH">Western Sahara</option>
							<option value="YE">Yemen</option>
							<option value="ZM">Zambia</option>
							<option value="ZW">Zimbabwe</option>
						</select>
					</div>

					<div class="formfield">
						<label>Date of birth</label> <input type="text"
							name="personalDetails.dateOfBirth" data-type="date"
							placeholder="Please type your date of birth" />
					</div>


					<div class="formfield">
						<label>Highest Education</label> <select
							name="personalDetails.highestEducation">
							<option value="">Please select your highest education</option>
							<option value="secondarySchool">Secondary school</option>
							<option value="vocationalTraining">Vocational training</option>
							<option value="technicalSchool">Technical school</option>
							<option value="universityBachelors">University - Bachelors</option>
							<option value="universityMasters">University - Masters</option>
							<option value="universityPostgraduate">University - Postgraduate</option>
						</select>
					</div>

					<div class="formfield"
						data-validation='{"typecheck": [{"url":{"text":"Please fill in a valid URL"}}]}'>
						<label>LinkedIn profile</label> <input type="url"
							name="personalDetails.linkedIn"
							placeholder="Please type your LinkedIn profile url" />
					</div>

					<div class="formfield"
						data-validation='{"typecheck": [{"url":{"text":"Please fill in a valid URL"}}]}'>
						<label>Facebook profile</label> <input type="url"
							name="personalDetails.facebook"
							placeholder="Please type your Facebook profile url" />
					</div>

					<div class="formfield"
						data-validation='{"typecheck": [{"email":{"text":"Please fill in a valid email address"}}]}'>
						<label>Email address</label> <input type="email"
							name="personalDetails.emailAddress"
							placeholder="Please type your email address" />
					</div>

					<div class="formfield">
						<label>Skype</label> <input type="text"
							name="personalDetails.skype"
							placeholder="Please type your Skype identifier" />
					</div>

					<div class="formfield">
						<label>Twitter</label> <input type="text"
							name="personalDetails.twitter"
							placeholder="Please type your Twitter identifier" />
					</div>

					<div class="formfield">
						<label>Profile image</label> <input type="file"
							name="personalDetails.profilePicture" data-type="fileUpload"
							data-type-arguments='{"url":"/wp-admin/admin-ajax.php?action=file_upload", "addFields":["memberProfileId","domain"]}' />
					</div>

					<fieldset name="languageDetail">
						<legend>Language</legend>

						<div class="formfield">
							<label>language</label> <select
								name="personalDetails.languageDetail[0].language">
								<option value="">Please select a language</option>
								<option value="sq">Albanian</option>
								<option value="ar">Arabic</option>
								<option value="be">Belarusian</option>
								<option value="bg">Bulgarian</option>
								<option value="ca">Catalan</option>
								<option value="zh">Chinese</option>
								<option value="hr">Croatian</option>
								<option value="cs">Czech</option>
								<option value="da">Danish</option>
								<option value="nl">Dutch</option>
								<option value="en">English</option>
								<option value="et">Estonian</option>
								<option value="fi">Finnish</option>
								<option value="fr">French</option>
								<option value="de">German</option>
								<option value="el">Greek</option>
								<option value="iw">Hebrew</option>
								<option value="hi">Hindi</option>
								<option value="hu">Hungarian</option>
								<option value="is">Icelandic</option>
								<option value="in">Indonesian</option>
								<option value="ga">Irish</option>
								<option value="it">Italian</option>
								<option value="ja">Japanese</option>
								<option value="ko">Korean</option>
								<option value="lv">Latvian</option>
								<option value="lt">Lithuanian</option>
								<option value="mk">Macedonian</option>
								<option value="mt">Maltese</option>
								<option value="no">Norwegian</option>
								<option value="pl">Polish</option>
								<option value="pt">Portuguese</option>
								<option value="ro">Romanian</option>
								<option value="ru">Russian</option>
								<option value="sr">Serbian</option>
								<option value="sk">Slovak</option>
								<option value="sl">Slovenian</option>
								<option value="es">Spanish</option>
								<option value="sv">Swedish</option>
								<option value="th">Thai</option>
								<option value="tr">Turkish</option>
								<option value="uk">Ukrainian</option>
								<option value="vi">Vietnamese</option>
							</select>
						</div>

						<div class="formfield">
							<label>Mother tongue</label> <label for="mt-yes" class="radio"><input
								type="radio" id="mt-yes" value="true"
								name="personalDetails.languageDetail[0].motherLanguage" /> Yes</label>
							<label for="mt-no" class="radio"><input type="radio" id="mt-no"
								value="false"
								name="personalDetails.languageDetail[0].motherLanguage" /> No</label>
						</div>

						<div class="formfield">
							<label>Working language</label> <label for="wl-yes" class="radio"><input
								type="radio" id="wl-yes" value="true"
								name="personalDetails.languageDetail[0].workingLanguage" /> Yes</label>
							<label for="wl-no" class="radio"><input type="radio" id="wl-no"
								value="false"
								name="personalDetails.languageDetail[0].workingLanguage" /> No</label>
						</div>

						<div class="formfield">
							<label>Rating spoken</label> <select
								name="personalDetails.languageDetail[0].ratingSpoken">
								<option value="">Please select a rating</option>
								<option value="fluent">Fluent</option>
								<option value="good">Good</option>
								<option value="basic">Basic</option>
							</select>
						</div>

						<div class="formfield">
							<label>Rating written</label> <select
								name="personalDetails.languageDetail[0].ratingWritten">
								<option value="">Please select a rating</option>
								<option value="fluent">Fluent</option>
								<option value="good">Good</option>
								<option value="basic">Basic</option>
							</select>
						</div>

					</fieldset>

					<fieldset name="address">
						<legend>Address</legend>
						<!-- in CR1 we only support 1 address -->

						<div class="formfield">
							<label>ETR</label> <input type="text"
								name="personalDetails.address[0].eTR"
								placeholder="Please type your ETR" />
						</div>

						<div class="formfield">
							<label>Street</label> <input type="text"
								name="personalDetails.address[0].street"
								placeholder="Please type your street" />
						</div>

						<div class="formfield">
							<label>Street number</label> <input type="text"
								name="personalDetails.address[0].streetNumber"
								placeholder="Please type your street number" />
						</div>

						<div class="formfield">
							<label>Neighborhood</label> <input type="text"
								name="personalDetails.address[0].neighborhood"
								placeholder="Please type your neighborhood" />
						</div>

						<div class="formfield">
							<label>City</label> <input type="text"
								name="personalDetails.address[0].cityTown"
								placeholder="Please type your city" />
						</div>

						<div class="formfield">
							<label>Country</label> <select
								name="personalDetails.address[0].country">
								<option value="">Please select your country</option>
								<option value="AD">Andorra</option>
								<option value="AF">Afghanistan</option>
								<option value="AX">Ã…land Islands</option>
								<option value="AL">Albania</option>
								<option value="DZ">Algeria</option>
								<option value="AS">American Samoa</option>
								<option value="AO">Angola</option>
								<option value="AI">Anguilla</option>
								<option value="AQ">Antarctica</option>
								<option value="AG">Antigua and Barbuda</option>
								<option value="AR">Argentina</option>
								<option value="AM">Armenia</option>
								<option value="AW">Aruba</option>
								<option value="AU">Australia</option>
								<option value="AT">Austria</option>
								<option value="AZ">Azerbaijan</option>
								<option value="BS">Bahamas</option>
								<option value="BH">Bahrain</option>
								<option value="BD">Bangladesh</option>
								<option value="BB">Barbados</option>
								<option value="BY">Belarus</option>
								<option value="BE">Belgium</option>
								<option value="BZ">Belize</option>
								<option value="BJ">Benin</option>
								<option value="BM">Bermuda</option>
								<option value="BT">Bhutan</option>
								<option value="BO">Bolivia</option>
								<option value="BQ">Bonaire</option>
								<option value="BA">Bosnia and Herzegovina</option>
								<option value="BW">Botswana</option>
								<option value="BV">Bouvet Island</option>
								<option value="BR">Brazil</option>
								<option value="IO">British Indian Ocean Territory</option>
								<option value="VG">British Virgin Islands</option>
								<option value="BN">Brunei</option>
								<option value="BG">Bulgaria</option>
								<option value="BF">Burkina Faso</option>
								<option value="BI">Burundi</option>
								<option value="KH">Cambodia</option>
								<option value="CM">Cameroon</option>
								<option value="CA">Canada</option>
								<option value="CV">Cape Verde</option>
								<option value="KY">Cayman Islands</option>
								<option value="CF">Central African Republic</option>
								<option value="TD">Chad</option>
								<option value="CL">Chile</option>
								<option value="CN">China</option>
								<option value="CX">Christmas Island</option>
								<option value="CC">Cocos Islands</option>
								<option value="CO">Colombia</option>
								<option value="KM">Comoros</option>
								<option value="CG">Congo</option>
								<option value="CK">Cook Islands</option>
								<option value="CR">Costa Rica</option>
								<option value="CI">CÃ´te d'Ivoire</option>
								<option value="HR">Croatia</option>
								<option value="CU">Cuba</option>
								<option value="CW">CuraÃ§ao</option>
								<option value="CY">Cyprus</option>
								<option value="CZ">Czech Republic</option>
								<option value="DK">Denmark</option>
								<option value="DJ">Djibouti</option>
								<option value="DM">Dominica</option>
								<option value="DO">Dominican Republic</option>
								<option value="EC">Ecuador</option>
								<option value="EG">Egypt</option>
								<option value="SV">El Salvador</option>
								<option value="GQ">Equatorial Guinea</option>
								<option value="ER">Eritrea</option>
								<option value="EE">Estonia</option>
								<option value="ET">Ethiopia</option>
								<option value="FK">Falkland Islands</option>
								<option value="FO">Faroe Islands</option>
								<option value="FJ">Fiji</option>
								<option value="FI">Finland</option>
								<option value="FR">France</option>
								<option value="GF">French Guiana</option>
								<option value="PF">French Polynesia</option>
								<option value="TF">French Southern Territories</option>
								<option value="GA">Gabon</option>
								<option value="GM">Gambia</option>
								<option value="GE">Georgia</option>
								<option value="DE">Germany</option>
								<option value="GH">Ghana</option>
								<option value="GI">Gibraltar</option>
								<option value="GR">Greece</option>
								<option value="GL">Greenland</option>
								<option value="GD">Grenada</option>
								<option value="GP">Guadeloupe</option>
								<option value="GU">Guam</option>
								<option value="GT">Guatemala</option>
								<option value="GG">Guernsey</option>
								<option value="GN">Guinea</option>
								<option value="GW">Guinea-Bissau</option>
								<option value="GY">Guyana</option>
								<option value="HT">Haiti</option>
								<option value="HM">Heard Island And McDonald Islands</option>
								<option value="HN">Honduras</option>
								<option value="HK">Hong Kong</option>
								<option value="HU">Hungary</option>
								<option value="IS">Iceland</option>
								<option value="IN">India</option>
								<option value="ID">Indonesia</option>
								<option value="IR">Iran</option>
								<option value="IQ">Iraq</option>
								<option value="IE">Ireland</option>
								<option value="IM">Isle Of Man</option>
								<option value="IL">Israel</option>
								<option value="IT">Italy</option>
								<option value="JM">Jamaica</option>
								<option value="JP">Japan</option>
								<option value="JE">Jersey</option>
								<option value="JO">Jordan</option>
								<option value="KZ">Kazakhstan</option>
								<option value="KE">Kenya</option>
								<option value="KI">Kiribati</option>
								<option value="KW">Kuwait</option>
								<option value="KG">Kyrgyzstan</option>
								<option value="LA">Laos</option>
								<option value="LV">Latvia</option>
								<option value="LB">Lebanon</option>
								<option value="LS">Lesotho</option>
								<option value="LR">Liberia</option>
								<option value="LY">Libya</option>
								<option value="LI">Liechtenstein</option>
								<option value="LT">Lithuania</option>
								<option value="LU">Luxembourg</option>
								<option value="MO">Macao</option>
								<option value="MK">Macedonia</option>
								<option value="MG">Madagascar</option>
								<option value="MW">Malawi</option>
								<option value="MY">Malaysia</option>
								<option value="MV">Maldives</option>
								<option value="ML">Mali</option>
								<option value="MT">Malta</option>
								<option value="MH">Marshall Islands</option>
								<option value="MQ">Martinique</option>
								<option value="MR">Mauritania</option>
								<option value="MU">Mauritius</option>
								<option value="YT">Mayotte</option>
								<option value="MX">Mexico</option>
								<option value="FM">Micronesia</option>
								<option value="MD">Moldova</option>
								<option value="MC">Monaco</option>
								<option value="MN">Mongolia</option>
								<option value="ME">Montenegro</option>
								<option value="MS">Montserrat</option>
								<option value="MA">Morocco</option>
								<option value="MZ">Mozambique</option>
								<option value="MM">Myanmar</option>
								<option value="NA">Namibia</option>
								<option value="NR">Nauru</option>
								<option value="NP">Nepal</option>
								<option value="NL">Netherlands</option>
								<option value="AN">Netherlands Antilles</option>
								<option value="NC">New Caledonia</option>
								<option value="NZ">New Zealand</option>
								<option value="NI">Nicaragua</option>
								<option value="NE">Niger</option>
								<option value="NG">Nigeria</option>
								<option value="NU">Niue</option>
								<option value="NF">Norfolk Island</option>
								<option value="KP">North Korea</option>
								<option value="MP">Northern Mariana Islands</option>
								<option value="NO">Norway</option>
								<option value="OM">Oman</option>
								<option value="PK">Pakistan</option>
								<option value="PW">Palau</option>
								<option value="PS">Palestine</option>
								<option value="PA">Panama</option>
								<option value="PG">Papua New Guinea</option>
								<option value="PY">Paraguay</option>
								<option value="PE">Peru</option>
								<option value="PH">Philippines</option>
								<option value="PN">Pitcairn</option>
								<option value="PL">Poland</option>
								<option value="PT">Portugal</option>
								<option value="PR">Puerto Rico</option>
								<option value="QA">Qatar</option>
								<option value="RE">Reunion</option>
								<option value="RO">Romania</option>
								<option value="RU">Russia</option>
								<option value="RW">Rwanda</option>
								<option value="BL">Saint BarthÃ©lemy</option>
								<option value="SH">Saint Helena</option>
								<option value="KN">Saint Kitts And Nevis</option>
								<option value="LC">Saint Lucia</option>
								<option value="MF">Saint Martin</option>
								<option value="PM">Saint Pierre And Miquelon</option>
								<option value="VC">Saint Vincent And The Grenadines</option>
								<option value="WS">Samoa</option>
								<option value="SM">San Marino</option>
								<option value="ST">Sao Tome And Principe</option>
								<option value="SA">Saudi Arabia</option>
								<option value="SN">Senegal</option>
								<option value="RS">Serbia</option>
								<option value="SC">Seychelles</option>
								<option value="SL">Sierra Leone</option>
								<option value="SG">Singapore</option>
								<option value="SX">Sint Maarten (Dutch part)</option>
								<option value="SK">Slovakia</option>
								<option value="SI">Slovenia</option>
								<option value="SB">Solomon Islands</option>
								<option value="SO">Somalia</option>
								<option value="ZA">South Africa</option>
								<option value="GS">South Georgia And The South Sandwich Islands</option>
								<option value="KR">South Korea</option>
								<option value="ES">Spain</option>
								<option value="LK">Sri Lanka</option>
								<option value="SD">Sudan</option>
								<option value="SR">Suriname</option>
								<option value="SJ">Svalbard And Jan Mayen</option>
								<option value="SZ">Swaziland</option>
								<option value="SE">Sweden</option>
								<option value="CH">Switzerland</option>
								<option value="SY">Syria</option>
								<option value="TW">Taiwan</option>
								<option value="TJ">Tajikistan</option>
								<option value="TZ">Tanzania</option>
								<option value="TH">Thailand</option>
								<option value="CD">The Democratic Republic Of Congo</option>
								<option value="TL">Timor-Leste</option>
								<option value="TG">Togo</option>
								<option value="TK">Tokelau</option>
								<option value="TO">Tonga</option>
								<option value="TT">Trinidad and Tobago</option>
								<option value="TN">Tunisia</option>
								<option value="TR">Turkey</option>
								<option value="TM">Turkmenistan</option>
								<option value="TC">Turks And Caicos Islands</option>
								<option value="TV">Tuvalu</option>
								<option value="VI">U.S. Virgin Islands</option>
								<option value="UG">Uganda</option>
								<option value="UA">Ukraine</option>
								<option value="AE">United Arab Emirates</option>
								<option value="GB">United Kingdom</option>
								<option value="US">United States</option>
								<option value="UM">United States Minor Outlying Islands</option>
								<option value="UY">Uruguay</option>
								<option value="UZ">Uzbekistan</option>
								<option value="VU">Vanuatu</option>
								<option value="VA">Vatican</option>
								<option value="VE">Venezuela</option>
								<option value="VN">Vietnam</option>
								<option value="WF">Wallis And Futuna</option>
								<option value="EH">Western Sahara</option>
								<option value="YE">Yemen</option>
								<option value="ZM">Zambia</option>
								<option value="ZW">Zimbabwe</option>
							</select>
						</div>

						<div class="formfield">
							<label>Postal code</label> <input type="text"
								name="personalDetails.address[0].postalCode"
								placeholder="Please type your postcode" />
						</div>

						<div class="formfield">
							<label>Postbox</label> <input type="text"
								name="personalDetails.address[0].postBox"
								placeholder="Please type your postbox" />
						</div>

						<div class="formfield">
							<label>Coordinates</label> <input type="text"
								name="personalDetails.address[0].coordinates"
								placeholder="Please type your coordinates" />
						</div>

					</fieldset>

					<fieldset name="contactDetails">
						<legend>Contact details</legend>
						<!-- in CR1 we will only support 1 set of contact details -->

						<div class="formfield">
							<label>Landline</label> <input type="text"
								name="personalDetails.contactDetail[0].landLine"
								placeholder="Please type your landline number" />
						</div>

						<div class="formfield">
							<label>Mobile</label> <input type="text"
								name="personalDetails.contactDetail[0].mobile"
								placeholder="Please type your mobile number" />
						</div>

						<div class="formfield">
							<label>fax</label> <input type="text"
								name="personalDetails.contactDetail[0].fax"
								placeholder="Please type your fax number" />
						</div>

					</fieldset>

					<fieldset name="attachments">
						<legend>Attachments</legend>
						<!-- we can have multiple attachments -->
						<div class="group"></div>
					</fieldset>

					<div class="pull-right">
						<button class="btn btn-primary btnSubmit" type="submit">Save
							changes</button>
					</div>

				</form>


				<script type="text/html" id="template_attachment">
              <!--
              <div class="group">
                  <div class="formfield">
                      <label>Attachement</label>
                      <input type="file" name="document" data-type="fileUpload" data-type-arguments='{"url":"/wp-admin/admin-ajax.php?action=file_upload", "addFields":["memberProfileId","domain"]}'/>
                  </div>
              </div>
              <a href="#" class="add">Add another attachment</a>
              -->
            </script>
			</div>
		</div>
	</div>
</div>
