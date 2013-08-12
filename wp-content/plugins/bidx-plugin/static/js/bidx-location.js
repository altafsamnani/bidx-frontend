/**
 * @description Reusable location lugin
 *
 * @namespace
 * @name bidx.location
 * @version 1.0
 * @depends google maps, google places, google places autocomplete, jquery, jquery ui
 * @author
*/
;(function( $ )
{
    /*
        Function: bidx.location

        Returns:
            None
    */
    $.widget( "bidx.location",
    {
        options: {
            widgetClass:            "location"
        ,   name:                   "bidx-location"
        ,   emptyClass:             "empty"

        ,   showMap:                true
        ,   initiallyShowMap:       true

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

            $el.bind( "click", function()
            {
                widget._deleteOverlays();
            } );


            if ( options.showMap )
            {
                $el.focus( widget.showMap() );
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

    ,   _deleteOverlays: function()
        {
            var widget  = this
            ,   options = widget.options
            ,   state   = options.state
            ;


        }

    ,   _generateId: function()
        {
            var widget  = this
            ,   options = widget.options
            ;

            return options.name + new Date().getTime() + "X" + Math.floor( Math.random() * 10000000 );
        }
    } );
} )( jQuery );
