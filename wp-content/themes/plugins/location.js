
/*==============================================================================================
										LOCATION EXTENTSION PLUGIN
							creates autocomplete using googlemaps api
===============================================================================================*/
(function($){

	var methods = {

		init : function (options){

 			return this.each(function(){
 				
 				var $this = $(this);
 				var that = this; //lock reference to input
 				this.options = {};//local collection of plugin options

 				//any arguments for this plugin should be placed in this attribute
 				if($this.data("type-arguments")) 
 					$.extend(this.options,$this.data("type-arguments"));

				var mapId="map-canvas-" + $this.attr("name");
				var mapDimensions = "width:100%;height:250px;";

				//set maps dimensions
				if(this.options["map-dimensions"])
					mapDimensions=this.options["map-dimensions"];
				$this.after("<div id=\"" + mapId + "\" class=\"map jqHidden\" style=\"" + mapDimensions + "\"></div>");
				
				
				if(!this.options["showMap"]) {
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
				var options = {}
				if(this.options["filter"])
					options["types"]= ['(' + this.options["filter"] + ')'];
				
				this.autoComplete = new google.maps.places.Autocomplete(input, options);
				
				this.autoComplete.bindTo('bounds', map);

				var marker = new google.maps.Marker({
					map: map
				});
				
				//enable marker drawing
				if(this.options["set-markers"]) {
					google.maps.event.addListener(this.autoComplete, 'place_changed', function() {
						marker.setVisible(false);
						input.className = '';

						var place = that.autoComplete.getPlace();

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
						//add circle around marker
						if(that.options["draw-circle"]) {
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
						}
					});[]
				}
				
				//enable Listing of results
				if(this.options["list-results"]) {
					
					if(!this.options["list-id"]) {
						alert("Please define list id by adding \"list-id\":\"[listid]\" to data-type-arguments for field '" + $this.attr("name") + "'");
						return false;
					}

					google.maps.event.addListener(this.autoComplete, 'place_changed', function() {
						$list=$("#" + that.options["list-id"]);
						
						var place = that.autoComplete.getPlace();
						
						if($list.find(".empty"))
							$list.find(".empty").hide();
						
						var $li=$("<li><div class=\"label\">" + place.formatted_address + "<span class=\"control icon-remove icon-white\"></div></li>");
						
						$li.find(".control.icon-remove").click(function(){
							$li.fadeOut('fast', function(){
								$li.remove();
								
								if($list.find("li > div:not(.empty)").length == 0)
									$list.find(".empty").fadeIn('fast');
							});
							
						});
						//add item to list
						$list.append($li);
						
					});[]
				
				}
			});
		},

		/*this function is specifically for Address. I think it shouldnt be part of generic plugin because it is not yet defined to be genericly used*/
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
