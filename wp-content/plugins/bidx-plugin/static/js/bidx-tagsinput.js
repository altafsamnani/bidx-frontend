/**
 * @description Reusable tagsinput plugin. wrapper around the bootstrap-tagsManager plugin and uses the bidxdatakey for data reftrieval
 *
 * @namespace
 * @name bidx.tagsinput
 * @version 1.0
 * @depends window.bidx.data, window.bidx.utils, bidx-tagsmanager
 * @author
*/
;(function( $ )
{
    /*
        Function: bidx.tagsinput

        Used to create a tagsinput control with API to get and set tags/values.
        Returns:
            None
    */
    $.widget( "bidx.tagsinput",
    {
        options: {
            widgetClass:        "bidx-tagsinput"
        ,   tagClass:           "bidx-tag"
        ,   itemClass:          "reflow-row-item"

        ,   extraRowClasses:    "row-fluid"

        ,   state:
            {
                dataKey:                null
            ,   dataValues:             null
            ,   dataValuesByValue:      null
            }
        }

    ,   _create: function( params )
        {
            var widget      = this
            ,   $item       = widget.element
            ;

            widget.options = $.extend( widget.options, params );
            var options    = widget.options;

            options.state.dataKey     = $item.data( "bidxdatakey" );

            if ( options.state.dataKey && !window.bidx.data )
            {
                alert( "bidx::tagsinput => No bidx.data available. Fatal!" );
                return;
            }


            $item.addClass( options.widgetClass );

            $item.attr( "data-type", "tagsinput" );

            // Setup the tagsManager and build typeahead
            //
            var _setup = function()
            {
                var params =
                {
                    tagClass:           options.tagClass
                ,   tagCloseIcon:       ""
                };

                // If there was a fixed list of data
                //
                if ( options.state.dataKey && options.state.dataValues )
                {
                    params.typeahead            = true;
                    params.onlyTagList          = true;
                    params.typeaheadSource      = $.map( options.state.dataValues, function( data ) { return JSON.stringify( data ); } );
                    params.useJSONValues        = true;

                    params.typeaheadDelegate    =
                    {
                        sorter: function( items ) {
                            // basically disable sorting
                            return items;
                        },

                        matcher: function (item) {

                            item = JSON.parse( item );

                            var value = item.value.toLowerCase()
                            ,   query = this.query.trim().toLowerCase()
                            ;

                            if ( value.indexOf( query ) !== -1 )
                            {
                                return true;
                            }
                        },

                        highlighter: function (item) {

                            item = JSON.parse( item );

                            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
                            return item.label.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                                return '<strong>' + match + '</strong>';
                            });
                        }
                    };
                }

                $item
                    .tagsManager( params )
                    .removeClass( "disabled" )
                    .prop( "disabled", false )
                ;
            };

            // Does it have data key set?
            //
            if ( options.state.dataKey )
            {
                window.bidx.data.getItem( options.state.dataKey, function( err, result )
                {
                    if ( err )
                    {
                        window.bidx.utils.error( "Problem getting bidx.data for key", options.state.dataKey, "populate a tagsinput control" );
                    }

                    options.state.dataValues            = result;
                    options.state.dataValuesByValue     = {};

                    // Pre-parse the dataValues into an object structure with
                    //
                    $.each( result, function( idx, item )
                    {
                        // Lowercase the keys so looking up can be done using a lowercase as well. Have had some inconsistencies
                        //
                        options.state.dataValuesByValue[ item.value.toLowerCase() ] = item;
                    } );

                    _setup();
                } );
            }
            else
            {
                _setup();
            }
        }

        // Retrieve the values of the tags
        //
    ,   getValues: function()
        {
            var widget      = this
            ,   $el         = widget.element
            ,   options     = widget.options
            ,   values      = []
            ;

            // Get all the tags, using the DOM for now.. might be better to have the values on this widget
            //
            $el.siblings( "." + options.tagClass ).each( function()
            {
                var $tag    = $( this )
                ,   value   = $tag.data( "value" )
                ;

                // If no data value is set, use the text value of the tag itself
                // Most likely scenario this happens is when the tagsinput is used without a datasource
                // And the user input is actually the real value
                //
                if ( !value )
                {
                    value = $tag.text();
                }

                if ( value )
                {
                    values.push( value );
                }
            } );

            return values;
        }

        // Set the tags using an array values
        //
    ,   setValues: function( values )
        {
            var widget      = this
            ,   $el         = widget.element
            ,   options     = widget.options
            ,   type        = $.type( values )
            ;

            // Normalize into an array
            //
            if ( type === "string" )
            {
                values  = [ values ];
                type    = "array";
            }

            if ( type !== "array" )
            {
                window.bidx.utils.error( "bidx-tagsinput.setValues called with something that's not an array", values );
                return;
            }

            $.each( values, function( idx, value )
            {
                var tagValue = value;

                if ( options.state.dataKey )
                {
                    var item = options.state.dataValuesByValue[ value.toLowerCase() ];

                    if ( !item )
                    {
                        window.bidx.utils.error( "bidx-tagsinput:data item not found for ", value, $el[0] );
                        return;
                    }

                    tagValue = JSON.stringify( item );
                }

                $el.tagsManager( "pushTag", tagValue );
            } );
        }
    } );
} )( jQuery );
