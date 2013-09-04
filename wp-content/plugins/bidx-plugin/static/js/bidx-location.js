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

        ,   showMap:                true
        ,   initiallyShowMap:       false

        ,   setMarkers:             true
        ,   drawCircle:             true

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
        }

    ,   _create: function( params )
        {
            var widget  = this
            ,   $el     = widget.element
            ;

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

            google.maps.event.addListener(
                state.autoComplete
            ,   "place_changed"
            ,   function()
                {
                    var place = state.autoComplete.getPlace();

                    widget._placeChanged( place );
                }
            );

            $el.bind( "click", function()
            {
                widget._deleteOverlays();
            } );

            if ( options.showMap )
            {
                $el.focus( function()
                {
                    widget.showMap();
                } );
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
            ,   state       = options.state
            ,   center
            ,   arCoords
            ;

            widget._deleteOverlays();
            widget._updateLocationData( location );

            // Determine the center using the coordinates of the location
            //
            if ( location.coordinates )
            {
                arCoords = location.coordinates.split( "," );

                center = new google.maps.LatLng( arCoords[ 0 ], arCoords[ 1 ] );

                state.map.setCenter( center );

                if ( options.setMarkers )
                {
                    widget._drawMarker( center, location.reach );
                }
            }
            else
            {
                // No coordinates! Geocode it? Not really having a proper exit for this... :(
                //
                bidx.utils.error( "[bidx-location] SetLocationData called for a location without coordinates" );
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
            } );
        }

        // Update the internal administration of the set location
        //
    ,   _updateLocationData: function( data, merge )
        {
            var widget      = this
            ,   options     = widget.options
            ,   state       = options.state
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
            if ( place.geometry.viewport )
            {
                state.map.fitBounds( place.geometry.viewport );
            }
            else
            {
                state.map.setCenter( place.geometry.location );
                state.map.setZoom( 17 );  // Why 17? Because it looks good.
            }

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

            marker = new google.maps.Marker(
            {
                map:            state.map
            ,   draggable:      true
            } );

            state.markersArray.push( marker );
            marker.setVisible( false );

            marker.setPosition( position );
            marker.setVisible( true );

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
                ,   editable:           true
                ,   dragable:           false
                ,   radius_changed:     function()
                    {
                        var radius = this.getRadius() / 1000;

                        widget._updateLocationData( { reach: radius }, true );
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

                // The circle as a whole can be dragged
                //
                google.maps.event.addListener( marker, "dragend", function()
                {
                    var pos         = marker.position
                    ,   latlng      = new google.maps.LatLng( pos.lat(), pos.lng() )
                    ;

                    state.geocoder.geocode(
                        {
                            latLng:  latlng
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

                    widget._updateLocationData( { reach: circle.getRadius() / 1000 }, true );
                } );
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

        bidx.utils.log( "[bidx-location] _parseGooglePlaceIntoBidx input", place, "result", result );

        return result;
    }

} )( jQuery );
