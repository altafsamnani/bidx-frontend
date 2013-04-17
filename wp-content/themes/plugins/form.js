/*
	Author: Mattijs Spierings
	Description: Form validation plugin
	Date: 26/03/2013

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
			//now check if there are errors per field
			var field=null, result = true;
			for(field in form.data.elements) {
				if(!form.data.elements[field].validated) {
					//if value is NULL field has not been validated yet
					if(form.data.elements[field].validated == null) {
						form.data.elements[field].validate({data:form.data.elements[field]});
						result = result && form.data.elements[field].validated
					}
					else
						result = result && form.data.elements[field].validated
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

					// Add circle overlay and bind to marker
					var circle = new google.maps.Circle({
					  map: map,
					  radius: 1693,    // 10 miles in metres
					  fillColor: '#69E853',
					    editable:true,
					  center_changed: function(){
					  	console.log(this.getCenter());
					  }
					});
					circle.bindTo('center', marker, 'position');
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
										VALIDATOR OBJECT
===============================================================================================*/

var Validator = function () {
		
	this.validate = function (e) {
		var el = e.data;
		var input = $(this);

		el.validated=false;

		if(el.validation) {
			with(el) {
				//required has highest priority so this will be tested first
				if(validation.required) {
					//chcek if value is empty
					if(input.val() == "" || (type == "checkbox" && !input.is(":checked"))) {
						var rule = validation.required;
						triggerError({"required":rule},'required');
					}
					// not empty 
					else {
						//there is no typecheck
						if(!doTypeCheck()) {
							//if there was a required error, remove it
							if(validation.required.error) {
								var rule = validation.required;
								removeError({"required":rule},'required');
							}
							//else set element as validated
							else
								el.validated=true;
						}
					}
				}
				//not required
				else {
					doTypeCheck();
				}
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
						if (el.input.val() != "" && !regex.test(el.input.val())) 
							return el.triggerError(rule,'email');
						else 
							return el.removeError(rule,'email');
					}

					//check numberfield
					if(rule.int) {
						if(el.input.val() != "" && (isNaN(el.input.val()) || el.input.val() == 0)) {
							return el.triggerError(rule,'int');
						}
						else {
							return el.removeError(rule,'int');
						}

					}

					//check datefield
					if(rule.date) {
						//no validation defined yet, because date uses the Required validator only. We can add specific validation later
						if(1==0) {
							return el.triggerError(rule,'date');
						}
						else {
							return el.removeError(rule,'date');
						}
					}	

					//check numberfield
					if(rule.url) {
						var regex = /^https?:\/\/[a-zA-Z0-9-]+[.][a-zA-Z0-9]{2,6}/;
						if (el.input.val() != "" && !regex.test(input.val())) {
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
						if((field1.val() !=  "" && field2.val() != "") && field1.val() != field2.val()) {
							return el.triggerError(rule,'passwordmatch');
						}
						else
							return el.removeError(rule,'passwordmatch');
					}					

					//custom validation rule
					if(rule.custom) {
						//if value is empty, kick out of custom validation
						if(el.input.val() == "")
							return true;
						el.validated=false;//set validation to false
						el.toggleAjaxLoader();
						//create datapackage
						var data = {};
						data[el.name]=el.input.val();
						data["apiurl"]=rule.custom.apiurl;
						if(rule.custom.apimethod)
							data["apimethod"]=rule.custom.apimethod;
						//post
						$.ajax({
							type:'post',
							url: rule.custom.url,
							data : data,
							dataType:'json',
							async: true,
							success: function(data){
								el.toggleAjaxLoader();
								if(data.status == "ERROR") {
									rule.custom.text=data.text;
									return el.triggerError(rule,'custom');
								}
								else
									return el.removeError(rule,'custom');
							},
							error : function(a,b,c){
								return el.triggerError(rule,'custom');
							}
						});
						return false; // not sure this one is necessary
					}
				});
				return true;
			}
			else 
				return false;
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
			if(this.formfield.find("." + this.errorClass).length == 0) {
				//create error div
				var errorfield=$("<div class=\"" + this.errorClass + " " + (this.addedErrorClass ? this.addedErrorClass:"") +  "\" style=\"display: none;\">" + rule[key].text + "</div>");
				this.formfield.append(errorfield);
				//show error
				
				this.formfield.switchClass("formfield","formfield-error", 'fast');
				errorfield.slideDown('fast');

			}
			else {
				//error already displayed. Update error message
				this.formfield.find("." + this.errorClass).text(rule[key].text);
			}
			return false;
		}
		else alert("validation key \'" + key + "\' does not exist in formfield definition for the element \'" + this.id +  "\'");
		
	};
	
	/**
	 * Remove error function. 
	 **/
	this.removeError = function (rule, key) {
		//unmark error
		if(rule[key])
		{
			
			//unflag error
			if(rule[key].error)
				rule[key].error = false;
			this.validated=true;//set formelement to validated
			this.formfield.removeClass("hasError");	
			this.formfield.switchClass("formfield-error","formfield", 'fast');
			var el = this.formfield.find("." + this.errorClass);
			
			el.slideUp('fast',function(){
				el.remove();
			});
			return true;
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
	this.validated = null;//initital state. This means that fields has not been validated yet
	

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

/*==============================================================================================
										HELPER CLASSES
===============================================================================================*/

if (!Array.prototype.every)
{
  Array.prototype.every = function(fun /*, thisp */)
  {
    "use strict";
 
    if (this == null)
      throw new TypeError();
 
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();
 
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t && !fun.call(thisp, t[i], i, t))
        return false;
    }
 
    return true;
  };
}