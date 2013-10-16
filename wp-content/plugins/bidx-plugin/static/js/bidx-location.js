/**
 * @description Reusable location lugin
 *
 * @namespace
 * @name bidx.bidx_location
 * @version 1.0
 * @depends google maps, google places, google places autocomplete, jquery, jquery ui
 * @author
*/
;(function( $ )
{
        // mapping between bidx => google
        //
    var addressMappings =
        {
            b2g:
            {
                // bidx                 google
                //
                "street":               "route"
            ,   "streetNumber":         "street_number"
            ,   "neighborhood":         "sublocality"
            ,   "cityTown":             "locality"
            ,   "country":              "country"
            ,   "postalCode":           "postal_code"
            }
                // Will be generated below
                //
        ,   g2b:            {}
        }
    ;

        // Convert B => G mapping into a G => B as well
        //
    $.each( addressMappings.b2g, function( b, g )
    {
        addressMappings.g2b[ g ] = b;
    } );

    /*
        Function: bidx.bidx_location

        Returns:
            None
    */
    $.widget( "bidx.bidx_location",
    {
        options: {
            widgetClass:            "bidx-location"
        ,   name:                   "bidx_location"
        ,   emptyClass:             "empty"
        ,   listId:                 null

        ,   defaultZoom:            12

        ,   showMap:                true
        ,   initiallyShowMap:       false

        ,   setMarkers:             true
        ,   drawCircle:             false
        ,   showReach:              true
        ,   readOnly:               false

        ,   initialCenter:
            {
                lat:                    -33.8688
            ,   lon:                    151.2195
            }

        ,   dimensions:
            {
                width:                  "100%"
            ,   height:                 "250px"
            }

        ,   mapOptions:
            {
                center:                 new google.maps.LatLng( -33.8688, 151.2195 )
            ,   zoom:                   13
            ,   mapTypeId:              google.maps.MapTypeId.ROADMAP
            }

        ,   autoCompleteOptions:
            {

            }

        ,   state:
            {
                markersArray:           null
            ,   id:                     null

            ,   geocoder:               null
            ,   map:                    null
            ,   autoComplete:           null

            ,   locationData:           null
            }

        ,   reachChanged:          function( reach ) {}
        }

    ,   _create: function( params )
        {
            var widget  = this
            ,   $el     = widget.element
            ;

            // BIDX-1372 - Suppress submitting the form when the enter is pressed to select an item from the auto complete list
            //
            $el.keydown( function( e )
            {
                if ( e.which === 13 )
                {
                    e.preventDefault();
                    e.stopPropagation();
                }
            } );

            widget.options  = $.extend( widget.options, params );
            var options     = widget.options;
            var state       = options.state;

            $el.addClass( options.widgetClass );

            state.id            = widget._generateId();

            state.markersArray  = []; //local collection of overlay (markers, circles etc)
            state.geocoder      = new google.maps.Geocoder();
            state.locationData  = {};

            state.$map          = $( "<div />",
            {
                "id":               "map-" + state.id
            ,   "class":            "map"
            ,   "style":            "width:" + options.dimensions.width + ";height:" + options.dimensions.height
            } ).hide();

            $el.after( state.$map );

            state.map           = new google.maps.Map( state.$map[0], options.mapOptions );
            state.autoComplete  = new google.maps.places.Autocomplete( $el[0], options.autoCompleteOptions );

            state.autoComplete.bindTo( "bounds", state.map );

            google.maps.event.addListener( state.map, "zoom_changed"
            ,   function()
                {
                    bidx.utils.log( "zoom_changed", state.map.getZoom() ) ;
                }
            );

            google.maps.event.addListener(
                state.autoComplete
            ,   "place_changed"
            ,   function()
                {
                    var place = state.autoComplete.getPlace();

                    widget._placeChanged( place );
                }
            );

            // Inject a reach indicator in the DOM?
            //
            if ( options.drawCircle && options.showReach )
            {
                state.$reach = $( "<p />",
                {
                    "id":           "reach-" + state.id
                ,   "class":        "reach"
                } ).hide();

                $el.after( state.$reach );
            }

            if ( options.initiallyShowMap )
            {
                widget.showMap();
            }
        }

        // Get the current location data
        //
    ,   getLocationData:    function()
        {
            var widget      = this
            ,   options     = widget.options
            ,   state       = options.state
            ;

            return state.locationData;
        }

        // Set the location data and update the map
        //
    ,   setLocationData:    function( location )
        {
            var widget      = this
            ,   options     = widget.options
            ;

            widget._updateLocationData( location );
            widget.showMap();
        }

    ,   _drawLocationData: function()
        {
            var widget          = this
            ,   options         = widget.options
            ,   state           = options.state
            ,   locationData    = state.locationData
            ,   center
            ,   arCoords
            ;

            widget._deleteOverlays();

            // Determine the center using the coordinates of the location
            //
            if ( locationData.coordinates )
            {
                arCoords = locationData.coordinates.split( "," );

                center = new google.maps.LatLng( arCoords[ 0 ], arCoords[ 1 ] );
                state.map.setCenter( center );

                if ( options.setMarkers )
                {
                    widget._drawMarker( center, locationData.reach );
                }
            }
            else
            {
                // No coordinates! Geocode it? Not really having a proper exit for this... :(
                //
                bidx.utils.error( "[bidx-location] _drawLocationData called for a location without coordinates", locationData );
            }
        }

    ,   showMap:    function( cb )
        {
            var widget      = this
            ,   $el         = widget.element
            ,   options     = widget.options
            ,   state       = options.state
            ;

            state.$map.fadeIn( "fast", function()
            {
                google.maps.event.trigger( state.map, "resize" );

                widget._drawLocationData();

                if ( state.$reach && state.$reach.length )
                {
                    state.$reach.show();
                }

                if ( cb )
                {
                    cb();
                }
            } );
        }

        /**
        in case 250px

        reach   = zoom
        15      = 10
        30      = 9
        60      = 8
        120     = 7
        240     = 6
        480     = 5
        960     = 4
        */
    ,   _getZoomForReach: function( reach )
        {
            var widget          = this
            ,   options         = widget.options
            ;

            function fn( x )
            {
                var result;

                if ( x <= 15 )
                {
                    result = 0;
                }
                else
                {
                    result = fn( Math.ceil( x / 2 ) ) + 1;
                }

                if ( result > 10 )
                {
                    result = 10;
                }

                return result;
            }

            return 10 - fn( reach );
        }

        // Update the internal administration of the set location
        //
    ,   _updateLocationData: function( data, merge )
        {
            var widget          = this
            ,   options         = widget.options
            ,   state           = options.state
            ,   locationData    = state.locationData || {}
            ,   oldReach        = locationData.reach
            ;

            if ( !data )
            {
                state.locationData = {};
            }
            else if ( merge )
            {
                $.extend( state.locationData, data );
            }
            else
            {
                state.locationData = data;

                if ( !state.locationData.reach && oldReach )
                {
                    state.locationData.reach = oldReach;
                }
            }

            // Did the reach change? Notify the outside world
            //
            if ( state.locationData.reach !== oldReach )
            {
                // Reach will change, to what level are we going to zoom?
                //
                options.reachChanged( state.locationData.reach );

                state.map.setZoom( widget._getZoomForReach( state.locationData.reach ));

                if ( options.showReach )
                {
                    if ( state.locationData.reach )
                    {
                        state.$reach.text( "Reach: " + state.locationData.reach.toFixed( 1 ) + " km from center" ).show();
                    }
                    else
                    {
                        state.$reach.hide();
                    }
                }
            }
        }

    ,   _placeChanged: function( place )
        {
            var widget      = this
            ,   $el         = widget.element
            ,   options     = widget.options
            ,   state       = options.state
            ,   location
            ,   circle
            ,   $list
            ,   $li
            ;

            // Reset stored location data
            //
            widget._deleteOverlays();
            widget._updateLocationData();
            $el.removeClass();

            if ( !place.geometry || !place.address_components)
            {
                // Inform the user that the place was not found and return.
                //
                $el.addClass( "notfound" );

                return;
            }

            // Parse the google geocode place into the bidX structure
            //
            location = _parseGooglePlaceIntoBidx( place );
            widget._updateLocationData( location );

            // If the place has a geometry, then present it on a map.
            //
            state.map.setCenter( place.geometry.location );
            state.map.setZoom( options.defaultZoom );

            // Should we list / show the results?
            //
            if ( options.listResults )
            {
                // hack to empty textfield after blur (only happens when you type and then tab into results)
                //
                $el.one( "blur", function()
                {
                    $el.val( "" );
                } );

                // Where should the list be rendered?
                //
                // @TODO: finish/fix this properly
                //
                if ( options.listId )
                {
                    $list = $( "#" + options.listId );

                    $list.find( "." + options.emptyClass ).hide();

                    $li = $( "<li />" );

                    $li
                        .append(
                            $( "<div />", { "class": "label" } )
                                .append( "<span />" ).text( place.formatted_address )
                                .append( $( "<span />", { "class": "control icon-remove icon-white" } ))
                        )
                    ;

                    $li.find( ".control.icon-remove" ).click( function()
                    {
                        $li.fadeOut( "fast", function()
                        {
                            // Commented out code in this block is done because it's use is unclear...
                            //
                            // methods.removeLocationData($this, $li.index(), $list.find("li > div:not(." + that.options.emptyClass + ")").length);

                            $li.remove();

                            // if($list.find("li > div:not(." + that.options.emptyClass + ")").length === 0) {
                            //     $list.find("." + that.options.emptyClass).fadeIn('fast');
                            // }
                        } );
                    } );

                    // Add item to list
                    //
                    $list.append( $li );
                }

                // Exterme hack to clear the autocomplete field after you mouse click in result
                //
                setTimeout( function()
                    {
                        $el.val( "" );
                    }
                ,   10
                );
            }

            if ( options.setMarkers )
            {
                widget._drawMarker( place.geometry.location );
            }

            if ( options.showMap )
            {
                widget.showMap();
            }
        }

    ,   _drawMarker: function( position, reach )
        {
            var widget      = this
            ,   $el         = widget.element
            ,   options     = widget.options
            ,   state       = options.state
            ,   marker
            ,   circle
            ,   image
            ;

            function _updateCenter( latLng )
            {
                state.geocoder.geocode(
                    {
                        latLng:  latLng
                    }
                ,   function( responses )
                    {
                        var location;

                        if ( responses && responses.length > 0 )
                        {
                            // Set the formatted address value in the input[type='text']
                            //
                            $el.val( responses[ 0 ].formatted_address );

                            // update locationdata
                            //
                            location = _parseGooglePlaceIntoBidx( responses[ 0 ] );

                            widget._updateLocationData( location );
                        }
                    }
                );
            }

            marker = new google.maps.Marker(
            {
                map:            state.map
            ,   draggable:      options.readOnly ? false : true
            } );

            state.markersArray.push( marker );
            marker.setVisible( false );

            marker.setPosition( position );
            marker.setVisible( true );

            // The circle as a whole can be dragged
            //
            google.maps.event.addListener( marker, "dragend", function()
            {
                var pos         = marker.position
                ,   latlng      = new google.maps.LatLng( pos.lat(), pos.lng() )
                ;

                _updateCenter( latlng );
            } );

            // If requested, add circle around marker
            //
            if ( options.drawCircle )
            {
                // Add circle overlay and bind to marker
                //
                circle = new google.maps.Circle(
                {
                    map:                state.map

                    // 10 miles in metres
                    //
                ,   radius:             reach * 1000 || 1693
                ,   fillColor:          "#69E853"
                ,   editable:           options.readOnly ? false : true
                ,   draggable:          false
                ,   radius_changed:     function()
                    {
                        var radius = this.getRadius() / 1000;

                        widget._updateLocationData( { reach: radius }, true );
                    }
                ,   center_changed:     function()
                    {
                        if ( !this.centerChanges )
                        {
                            this.centerChanges = 1;
                            return;
                        }

                        if ( this.updateCenterTimer )
                        {
                            clearTimeout( this.updateCenterTimer );
                        }

                        this.updateCenterTimer = setTimeout( function()
                        {
                            var latLng = circle.getCenter();

                            _updateCenter( latLng );
                        }, 500 );
                    }
                } );

                circle.bindTo( "center", marker, "position" );

                //store circle so we can clear the overlay later
                //
                state.markersArray.push( circle );

                // Store the reach using the circle radius,
                // might be changed in the radius_changed callback on the circle
                //
                widget._updateLocationData( { reach: circle.getRadius() / 1000 }, true );
            }
        }

    ,   _deleteOverlays: function()
        {
            var widget  = this
            ,   options = widget.options
            ,   state   = options.state
            ;

            $.each( state.markersArray, function( idx, marker )
            {
                // Set map bounds to last location (othersize it defaults)
                //
                state.map.setCenter( marker.position );
                marker.setMap( null );
             } );

            state.markersArray.length = 0;
        }

    ,   _generateId: function()
        {
            var widget  = this
            ,   options = widget.options
            ;

            return options.name + new Date().getTime() + "X" + Math.floor( Math.random() * 10000000 );
        }
    } );

    // Utility functions
    //
    function _parseGooglePlaceIntoBidx( place )
    {
        var result = {};

        if ( !place || !place.address_components )
        {
            return;
        }

        $.each( addressMappings.b2g, function( b, g )
        {
            var found = false;

            $.each( place.address_components, function( idx, component )
            {
                var value;

                if ( $.inArray( g, component.types ) !== -1 )
                {
                    found = true;

                    switch ( g )
                    {
                        case "country":
                            value = component.short_name;
                        break;

                        default:
                            value = component.long_name;
                    }

                    result[ b ] = value;

                    // return false to break out of $.each
                    return false;
                }
            } );
        } );

        // Coordinates / geometry
        //
        if ( place.geometry && place.geometry.location )
        {
            result.coordinates = place.geometry.location.toUrlValue();
        }

        return result;
    }

} )( jQuery );
