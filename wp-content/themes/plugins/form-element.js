
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
				if(input.val() == "" || (el.type == "checkbox" && !input.is(":checked"))) {
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
						if (el.input.val() != "" && !regex.test(el.input.val())) {
							return el.triggerError(rule,'email');
						}
						else {
							return el.removeError(rule,'email');
						}
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
		

		//if formelement requires validation
		if(this.formfield.data("validation")) {
			$.extend(this,val = {
					validation: this.formfield.data("validation")
			});
			this.input.bind("change",this,this.validate);
		}
		//no validation, set to validated
		else {
			this.validated=true;
		}


		/*Correct IE specific issues that can not be done with css only*/
		if($("html").hasClass("lt-ie8")) {
			//Select needs to have padding-right removed to be inline with other fields
			if(this.type == "select") {
				this.formfield.addClass("ie8-padding-correction");
			}
		}

		return this;
	}
}
Element.prototype = new Validator();

