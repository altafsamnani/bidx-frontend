/*
	Author: Mattijs Spierings
	Description: Form validation plugin
	Version: 1.02
	Date: 16/04/2013

	Description:

	Example of validation rule for a formfield.
	Add this to the <DIV> with the formfield class as attribute data-validation (without spaces):
	{
	    "required": {
	        "text": "This fields is mandatory"
	    },
	    "typecheck": [
	        {
	            "email": {
	                "text": "This is not a valid e-mail address"
	            }
	        }, {
	            "custom": {
	                "url": "/wp-admin/admin-ajax.php?action=bidx_request",
	                "apiurl": "members/validateUsername",
	                "apimethod": "get"
	            }
	        }
	    ]
	}
*/

(function($) {

	var globalOptions = {
		path: "/wp-content/themes/plugins/",
		apimethod : "post"
	};
//	var form = null;
	var methods = {
		/*
			Init method
		*/
		init : function(options) {

			if ( this.length === 0 ) {
				alert( "Root element of form not found. Was a correct selector being provided? It doesn't match any elements..." );
				return false;
			}

			if(this.prop("tagName").toLowerCase() !== "form") {
				alert("Please use this form plugin on a form tag only");
				return false;
			}

			var $form	= this
			,	data	= {}
			;

			//collection of form elements
			//
			data.elements	= {};
			data.valid		= false;

			//extend options
			//
			if(options) {
				data.options = $.extend(globalOptions, options);
			}

			//create form element objects of each formfield element in the object
			$form.find(".formfield").each(function(){
				var el = new Element($(this)).init();
				//register form element
				el.errorClass= options.errorClass;
				data.elements[el.name]=el;
			});

			//set callToAction button
			if(options.callToAction) {

				var $callToAction = $( options.callToAction );
				$callToAction.data( "form", $form );

				//bind call to action button to click
				$callToAction.click(function(e){

					var $form	= $( this ).data( "form" )
					,	data	= $form.data( "form" )
					;

					e.preventDefault();
					data.valid = methods.validateForm.apply( $form );

					$form.data( "form", data );

					if( data.valid ) {

						$callToAction.addClass( "disabled" );

						methods.submitForm.apply( $form );
					}
				});
			}

			//enable plugins in the form elemtns that required those
			if(options.enablePlugins) {
				var i=0,plugin=null;
				while(plugin=options.enablePlugins[i++]) {
					switch(plugin) {
						case "date" :
							//activate all datepickers in this plugin
							$form.find("[data-type=date]").datepicker(
							{
								"dateFormat":                     "d MM yy"
							});
							break;
						case "slider" :

							break;
						case "location" :
							//get all location elements and activate plugin
							$form.find("[data-type=location]").location({});
							break;
						case "countryAutocomplete" :
							//get all location elements and activate plugin
							$form.find("[data-type=countryAutocomplete]").countryAutocomplete({});
							break;
						case "fileUpload" :
							//get all fileuploads in this form and activate plugin
							$form.find("[data-type=fileUpload]").fileUpload({"parentForm":this});
							break;
						default:
							break;
					}
				}
			}

			$form.data( "form", data );
		},
		formValidated : function () {
			var $form	= $( this )
			,	data	= $form.data( "form" )
			;

			return data.valid;
		},
		getElements : function() {
			var $form	= $( this )
			,	data	= $form.data( "form" )
			;

			return data.elements;
		},
		getElement : function(el) {
			var $form	= $( this )
			,	data	= $form.data( "form" )
			;

			return data.elements[el];
		},
		getForm : function(){
			return this;
		},
		submitForm : function() {

			var $form	= this
			,	data	= $form.data( "form" )
			,	options = data.options
			;

			if(options.url) {
				if(options.beforeSubmit) {
					options.beforeSubmit();
				}
				//xhr post

				var $error = $form.find( ".error_separate" );

				if ( $error.length )
				{
					$error.remove();
				}

				$.ajax({
					type:'post',
					url: options.url,
					dataType:'json',
					data: $form.find(":input:not(.ignore)").serialize() + "&apiurl=" + options.apiurl +  "&apimethod=" + options.apimethod,
					async: true})
					.always(function(data){
						if ( options.callToAction )
						{
							$( options.callToAction ).removeClass( "disabled" );
						}

						if(data) {
							if(data.status === 'OK') {
								if(data.submit) {
                                    var dyninput=null;
                                    if(data.data) {
										/* Parsing Bidx Variables and adding them as a hidden field to post to the new form*/
										jQuery.each(data.data, function(apikey, val) {
											/* it doesnt pass name variable so rename it to gname and proceed */
											apikey = (apikey==='name') ? 'dynname': apikey;
											dyninput = '<input type="hidden" name="'+apikey+'" id="'+apikey+'" value="'+val+'" />';
											$form.append(dyninput);
										});
									}
									$form.attr('action', data.submit);
									$form.attr('method', 'POST');
									$form.submit();
								}
								else if (data.redirect && !options.deferRedirect) {

									if ( window.noty )
									{
										noty(
										{
											type:           "success"
										,   text:           "Wait to be redirected..."
										,	modal:			true
										});
									}

									document.location=data.redirect;
								}
                                if(options.success) {
                                    options.success(data);
                                }
							}
							else {

								//if error handler is defined, use this one
								if(options.error) {
									options.error(data);
								}
								//otherwise show general error message in form
								else {
									var message="Something went wrong";
									if(data.text) {
										message=data.text;
									}
									//add separate error message under button
									var $button=$(globalOptions.callToAction);
									if ( $error.length === 0) {
										$error=$("<div class=\"error_separate jqHidden\">" + message + "</div>");
										$button.parent().after($error);
										$error.fadeIn('fast');
									}
									else {
										//error box already there, replace text
										$error.text(message);
									}
								}

							}
						}
						else {
							if(globalOptions.error) {
								globalOptions.error(data?data:{});
							}
						}

					});
			}
			else if( $form.attr("action")){
				$form.submit();
			}
			else {
				alert("no url or form action defined");
			}
		},
		validateForm : function(){

			var $form	= this
			,	data	= $form.data( "form" )
			;

			//now check if there are errors per field
			var field=null, result = true;
			for(field in data.elements) {

				if(!data.elements[field].validated) {
					//if(this.formfield.data("validation")) {
					//if value is NULL field has not been validated yet


					if(data.elements[field].validated === null) {
						data.elements[field].validate({data:data.elements[field]});
						result = result && data.elements[field].validated;
					}
					else {
						result = result && data.elements[field].validated;
					}
				}
			}
			return result;
		}
	};


  $.fn.form = function(method) {
	var that = this; //store reference to top object
	var elements = {};

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



/*==============================================================================================
							FILEUPLOAD EXTENTSION PLUGIN
							Description: uses xhr or iframe post
							Author: Mattijs Spierings
							Date: 22/4/2013
							Example:

							<input
								type="file"
								name="logo"
								data-type="fileUpload"
								data-type-arguments='{"url":"/uploadhandler.php", "addFields":["groupId"]}'
								value=""
							/>
							<input type="hidden" name="groupId" value="14">
===============================================================================================*/
(function($){

	var _parseCallbackFn = function( str, context ) {
		if ( !context )
		{
			context = window;
		}

		var aPath = str.split( "." );
        var value = context;
        var key   = aPath.shift();

        while( key )
        {
            if ( !value[ key ] )
            {
                value[ key ] = {};
            }
            value = value[ key ];

            key = aPath.shift();
        }

        return value;
	};

	var methods = {

		init : function (options){

			return this.each(function(){

				var $this = $(this);
				var that = this; //lock reference to input
				this.options = {};//local collection of plugin options
				$.extend(this.options, options);
				$this.bind("change", methods.uploadFile);
				//any arguments for this plugin should be placed in this attribute
				if($this.data("type-arguments")) {
					$.extend(this.options,$this.data("type-arguments"));
				}
			});
		},
		uploadFile : function(){
			var $this=$(this),
				i,
				it,
				temp;

			//set spinner
			methods.toggleAjaxLoader($this);

			$this.attr( "disabled", true );

			//check if XHR FormData is supported
			if(window.FormData !== undefined) {
				var formData = new FormData();

				formData.append($this.attr("name"),this.files[0]);
				if(this.options.addFields) {
					i=0;
					it=null;

					while(it=this.options.addFields[i++]) {
						formData.append(it,$("[name=" + it + "]").val());
					}
				}

				if(this.options.extraValues) {
					i=0;
					it=null;

					while(it=this.options.extraValues[i++]) {
						formData.append(it["name"],it["value"]);
					}
				}

				//formData.append("data",)
				$.ajax(this.options.url, {
						type:"post",
						dataType:"json",
						processData: false,
						contentType: false,
						data: formData
					})
					.always(function(data,status, xhr){
						var ret = {
							el:$this,
							status:status
						};
						$.extend(ret,data);
						methods.done(ret);
					});
			}
			//FOR < IE10 do IFRAME post
			else {
				//create iframe for posting
				var $frame = $("<iframe name=\"uploadHandler\" width=\"0\" height=\"0\" style=\"display:none\"/>"); //create frame with jQ because IE7 doesnt allow nameing of dom-elements
				var form = document.createElement("form");

				//place this form after the existing form
				var parentForm = !this.options.parentForm ? $("form:first") : $(this.options.parentForm);
				parentForm.after(form);
				$this.after($frame);
				var $form=$(form);

				//create callback handler in window scope
				window.fileuploadCallBack = function (args) {
					var ret = {
						el:$this
					};
					$.extend(ret,args);
					methods.done(ret);
					//remove temp form and iframe
					$form.remove();
					$frame.remove();
				};

				//store a reference to the filefield container
				var hook = $this.parents(".formfield");
				$form.append($this.detach());
				//create hiddenfields for all fields that are to be posted
				if(this.options.addFields) {
					i=0;
					it=null;
					temp=null;

					while(it=this.options.addFields[i++]) {
						temp = document.createElement("input");
						temp.name = it;
						temp.type="hidden";
						temp.value = $("[name=" + it + "]").val();
						$form.append(temp);
					}
				}

				//create hiddenfields for all fields that are to be posted
				if(this.options.extraValues) {
					i=0;
					it=null;
					temp=null;

					while(it=this.options.extraValues[i++]) {
						temp = document.createElement("input");
						temp.name = it["name"];
						temp.type="hidden";
						temp.value = it["value"];
						$form.append(temp);
					}
				}

				//add hidenfield so that application layer add padding to json result
				temp = document.createElement("input");
				temp.name = "jsonp";
				temp.type="hidden";
				temp.value = 1;
				$form.append(temp);

				$form.attr("method","post");
				$form.attr("target","uploadHandler");
				$form.attr("enctype","multipart/form-data");
				$form.attr("action", this.options.url);
				$form.submit();
				//return filefield to original position
				hook.find("label").after($this.detach());

			}
		},
		//define done handler
		done : function(result) {
			methods.toggleAjaxLoader(result.el);

			result.el.removeAttr( "disabled" );

			var options		= result.el[0].options
			,	callback
			;

			if ( options.callback ){
				callback = _parseCallbackFn( options.callback );
			}

			if(result.status === "OK") {

				if ( callback ) {
					callback( null, result );
				}
				else {
					switch(result.data.mimeType.split("/")[0]) {
						case "image":

							if ( options.imageContainer ) {
								$( options.imageContainer ).html( "<img src=\"" + result.data.document +  "\" >" );
							}
							else {
								//remove if wrapper exists
								result.el.parent().find(".grouplogo").remove();
								//add image with wrapper
								result.el.before("<div class=\"grouplogo\"><img src=\"" + result.data.document +  "\" ></div>");
								//result.el.parent().html("<img src=\"" + result.data.document +  "\" >");
							}

							break;
						default :
							alert("no content type returned from server");
							break;
					}
				}
			}
			else if(result.status === "ERROR" || result.status === "success") { //status succes is triggered when handler has not been called correctly


				if ( callback ) {
					callback( new Error( "Image upload failed" ) );
				}
				else {
					alert("Image upload failed");
				}
			}

			// Wipe the file input by cloning it (it's not possible to just set the .val() due to browser security constraints)
			//
			result.el.replaceWith(
				result.el.clone().fileUpload(
					{
						"parentForm":		options.parentForm
					}
				)
			);


		},
		toggleAjaxLoader : function (el) {
			//add wrapper for positioning
			if(!el.ajaxloader) {
				var wrapper = el.wrap("<div class=\"ajaxwrapper\"></div>").after("<div class=\"ajaxloader\"></div>");
				el.ajaxloader = true;
			}
			else {

				el.unwrap().next().remove();
				el.ajaxloader = false;
			}
		}
	};

	$.fn.fileUpload = function(method) {
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



/*==============================================================================================
										VALIDATOR OBJECT
===============================================================================================*/

var Validator = function () {

	this.validate = function (e) {
		var el = e.data;
		var input = el.input;
		var rule = null;
		el.validated=false;

		if(el.validation) {

			//required has highest priority so this will be tested first
			if(el.validation.required) {
				//chcek if value is empty
				if(input.val() === "" || (el.type === "checkbox" && !input.is(":checked"))) {
					rule = el.validation.required;
					el.triggerError({"required":rule},'required');
				}
				// not empty
				else {
					//there is no typecheck
					if(!doTypeCheck()) {
						//if there was a required error, remove it
						if(el.validation.required.error) {
							rule = el.validation.required;
							el.removeError({"required":rule},'required');
						}
						//else set element as validated
						else {
							el.validated=true;
						}
					}
				}
			}
			//not required
			else {
				doTypeCheck();
			}
		}

		/*
			This function does the type checking of the formfield input
		*/
		function doTypeCheck (){
			if(el.validation.typecheck && el.validation.typecheck.length > 0) {

				//now loop through typechecks
				el.validation.typecheck.every(function(rule, index, array){

					//email validation
					if(rule.email) {
						var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
						if (el.input.val() !== "" && !regex.test(el.input.val())) {
							return el.triggerError(rule,'email');
						}
						else {
							return el.removeError(rule,'email');
						}
					}
					//check numberfield
					if(rule.int) {
						if(el.input.val() !== "" && (isNaN(el.input.val()) || el.input.val() == 0)) {
							return el.triggerError(rule,'int');
						}
						else {
							return el.removeError(rule,'int');
						}

					}

					//check datefield
					if(rule.date) {
						//no validation defined yet, because date uses the Required validator only. We can add specific validation later
						if(1===0) {
							return el.triggerError(rule,'date');
						}
						else {
							return el.removeError(rule,'date');
						}
					}

					//check numberfield
					if(rule.url) {
						var regex = /^https?:\/\/[a-zA-Z0-9-]+[.][a-zA-Z0-9]{2,6}/;
						if (el.input.val() !== "" && !regex.test(input.val())) {
							return el.triggerError(rule,'url');
						}
						else {
							return el.removeError(rule,'url');
						}

					}

					//password strength /form rule
					if(rule.password) {
						//not defined yet
						return true;
					}

					//password match rule
					if(rule.passwordmatch) {
						var field = el.id.split("_")[0];
						var field1 = $("input[name='" + field + "']");
						var field2 = $("input[name='" + field + "_repeat']");

						//find fields with password. This code expects that there is only one form active with one pair of passsword fields
						if((field1.val() !==  "" && field2.val() !== "") && field1.val() !== field2.val()) {
							return el.triggerError(rule,'passwordmatch');
						}
						else {
							return el.removeError(rule,'passwordmatch');
						}
					}

					//custom validation rule
					if(rule.custom) {
						//if value is empty, kick out of custom validation
						if(el.input.val() === "") {
							return true;
						}
						el.validated=false;//set validation to false
						el.toggleAjaxLoader();
						//create datapackage
						var data = {};
						data[el.name]=el.input.val();
						data["apiurl"]=rule.custom.apiurl;
						if(rule.custom.apimethod) {
							data["apimethod"]=rule.custom.apimethod;
						}
						//post
						$.ajax({
							type:'post',
							url: rule.custom.url,
							data : data,
							dataType:'json',
							async: true,
							success: function(data){
								el.toggleAjaxLoader();
								if(data.status === "ERROR") {
									rule.custom.text=data.text;
									return el.triggerError(rule,'custom');
								}
								else {
									return el.removeError(rule,'custom');
								}
							},
							error : function(a,b,c){
								el.toggleAjaxLoader();
								rule.custom.text="Something went wrong";
								return el.triggerError(rule,'custom');
							}
						});
						return false; // not sure this one is necessary
					}
				});
				return true;
			}
			else {
				return false;
			}
		}
	};

	/**
	 * Trigger error function. Uses the 'error' class to search for an existing error message.
	 * If it exists, text will be updated. Otherwise error message will slidedown
	 **/
	this.triggerError = function (rule,key) {
		if(rule[key])
		{
			this.validated=false;//set formelement to not validated
			//flag error
			rule[key].error = true;
			if(this.formfield.find("." + this.errorClass).length === 0) {
				//create error div
				var errorfield=$("<div class=\"" + this.errorClass + " " + (this.addedErrorClass ? this.addedErrorClass:"") +  "\" style=\"display: none;\">" + rule[key].text + "</div>");
				this.formfield.append(errorfield);
				//show error
				this.formfield.addClass("hasError");
				errorfield.slideDown('fast');

			}
			else {
				//error already displayed. Update error message
				this.formfield.find("." + this.errorClass).text(rule[key].text);
			}
			return false;
		}
		else {
			alert("validation key \'" + key + "\' does not exist in formfield definition for the element \'" + this.id +  "\'");
		}

	};

	/**
	 * Remove error function.
	 **/
	this.removeError = function (rule, key) {
		//unmark error
		if(rule[key])
		{
			//unflag error
			if(rule[key].error) {
				rule[key].error = false;
			}
			this.validated=true;//set formelement to validated
			this.formfield.removeClass("hasError");

			var el = this.formfield.find("." + this.errorClass);
			el.slideUp('fast',function(){
				el.remove();
			});
			return true;
		}
		else {
			alert("validation key \'" + key + "\' does not exist in formfield definition for the element \'" + this.id +  "\'");
		}
	};

	//* !!!! this function need also to reset the error boolean
	this.reset = function () {
		var $this=$(this);
		$this.parent().find(".error").remove();
		$this.val("");
	};

	this.toggleAjaxLoader = function () {
		//add wrapper for positioning
		if(!this.ajaxloader) {
			var wrapper = $(this.input).wrap("<div class=\"ajaxwrapper\"></div>").after("<div class=\"ajaxloader\"></div>");
			this.ajaxloader = true;
		}
		else {

			$(this.input).unwrap().next().remove();
			this.ajaxloader = false;
		}
	};
};



/*==============================================================================================
										FORM ELEMENT CLASS
===============================================================================================*/

var Element = function (_formfield) {
	var that = this;
	this.formfield = _formfield;
	this.name = "";
	this.type = "";
	this.input = null;
	this.errorClass = "";
	this.validated = null;//initital state. This means that fields has not been validated yet


	this.init = function() {
		this.input = $(this.formfield.find(":input"));
		this.name = this.input.attr("name");
		this.type = this.input.prop("tagName").toLowerCase();
		var val = {
			validation: this.formfield.data("validation")
		};
		//if formelement requires validation
		if(this.formfield.data("validation")) {
			$.extend(this,val);
			this.input.bind("change",this,this.validate);
		}
		//no validation, set to validated
		else {
			this.validated=true;
		}


		/*Correct IE specific issues that can not be done with css only*/
		if($("html").hasClass("lt-ie8")) {
			//Select needs to have padding-right removed to be inline with other fields
			if(this.type === "select") {
				this.formfield.addClass("ie8-padding-correction");
			}
		}

		return this;
	};
};

Element.prototype = new Validator();




/*==============================================================================================
										LOCATION EXTENTSION PLUGIN
							creates autocomplete using googlemaps api
							Author: mattijs spierings
							date: 24/4/2013

							WORK IN PROGRESS.
							End Requirements of plugin have not been set
===============================================================================================*/
(function($){
	var elements = {};
	var methods = {

		init : function (options){

 			return this.each(function(){

 				var $this = $(this);
 				elements[$this.attr("name")] = $this;
 				var that = this; //lock reference to input
 				this.options = {};//local collection of plugin options
 				var markersArray = []; //local collection of overlay (markers, circles etc)
				var geocoder = new google.maps.Geocoder();

 				//any arguments for this plugin should be placed in this attribute
 				if($this.data("type-arguments")) {
 					$.extend(this.options,$this.data("type-arguments"));
				}
 				//set emptyClass if not provided.
 				if(!this.options.emptyClass) {
 					this.options.emptyClass="empty";
 				}
 				//set map metadata
				var mapId="mapCanvas" + $this.attr("name");
				var mapDimensions = "width:100%;height:250px;";

				//set maps dimensions
				if(this.options["mapDimensions"]) {
					mapDimensions=this.options["mapDimensions"];
				}
				$this.after("<div id=\"" + mapId + "\" class=\"map jqHidden\" style=\"" + mapDimensions + "\"></div>");


				if(this.options["showMap"]) {
					//set handler to show map on focus
					$this.focus(function(){
	 					$("#" + mapId).fadeIn('fast', function(){
		 					google.maps.event.trigger(map,'resize');
		 					map.setCenter(new google.maps.LatLng(-33.8688, 151.2195));
	 					});
	 				});
 				}

				//set map init options
				var mapOptions = {
					center: new google.maps.LatLng(-33.8688, 151.2195),
					zoom: 13,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};

				//create google map
				var map = new google.maps.Map(document.getElementById(mapId),
					mapOptions);

				var input = $this[0];
				var options = {};
				if(this.options["filter"]) {
					options["types"]= ['(' + this.options["filter"] + ')'];
				}
				var autoComplete = new google.maps.places.Autocomplete(input, options);
				autoComplete.bindTo('bounds', map);

				//set listner to clear markers on new input in autocomplete. This will enforce that only 1 location can be selected
				$this.bind("click", deleteOverlays);

				google.maps.event.addListener(autoComplete, 'place_changed', function() {
					var place = autoComplete.getPlace();

					//bidx way of storing the locationdata, only is NOT listing of results is required. When IS required, setLocationData will be called from listing codeblock below
					if(!that.options["listResults"]) {
						if(!place.address_components) {
							return true;
							//THIS NEEDS TO BE REPLACE BY SELECTING THE FIRST SUGGESTION FROM AUTCOMPLETE (example: http://jsfiddle.net/Ut2U4/1/  OR use autocompleteprediction service https://developers.google.com/maps/documentation/javascript/reference#AutocompleteService)
						}
						methods.setLocationData($this, place);
					}

					if(that.options["setMarkers"]) {
						var marker = new google.maps.Marker({
							map: map,
							draggable: true
						});
						markersArray.push(marker);
						marker.setVisible(false);
						input.className = '';

						if (!place.geometry) {
							// Inform the user that the place was not found and return.
							input.className = 'notfound';
							return false;
						}

						// If the place has a geometry, then present it on a map.
						if (place.geometry.viewport) {
							map.fitBounds(place.geometry.viewport);
						} else {
							map.setCenter(place.geometry.location);
							map.setZoom(17);  // Why 17? Because it looks good.
						}

						var image = {
							url: place.icon,
							size: new google.maps.Size(71, 71),
							origin: new google.maps.Point(0, 0),
							anchor: new google.maps.Point(17, 34),
							scaledSize: new google.maps.Size(35, 35)
						};
						marker.setIcon(image);
						marker.setPosition(place.geometry.location);
						marker.setVisible(true);



						//add circle around marker
						if(that.options["drawCircle"]) {



							// Add circle overlay and bind to marker
							var circle = new google.maps.Circle({
							  	map: map,
							  	radius: 1693,    // 10 miles in metres
							  	fillColor: '#69E853',
							  	editable:true,
							  	dragable:false,
							  	radius_changed: function(){
							  		methods.createHiddenField($this, "reach", (this.getRadius())/1000);
							  	}

							});

							circle.bindTo('center', marker, 'position');
							//store circle so we can clear the overlay later
							markersArray.push(circle);

							//store radius of circle in hiddenfield
							methods.createHiddenField($this, "reach", (circle.getRadius())/1000);

							google.maps.event.addListener(marker, 'dragend', function() {
								var pos =marker.position;
								var latlng = new google.maps.LatLng(pos.lat(), pos.lng());
								geocoder.geocode({
									latLng:  latlng
								},
								function(responses) {

									if (responses && responses.length > 0) {
										$this.val(responses[0].formatted_address);
										//update locationdata
										methods.setLocationData($this, responses[0]);
									}
								});
								//add radius value to location data
								methods.createHiddenField($this, "reach", (circle.radius)/1000);

							});

						}
					}

					//enable Listing of results
					if(that.options["listResults"]) {
						//hack to empty textfield after blur (only happens when you type and then tab into results)
						$this.one("blur",function(){
							$this.val("");
						});

						/*if(!that.options["listId"]) {
							alert("Please define list id by adding \"list-id\":\"[listid]\" to data-type-arguments for field '" + $this.attr("name") + "'");
							return false;
						}*/

						//nothing has been selected in autocomplete, cancel request
						if(!place.address_components) {
							return true;
							//THIS NEEDS TO BE REPLACE BY SELECTING THE FIRST SUGGESTION FROM AUTCOMPLETE (example: http://jsfiddle.net/Ut2U4/1/  OR use autocompleteprediction service https://developers.google.com/maps/documentation/javascript/reference#AutocompleteService)
						}

						if(that.options["listId"]) {

							$list=$("#" + that.options["listId"]);


							if($list.find("." + that.options.emptyClass)) {
								$list.find("." + that.options.emptyClass).hide();
							}

							var $li=$("<li><div class=\"label\">" + place.formatted_address + "<span class=\"control icon-remove icon-white\"></div></li>");

							$li.find(".control.icon-remove").click(function(){
								$li.fadeOut('fast', function(){
									methods.removeLocationData($this, $li.index(), $list.find("li > div:not(." + that.options.emptyClass + ")").length);
									$li.remove();

									if($list.find("li > div:not(." + that.options.emptyClass + ")").length === 0) {
										$list.find("." + that.options.emptyClass).fadeIn('fast');
									}
								});



							});
							//add item to list
							$list.append($li);

							methods.setLocationData($this, place, ($list.find("li > div:not(." + that.options.emptyClass + ")").length -1));
						}
						//exterme hack to clear the autocomplete field after you mouse click in result
						setTimeout(function(){
							$this.val("");
						},10);

					}


				});//[]

				// Deletes all markers in the array by removing references to them
				function deleteOverlays() {

					if (markersArray) {
						for (i in markersArray) {
							//set map bounds to last location (othersize it defaults)
							map.setCenter(markersArray[i].position);
							markersArray[i].setMap(null);
						}
						markersArray.length = 0;
					}
				}
			});
		},

		/*this function is specifically for bidx Address. Always needs to be converted to format defined below*/
		setLocationData : function(input,location, index)	 {

			var addressMappings=[
				{bidx:"street",google:"route"},
				{bidx:"streetNumber",google:"street_number"},
				{bidx:"neighborhood",google:"sublocality"},
				{bidx:"cityTown",google:"locality"},
				{bidx:"country",google:"country"},
				{bidx:"postalCode",google:"postal_code"}
			];

			//loop through bidx address mappings and find google's equivelant. When found create hiddenfield with value
			addressMappings.forEach(function(mapping,i,col){
				//try to find google's address key for this element
				var found=false, addressValue="";
				location.address_components.forEach(function(address,x,obj) {
					if(methods.hasValue(mapping.google, address.types)) {
						found=true;
						addressValue = mapping.google === "country" ? address.short_name : address.long_name;
						return true;
					}
				});

				var fieldname=( typeof index !== "undefined" ? "["+index+"].":"") + mapping.bidx;
				found ? methods.createHiddenField(input, fieldname, addressValue) : methods.createHiddenField(input, fieldname, "");

			});
			//now add location (latlong)
			if(location.geometry) {
				methods.createHiddenField(input, ( typeof index !== "undefined" ? "["+index+"].":"") + "coordinates", location.geometry.location.toUrlValue());
			}

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

		//check for key in array
		hasValue : function(key, arr) {
			return arr.indexOf(key, 0)!= -1;
		},

		//create hiddenfield for bidX address storage
		createHiddenField : function(input, name, val) {
			var fieldname = input.attr("name") + "." + name;
			//check if hiddenfield already exists
			if(input.nextAll("[name='" + fieldname + "']").length === 0) {
				input.after("<input type=\"hidden\" name=\"" + fieldname + "\" value=\"" + val + "\">");
			}
			//if exists, update value
			else {
				input.nextAll("[name='" + fieldname + "']").val(val);
			}

		}

	}

	$.fn.location = function(method) {
		if(methods[method]) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}
		else if(typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
		else {
			$.error( 'Method ' +  method + ' does not exist on jQuery Form' );
		}
  	}
})(jQuery);



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



/*==============================================================================================
			HELPER CLASSES (add support for ECMA 5 script addition for older browsers)
===============================================================================================*/

if (!Array.prototype.every) {
	Array.prototype.every = function(fun /*, thisp */) {
		"use strict";
		if (this === null) {
			throw new TypeError();
		}

		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== "function") {
			throw new TypeError();
		}

		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in t && !fun.call(thisp, t[i], i, t)) {
				return false;
			}
		}
		return true;
	};
}

if ( !Array.prototype.forEach ) {
	Array.prototype.forEach = function forEach( callback, thisArg ) {
		var T, k;
		if ( this === null ) {
			throw new TypeError( "this is null or not defined" );
		}
		// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0; // Hack to convert O.length to a UInt32
		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if ( {}.toString.call(callback) !== "[object Function]" ) {
			throw new TypeError( callback + " is not a function" );
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if ( thisArg ) {
			T = thisArg;
		}

		// 6. Let k be 0
		k = 0;

		// 7. Repeat, while k < len
		while( k < len ) {

			var kValue;

			// a. Let Pk be ToString(k).
			//   This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
			//   This step can be combined with c
			// c. If kPresent is true, then
			if ( Object.prototype.hasOwnProperty.call(O, k) ) {

				// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
				kValue = O[ k ];

				// ii. Call the Call internal method of callback with T as the this value and
				// argument list containing kValue, k, and O.
				callback.call( T, kValue, k, O );
			}
			// d. Increase k by 1.
			k++;
		}
		// 8. return undefined
	};
}

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		"use strict";
		if (this === null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;
		if (len === 0) {
			return -1;
		}
		var n = 0;
		if (arguments.length > 1) {
			n = Number(arguments[1]);
			if (n !== n) { // shortcut for verifying if it's NaN
				n = 0;
			}
			else if (n !== 0 && n !== Infinity && n !== -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	};
}
