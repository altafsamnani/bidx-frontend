
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
							  		methods.createHiddenField($this, "focusReach", (this.getRadius())/1000);
							  	}

							});

							circle.bindTo('center', marker, 'position');
							//store circle so we can clear the overlay later
							markersArray.push(circle);

							//store radius of circle in hiddenfield
							methods.createHiddenField($this, "focusReach", (circle.getRadius())/1000);

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
								methods.createHiddenField($this, "focusReach", (circle.radius)/1000);
								
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
						addressValue=address.long_name;
						return true;
					}
				});
				var fieldname=(index!="undefined" ? "["+index+"].":"") + mapping.bidx;
				found ? methods.createHiddenField(input, fieldname, addressValue) : methods.createHiddenField(input, fieldname, "");
				
			});
			//now add location (latlong)
			if(location.geometry) {
				methods.createHiddenField(input, (index != "undefined" ? "["+index+"].":"") + "location", location.geometry.location.toUrlValue());
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
			var fieldname = input.attr("name") + name;
			//check if hiddenfield already exists
			if(input.nextAll("[name='" + fieldname + "']").length === 0) {
				input.after("<input type=\"hidden\" name=\"" + input.attr("name") + name + "\" value=\"" + val + "\">");
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
