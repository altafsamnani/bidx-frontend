/*
	Author: Mattijs Spierings
	Description: Form validation plugin
	Date: 26/03/2013
*/

(function($) {
	
	
	var methods = {
		/*
			Init method
		*/
		init : function(options) {
			var that = this;
			this.data.elements = {};//collection of form elements

			//create form element objects of each formfield element in the object
			this.find(".formfield").each(function(){
				var el = new Element($(this)).init();
				//register form element
				el.errorClass= options.errorClass;
				that.data.elements[el.groupname]=el;
			});

			//set callToAction button
			if(options.callToAction) {
				var validated=true;
			  	//bind call to action button to click
				$(options.callToAction).click(function(){
					
					
					if(validated)
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
						console.log(this);
							this.find("[data-type=date]").datepicker({});
							break;
						case "slider" :
							break;
					}
				}
			}
			
		},
		getElements : function() {
			return this.data.elements;
		},
		getElement : function(el) {
			return this.data.elements[el];
		},
		submitForm : function() {
			console.log("do submit");

			//xhr post 

			//or

			//form submit


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

	
			
	/*

	function doValidate() {

	}

	function validate() {

	}

	function triggerError() {

	}

	function removeError() {

	}


*/

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
				if(validation.required && (input.val() == "" || el.type == "checkbox" && !input.is(":checked"))) {
					el.triggerError('required');
				}
				//if not required we need to test for valid format
				else {
					//check emailfield
					if(validation.email) {
						var s_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
						if (!s_regex.test(input.val())) {
							el.triggerError('email');
							return true;
						}
						else {
							el.removeError('email');
						}
					}
					//check numberfield
					if(validation.int) {
						if(isNaN(val()) || input.val() == 0) {
							el.triggerError('int');
							return true;						
						}
						else {
							el.removeError('int');
						}

					}
					//check datefield
					if(validation.date) {
						//no validation defined yet, because date uses the Required validator only. We can add specific validation later
						if(1==0) {
							el.triggerError('date');
							return true;
						}
						else {
							el.removeError('date');
						}
					}	

					//check numberfield
					if(validation.url) {
						//(([a-zA-Z0-9-])+.)
						// /(^https?:\/\/)+(([a-zA-Z0-9-]))[.]/;					
						//if(val().search("http://") == -1 && val().search("https://") == -1) {
						var s_regex = /^https?:\/\/[a-zA-Z0-9-]+[.][a-zA-Z0-9]{2,4}/;
						if (!s_regex.test(input.val())) {
							el.triggerError('url');
							return true;						
						}
						else {
							el.removeError('url');
						}

					}		

					//password match rule
					if(validation.passwordmatch) {
						var field = el.id.split("_")[0];
						var field1 = $("input[name='" + field + "']");
						var field2 = $("input[name='" + field + "_repeat']");
						
						//find fields with password. This code expects that there is only one form active with one pair of passsword fields
						if((field1.val() !=  "" && field2.val() != "") && field1.val() != field2.val()) {
							el.triggerError('passwordmatch');
							return true;
						}
						else
							el.removeError('passwordmatch');
					}

					//custom valiation rule
					if(validation.custom) {
						var result = true;
						$.ajax({
							type:'get',
							url: validation.custom.url,
							dataType:'json',
							async: true,
							success: function(data){
								if(data)
									result = data;
							},
							error : function(){

							}

						});

						if(!result) {
							el.triggerError('custom');
							return true;
						}
						else
							el.removeError('custom');
					}
				
					//remove error if none of the above checks are applicable
					el.removeError('required');
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
};



/*==============================================================================================
										FORM ELEMENT CLASS
===============================================================================================*/

var Element = function (_formfield) {
	var that = this;
	this.formfield = _formfield;
	this.groupname = "";
	this.type = "";
	this.input = null;
	this.errorClass = "";
	

	this.init = function() {
		this.input = $(this.formfield.find(":input"));
		this.groupname = this.input.attr("name");
		this.type = this.input.attr("type");
		if(this.formfield.data("validation")) {
			$.extend(this,val = {
					validation: this.formfield.data("validation")
			});
		}
				
		this.input.bind("change",this,this.validate);
		
		return this;
	}
}
Element.prototype = new Validator();