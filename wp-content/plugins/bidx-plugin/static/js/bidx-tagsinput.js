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

            // The properties of the dataset to use for the descriptive label'ing an the actual value
            //
        ,   labelProperty:      "label"
        ,   valueProperty:      "value"

        ,   state:
            {
                dataKey:                null
            ,   dataService:            null
            ,   dataValues:             null
            ,   dataValuesByValue:      null
            ,   dataRetrieved:          false

            ,   valueQueue:             null
            }
        }

    ,   _create: function( params )
        {
            var widget      = this
            ,   $item       = widget.element
            ;

            widget.options  = $.extend( widget.options, params );
            var options     = widget.options
            ,   state       = options.state
            ;

            state.dataKey       = $item.data( "bidxdatakey" );
            state.dataService   = $item.data( "bidxdataservice" );
            state.valueQueue    = [];
            state.dataRetrieved = false;

            if ( state.dataKey && state.dataServer )
            {
                bidx.utils.error( "bidx::tagsinput => it is not possible to specify both bidxdatakey and bidxdataservice on the same tagsinput!", $item );
                return;
            }

            if ( state.dataKey && !window.bidx.data )
            {
                alert( "bidx::tagsinput => No bidx.data available. Fatal!" );
                return;
            }

            if ( state.dataService && !window.bidx.api )
            {
                alert( "bidx::tagsinput => No bidx.api available. Fatal!" );
                return;
            }

            $item.addClass( options.widgetClass );

            $item.attr( "data-type", "tagsinput" );

            // DRY function for processing async data result used for setting up the typeahead
            // This can come either from the bidx.data internal api or from a bidx.api call
            //
            // !! REsult must be an array!
            //
            function _processDataResponse( result )
            {
                if ( !result || $.type( result ) !== "array" )
                {
                    bidx.utils.error( "Result used for setting up the typeahead in this bidx-tagsinput is not an array!", $item, result );
                    return;
                }

                state.dataValues            = result;
                state.dataValuesByValue     = {};

                // Pre-parse the dataValues into an object structure with
                //
                $.each( result, function( idx, item )
                {
                    // Lowercase the keys so looking up can be done using a lowercase as well. Have had some inconsistencies
                    //
                    state.dataValuesByValue[ ( item[ options.valueProperty ] + "" ).toLowerCase() ] = item;
                } );

                state.dataRetrieved = true;

                _setup();
            }

            // Setup the tagsManager and build typeahead
            //
            function _setup()
            {
                var params =
                {
                    tagClass:           options.tagClass
                ,   tagCloseIcon:       ""
                };

                // If there was a fixed list of data
                //
                if ( ( options.state.dataKey || options.state.dataService ) && options.state.dataValues )
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

                            var label = item[ options.labelProperty ].toLowerCase()
                            ,   query = this.query.trim().toLowerCase()
                            ;

                            if ( label.indexOf( query ) !== -1 )
                            {
                                return true;
                            }
                        },

                        highlighter: function (item) {

                            item = JSON.parse( item );

                            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
                            return item[ options.labelProperty ].replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                                return '<strong>' + match + '</strong>';
                            });
                        }
                    };
                }

                // Instantiate the tagsManager itself
                //
                $item.tagsManager( params );

                // Flush the value queue (if any)
                //
                widget._processQueuedValues();

                // Time to release the component for user interaction
                //
                $item
                    .removeClass( "disabled" )
                    .prop( "disabled", false )
                ;
            }

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
                    else
                    {
                        _processDataResponse( result );
                    }
                } );
            }
            // Does it have a datasource
            else if ( options.state.dataService )
            {
                // Expecting the dataService to contain a string which points to a globally exposed function on the window.bidx namespace
                //
                var serviceCall = bidx.utils.getValue( window.bidx, state.dataService );

                if ( !serviceCall || $.type( serviceCall ) !== "function" )
                {
                    window.bidx.utils.error( "Problem getting / parsing the service call ", state.dataService, "populate a tagsinput control" );
                }
                else
                {
                    // Perform the service call to get the data
                    //
                    serviceCall( function( result )
                    {
                        bidx.utils.log( "bidx-tagsinput, response from servicecall", result );

                        _processDataResponse( result );
                    } );
                }
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

                    // Value can be a JSON string, using the .data() API it will be parsed to an object
                    //
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
            ,   state       = options.state
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

            $.merge( state.valueQueue, values );

            widget._processQueuedValues();
        }

    ,   _processQueuedValues: function()
        {
            var widget      = this
            ,   $el         = widget.element
            ,   options     = widget.options
            ,   state       = options.state
            ;

            // Are there values queued we need to process?
            // Only do this after the data is retrieved when we actually are waiting for data to be retrived
            //
            if ( state.valueQueue.length &&  ( !( state.dataKey || state.dataService ) || ( state.dataRetrieved )))
            {
                $.each( state.valueQueue, function( idx, value )
                {
                    var tagValue = value;

                    // If we retrieved the data using a webservice / bidx.data, use that data
                    //
                    if ( state.dataKey || state.dataService )
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

                // Reset the queue
                //
                state.valueQueue = [];
            }
        }

        // Remove all the set / provided tags and bring the tagsinput back to it's initial state
        //
    ,   reset: function()
        {
            var widget      = this
            ,   $el         = widget.element
            ,   options     = widget.options
            ;

            $el.siblings( "." + options.tagClass ).remove();
        }
    } );
} )( jQuery );
