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
	var form = null;
	var methods = {
		/*
			Init method
		*/
		init : function(options) {
			if(this.prop("tagName").toLowerCase() !== "form") {
				alert("Please use this form plugin on a form tag only");
				return false;
			}

			form = this;
			form.data.elements = {};//collection of form elements
			form.data.valid=false;
			//extend options
			if(options) {
				$.extend(globalOptions, options);
			}
			//load form element extention
			$.ajax({
				async: false,
				type: "GET",
				cache: false,
				url: globalOptions.path + "form-element.js",
				dataType: 'script'
			});
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

					if(form.data.valid) {
						methods.submitForm();
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
							this.find("[data-type=date]").datepicker({});
							break;
						case "slider" :

							break;
						case "location" :
							$.ajax({
								async: false,
								type: "GET",
								cache: false,
								url: globalOptions.path + "location.js",
								dataType: 'script'
							});
							//get all location elements and activate plugin
							this.find("[data-type=location]").location({});
							break;
						case "countryAutocomplete" :
							$.ajax({
								async: false,
								type: "GET",
								cache: false,
								url: globalOptions.path + "country-autocomplete.js",
								dataType: 'script'
							});
							//get all location elements and activate plugin
							this.find("[data-type=countryAutocomplete]").countryAutocomplete({});
							break;
						case "fileUpload" :
							$.ajax({
								async: false,
								type: "GET",
								cache: false,
								url: globalOptions.path + "fileUpload.js",
								dataType: 'script'
							});
							//get all fileuploads in this form and activate plugin
							this.find("[data-type=fileUpload]").fileUpload({"parentForm":this});
							break;
						default:
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
		getForm : function(){
			return form;
		},
		submitForm : function() {

			if(globalOptions.url) {
				if(globalOptions.beforeSubmit) {
					globalOptions.beforeSubmit();
				}
				//xhr post

				$.ajax({
					type:'post',
					url: globalOptions.url,
					dataType:'json',
					data: $(form).find(":input:not(.ignore)").serialize() + "&apiurl=" + globalOptions.apiurl +  "&apimethod=" + globalOptions.apimethod,
					async: true})
					.always(function(data){
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
											$(form).append(dyninput);
										});
									}
									$(form).attr('action', data.submit);
									$(form).attr('method', 'POST');
									$(form).submit();
								}
								else if (data.redirect) {
									document.location=data.redirect;
								}
							}
							else {
								//if error handler is defined, use this one
								if(globalOptions.error) {
									globalOptions.error(data);
								}
								//otherwise show general error message in form
								else {
									var message="Something went wrong";
									if(data.text) {
										message=data.text;
									}
									//add separate error message under button
									var $button=$(globalOptions.callToAction);
									if($(".error_separate").length === 0) {
										var $error=$("<div class=\"error_separate jqHidden\">" + message + "</div>");
										$button.parent().after($error);
										$error.fadeIn('fast');
									}
									else {
										//error box already there, replace text
										$(".error_separate").text(message);
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
			else if(form.attr("action")){
				form.submit();
			}
			else {
				alert("no url or form action defined");
			}
		},
		validateForm : function(){
			//now check if there are errors per field
			var field=null, result = true;
			for(field in form.data.elements) {
				if(!form.data.elements[field].validated) {
					//if(this.formfield.data("validation")) {
					//if value is NULL field has not been validated yet
					if(form.data.elements[field].validated === null) {
						form.data.elements[field].validate({data:form.data.elements[field]});
						result = result && form.data.elements[field].validated;
					}
					else {
						result = result && form.data.elements[field].validated;
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