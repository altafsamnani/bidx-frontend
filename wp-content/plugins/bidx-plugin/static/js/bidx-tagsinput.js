/**
 * @description Reusable tagsinput plugin. wrapper around the bootstrap-tagsManager plugin and uses the bidxdatakey for data reftrieval
 *
 * @namespace
 * @name bidx.tagsinput
 * @version 1.0
 * @depends window.bidx.data, window.bidx.utils
 * @author
*/
;(function( $ )
{
    /*
        Function: bidx.tagsinput

        Used to create a wizard.
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
                dataValues:             null
            }
        }

    ,   _create: function( params )
        {
            var widget      = this
            ,   $item       = widget.element
            ,   dataKey     = $item.data( "bidxdatakey" )
            ;

            if ( !window.bidx.data )
            {
                alert( "bidx::tagsinput => No bidx.data available. Fatal!" );
                return;
            }

            widget.options = $.extend( widget.options, params );
            var options    = widget.options;

            $item.addClass( options.widgetClass );

            var _setup = function()
            {
                var params =
                {
                    tagClass:           options.tagClass
                ,   tagCloseIcon:       ""
                };

                if ( dataKey && options.state.dataValues )
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
            if ( dataKey )
            {
                window.bidx.data.getItem( dataKey, function( err, result )
                {
                    if ( err )
                    {
                        window.bidx.utils.error( "Problem getting bidx.data for key", dataKey, "populate a tagsinput control" );
                    }

                    options.state.dataValues = result;
                    _setup();
                } );
            }
            else
            {
                _setup();
            }
        }

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

                if ( value )
                {
                    values.push( value );
                }
            } );

            return values;
        }

    ,   setValues: function( values )
        {
            var widget      = this
            ,   $el         = widget.element
            ,   options     = widget.options
            ;


        }
    } );
} )( jQuery );
