
/*==============================================================================================
										FILEUPLOAD EXTENTSION PLUGIN
											uses xhr or iframe post
===============================================================================================*/
(function($){

	var methods = {

		init : function (options){

 			return this.each(function(){
 				
 				var $this = $(this);
 				var that = this; //lock reference to input
 				this.options = {};//local collection of plugin options

 				$this.bind("change", methods.uploadFile);
 				//any arguments for this plugin should be placed in this attribute
 				if($this.data("type-arguments")) {
 					$.extend(this.options,$this.data("type-arguments"));
 				}

				
				
			});
		},
		uploadFile : function(){
			var $this=$(this);
			console.log(this.options);
			var formData = new FormData();
			formData.append($this.attr("name"),this.files[0]);
			if(this.options.addFields) {
				var i=0,it=null;
				while(it=this.options.addFields[i++]) {
					formData.append(it,$("[name=" + it + "]").val());
				}
			}
			//formData.append("data",)
			jQuery.ajax('/wp-content/themes/functions/test.php', {
				type:"post",
			    processData: false,
			    contentType: false,
			    data: formData
			});
		}
	}

	$.fn.fileUpload = function(method) {
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
