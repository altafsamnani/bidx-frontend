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
			if(this.prop("tagName").toLowerCase() != "form") {
				alert("Please use this form plugin on a form tag only")
				return false;
			}
			form = this;
			form.data.elements = {};//collection of form elements
			form.data.valid=false;
			//extend options
			if(options) 
				$.extend(globalOptions, options);

			//load form element extention
			$.ajax({
				async: false,
				type: "GET",
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
					if(form.data.valid)
						methods.submitForm();
				});	
				
				//
			}

			//enable plugins in the form elemtns that required those
			if(options.enablePlugins) {
				var i=0,plug=null;
				while(plug=options.enablePlugins[i++]) {
					switch(plug) {
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
								url: globalOptions.path + "location.js",
								dataType: 'script'
							});	
							//get all location elements and activate plugin
							this.find("[data-type=location]").location({});
							break;
						case "fileUpload" :
							$.ajax({
								async: false,
								type: "GET",
								url: globalOptions.path + "fileUpload.js",
								dataType: 'script'
							});
							//get all fileuploads in this form and activate plugin
							this.find("[data-type=fileUpload]").fileUpload({"parentForm":this});
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
				if(globalOptions.beforeSubmit)
					globalOptions.beforeSubmit();
				//xhr post
            
				$.ajax({
					type:'post',
					url: globalOptions.url,
					dataType:'json',
					data: $(form).serialize() + "&apiurl=" + globalOptions.apiurl +  "&apimethod=" + globalOptions.apimethod,
					async: true,
					success: function(data){
						if(data) {
							if(data.status == 'OK') {
								if(data.submit) {
                                    var dynamicdata = data.data;
                                    var dyninput=null;
                                    /* Parsing Bidx Variables and adding them as a hidden field to post to the new form*/
                                    jQuery.each(dynamicdata, function(apikey, val) {
                                        /* it doesnt pass name variable so rename it to gname and proceed */
                                       apikey = (apikey=='name') ? 'dynname': apikey;
                                       dyninput = '<input type="hidden" name="'+apikey+'" id="'+apikey+'" value="'+val+'" />';
                                       $(form).append(dyninput);                                                                           
                                    });

                                     $(form).attr('action', data.submit);
                                     $(form).attr('method', 'POST');
                                     $(form).submit();
								} 
								else if (data.redirect) {
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

