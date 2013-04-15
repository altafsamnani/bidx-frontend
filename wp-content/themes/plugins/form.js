/*
	Author: Mattijs Spierings
	Description: Form validation plugin
	Date: 26/03/2013
*/

(function($) {
	
	var globalOptions = null;
	var form = null;
	var methods = {
		/*
			Init method
		*/
		init : function(options) {
			form = this;
			form.data.elements = {};//collection of form elements
			form.data.valid=false;
			globalOptions = options;
			//create form element objects of each formfield element in the object
			this.find(".formfield").each(function(){
				var el = new Element($(this)).init();
				//register form element
				el.errorClass= options.errorClass;
				form.data.elements[el.name]=el;
			});



			//set callToAction button
			if(options.callToAction) {
				
			  	//bind call to action button to click
				$(options.callToAction).click(function(e){
					e.preventDefault();
					form.data.valid=methods.validateForm();
					if(form.data.valid)
						methods.submitForm();
				});	
				
				//
			}

			//enable plugins on formelements
			if(options.enablePlugins) {
				var i=0,plug=null;
				while(plug=options.enablePlugins[i++]) {
					switch(plug) {
						case "date" :
							this.find("[data-type=date]").datepicker({});
							break;
						case "slider" :
							break;
						case "location" :
							this.find("[data-type=location]").location({});
							break;
					}
				}
			}

			
		},
		formValidated : function () {
			return form.data.valid;
		},
		getElements : function() {
			return form.data.elements;
		},
		getElement : function(el) {
			return form.data.elements[el];
		},
		submitForm : function() {
			
			
			if(globalOptions.url) {
				if(globalOptions.beforeSubmit)
					globalOptions.beforeSubmit();
				//xhr post 
				$.ajax({
					type:'post',
					url: globalOptions.url,
					dataType:'json',
					data: $(form).serialize() + "&apiurl=" + globalOptions.apiurl,
					async: true,
					success: function(data){
						if(data) {
							if(data.status == 'OK') {
								if(data.redirect) {
									document.location=data.redirect;
								}
							}
						}
					},
					error : function(){

					}

				});
			}
			else if(form.attr("action")){
				form.submit();
			}
			else alert("no url or form action defined");
		},
		validateForm : function(){
			//first trigger validation check on all fields
			//$(form).find(":input").trigger("change");
			//now check if there are errors per field
			var field=null;
			var result = true;
			for(field in form.data.elements) {

				for(key in form.data.elements[field].validation) {
					if(typeof form.data.elements[field].validation[key].error == "undefined")
						form.data.elements[field].validate({data:form.data.elements[field]});
					if(form.data.elements[field].validation[key].error) {
						result = false;
						break;
					}
				}
			}
			return result;
		}
	}


  $.fn.form = function(method) {
  	var that = this; //store reference to top object
  	var elements = {};

  	if(methods[method])
  		return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
  	else if(typeof method === 'object' || !method) {
  		return methods.init.apply(this, arguments);
  	}
  	else {
  		$.error( 'Method ' +  method + ' does not exist on jQuery Form' );
  	}

  };
})(jQuery);

/*==============================================================================================
										LOCATION PLUGIN
										creates autocomplete and using googlemaps api
===============================================================================================*/
(function($){

	var globalOptions = null;
	var methods = {

		init : function (options){

 			return this.each(function(){
 				var $this = $(this);

				var mapId="map-canvas-" + $this.attr("name");
				var mapDimensions = "width:100%;height:250px;";
				//set maps dimensions
				if($this.data("map-dimensions"))
					mapDimensions=$this.data("map-dimensions");
				$this.after("<div id=\"" + mapId + "\" class=\"location-map jqHidden\" style=\"" + mapDimensions + "\"></div>");
				//send handler to show map on focus
				$this.focus(function(){
 					$("#" + mapId).fadeIn('fast', function(){
				
	 					google.maps.event.trigger(map,'resize');
	 					map.setCenter(new google.maps.LatLng(-33.8688, 151.2195));

 					});

 				});
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
				var autocomplete = new google.maps.places.Autocomplete(input, options);
				var options = {
					types: ['(cities)']
				};

				autocomplete.bindTo('bounds', map);

				var marker = new google.maps.Marker({
					map: map
				});
				
				google.maps.event.addListener(autocomplete, 'place_changed', function() {
					marker.setVisible(false);
					input.className = '';

					var place = autocomplete.getPlace();
					//custom store of geo data for api !!!NEEDS TO ABSTRACT
					methods.setGeoData(place);

					if (!place.geometry) {
						// Inform the user that the place was not found and return.
						input.className = 'notfound';
						return;
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
				});[]
			});
		},

		setGeoData : function(location)	 {
			var i=0,el=null;
			while(el=location.address_components[i++]) {
				with(methods) {
				hasValue("route",el.types) ? $("[name='personalDetails.address[0].street']").val(el.long_name):null;
				hasValue("street_nunber",el.types) ? $("[name='personalDetails.address[0].streetNumber']").val(el.long_name):null;
				hasValue("sublocality",el.types) ? $("[name='personalDetails.address[0].neighborhood']").val(el.long_name):null;
				hasValue("locality",el.types) ? $("[name='personalDetails.address[0].cityTown']").val(el.long_name):null;
				hasValue("country",el.types) ? $("[name='personalDetails.address[0].country']").val(el.long_name):null;
				hasValue("postal_code",el.types) ? $("[name='personalDetails.address[0].postalCode']").val(el.long_name):null;
				}
				
			}

		},
		hasValue : function(key, arr) {
			return $.inArray(key,arr) == 0;	
		}
	}

	$.fn.location = function(method) {
		if(methods[method])
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		else if(typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
		else {
			$.error( 'Method ' +  method + ' does not exist on jQuery Form' );
		}
  	};
})(jQuery);


/*==============================================================================================
										VALIDATOR CLASS
===============================================================================================*/

var Validator = function () {
		
	this.validate = function (e) {
		var el = e.data;
		var input = $(this);
		
		if(el.validation) {
			with(el) {
				//required has highest priority so this will be tested first
				if(validation.required && (input.val() == "" || type == "checkbox" && !input.is(":checked"))) {
					triggerError('required');
				}
				//if not required we need to test for valid format
				else {

					//check emailfield
					if(validation.email) {
						var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
						if (!regex.test(input.val())) {
							triggerError('email');
							return true;
						}
						else {
							removeError('email');
						}
					}
					//check numberfield
					if(validation.int) {
						if(isNaN(val()) || input.val() == 0) {
							triggerError('int');
							return true;						
						}
						else {
							removeError('int');
						}

					}
					//check datefield
					if(validation.date) {
						//no validation defined yet, because date uses the Required validator only. We can add specific validation later
						if(1==0) {
							triggerError('date');
							return true;
						}
						else {
							removeError('date');
						}
					}	

					//check numberfield
					if(validation.url) {
						var regex = /^https?:\/\/[a-zA-Z0-9-]+[.][a-zA-Z0-9]{2,6}/;
						if (!regex.test(input.val())) {
							el.triggerError('url');
							return true;						
						}
						else {
							removeError('url');
						}

					}		

					//password match rule
					if(validation.passwordmatch) {
						var field = el.id.split("_")[0];
						var field1 = $("input[name='" + field + "']");
						var field2 = $("input[name='" + field + "_repeat']");
						
						//find fields with password. This code expects that there is only one form active with one pair of passsword fields
						if((field1.val() !=  "" && field2.val() != "") && field1.val() != field2.val()) {
							triggerError('passwordmatch');
							return true;
						}
						else
							removeError('passwordmatch');
					}

					//custom valiation rule
					if(validation.custom) {
						var result = true;
						toggleAjaxLoader();
						//create datapackage
						var data = {};
						data[el.name]=input.val();
						data["apiurl"]=validation.custom.apiurl;
						if(validation.custom.apimethod)
							data["apimethod"]=validation.custom.apimethod;
						//post
						$.ajax({
							type:'post',
							url: validation.custom.url,
							data : data,
							dataType:'json',
							async: true,
							success: function(data){
								//console.log(data)
								el.toggleAjaxLoader();
								if(data.status == "ERROR") {
									el.validation.custom.text=data.text;
									el.triggerError('custom');
								}
							},
							error : function(a,b,c){
								console.log(a);
							el.triggerError('custom');
							}

						});

						if(!result) {
							triggerError('custom');
							return true;
						}
						else
							removeError('custom');
					}
				
					//remove error if none of the above checks are applicable
					removeError('required');
				}

			}
		}

	};
	
	/**
	 * Trigger error function. Uses the 'error' class to search for an existing error message. 
	 * If it exists, text will be updated. Otherwise error message will slidedown
	 **/
	this.triggerError = function (key) {
		
		
		if(this.validation[key])
		{
			//mark error
			this.validation[key].error = true;
			if(this.formfield.find("." + this.errorClass).length == 0) {
				//create error div
				var errorfield=$("<div class=\"" + this.errorClass + " " + (this.addedErrorClass ? this.addedErrorClass:"") +  "\" style=\"display: none;\">" + this.validation[key].text + "</div>");
				this.formfield.append(errorfield);
				//show error
				
				this.formfield.switchClass("formfield","formfield-error", 'fast');
				errorfield.slideDown('fast');
			}
			else {
				//error already displayed. Update error message
				this.formfield.find("." + this.errorClass).text(this.validation[key].text);
			}
		}
		else alert("validation key \'" + key + "\' does not exist in formfield definition for the element \'" + this.id +  "\'");
		
	};
	
	/**
	 * Remove error function. 
	 **/
	this.removeError = function (key) {
		//unmark error
		if(this.validation[key])
		{

			if(this.validation[key].error)
				this.validation[key].error = false;

			this.formfield.removeClass("hasError");	
			this.formfield.switchClass("formfield-error","formfield", 'fast');
			var el = this.formfield.find("." + this.errorClass);
			
			el.slideUp('fast',function(){
				el.remove();
			});
		}
		else alert("validation key \'" + key + "\' does not exist in formfield definition for the element \'" + this.id +  "\'");
	}
	
	//* !!!! this function need also to reset the error boolean
	this.reset = function () {
		with($(this)) {
			parent().find(".error").remove();
			val("");
		}					
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
	}
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
	

	this.init = function() {
		this.input = $(this.formfield.find(":input"));
		this.name = this.input.attr("name");
		this.type = this.input.prop("tagName").toLowerCase();
		
		if(this.formfield.data("validation")) {
			$.extend(this,val = {
					validation: this.formfield.data("validation")
			});
		}
		this.input.bind("change",this,this.validate);
	
		/*Correct IE specific issues that can not be done with css only*/
		if($("html").hasClass("lt-ie8")) {
			//Select needs to have padding-right removed to be inline with other fields
			if(this.type == "select")
				this.formfield.addClass("ie8-padding-correction");
		}

		return this;
	}
}
Element.prototype = new Validator();

