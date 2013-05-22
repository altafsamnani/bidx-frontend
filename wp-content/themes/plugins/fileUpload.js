
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

	var opts;

	var methods = {

		init : function (options){

			return this.each(function(){

				var $this = $(this);
				var that = this; //lock reference to input
				this.options = {};//local collection of plugin options
				opts = $.extend(this.options, options);
				$this.bind("change", methods.uploadFile);
				//any arguments for this plugin should be placed in this attribute
				if($this.data("type-arguments")) {
					$.extend(this.options,$this.data("type-arguments"));
				}
			});
		},
		uploadFile : function(){
			var $this=$(this);
			//set spinner
			methods.toggleAjaxLoader($this);

			//check if XHR FormData is supported
			if(window.FormData !== undefined) {
				var formData = new FormData();
				formData.append($this.attr("name"),this.files[0]);
				if(this.options.addFields) {
					var i=0,it=null;
					while(it=this.options.addFields[i++]) {
						formData.append(it,$("[name=" + it + "]").val());
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
					var i=0,it=null, temp=null;
					while(it=this.options.addFields[i++]) {
						temp = document.createElement("input");
						temp.name = it;
						temp.type="hidden";
						temp.value = $("[name=" + it + "]").val();
						$form.append(temp);
					}
					//add hidenfield so that application layer add padding to json result
					temp = document.createElement("input");
					temp.name = "jsonp";
					temp.type="hidden";
					temp.value = 1;
					$form.append(temp);
				}

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

			if(result.status === "OK") {
				switch(result.data.mimeType.split("/")[0]) {
					case "image":
						if ( opts.imageContainer ) {
							methods.toggleAjaxLoader(result.el);
							$( opts.imageContainer ).html( "<img src=\"" + result.data.document +  "\" >" );
						}
						else {
							result.el.parent().html("<img src=\"" + result.data.document +  "\" >");
						}

						break;
					default :
						alert("no content type returned from server");
						break;
				}
			}
			else if(result.status === "ERROR" || result.status === "success") { //status succes is triggered when handler has not been called correctly
				methods.toggleAjaxLoader(result.el);
				alert("Image upload failed");
			}

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
