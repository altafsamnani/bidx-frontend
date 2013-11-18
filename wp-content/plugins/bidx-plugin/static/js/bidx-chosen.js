/* global bidx */
;(function( $ )
{
    var pluginName  = "bidx_chosen"
    ,   defaults    =
        {
            chosen:
            {
                "search_contains":              true
            ,   "width":                        "100%"
            ,   "disable_search_threshold":     10
            }
        }
    ;

    // Plugin constructor which keeps the state of the instantiated plugin
    //
    function Plugin( element, options )
    {
        this.$element   = $( element );

        this.settings   = $.extend( {}, defaults, options );
        this._defaults  = defaults;
        this._name      = pluginName;

        this.init();
    }

    Plugin.prototype =
    {
        init: function ()
        {
            var plugin = this;

            if ( plugin.settings.emptyValue )
            {
                plugin.$element.append(
                    $(
                        "<option />"
                    ,   {
                            value: ""
                        }
                    ).text( plugin.settings.emptyValue )
                );
            }

            // Retrieve the items from the static data API
            //
            bidx.data.getContext( this.settings.dataKey, function( err, items )
            {
                plugin.items = items;

                // Convert the items retrieved from the static API into <option />s
                //
                plugin.populateItems();

                // Instantiate the chosen plugin
                //
                plugin.$element.chosen( plugin.settings.chosen );

                // Inform the world we are ready
                //
                plugin.$element.trigger( pluginName + ":ready" );
            } );

            // Make sure the validator plugin picks up the selected value for validation
            //
            plugin.$element.on( "change", function()
            {
                plugin.$element.trigger( "click" );
            } );
        }

        // Convert the list of retrieved items into options
        //
    ,   populateItems: function()
        {
            var plugin = this;

            if ( !plugin.items || $.type( plugin.items ) !== "array" )
            {
                return;
            }

            $.each( plugin.items, function( i, option )
            {
                var $option = $(
                    "<option />"
                ,   {
                        value:      option.value
                    }
                ).text( option.label );

                plugin.$element.append( $option );
            } );
        }
    };

    // Make sure we only get instantiated once
    //
    $.fn[ pluginName ] = function ( options )
    {
        return this.each(function()
        {
            if ( !$.data( this, "plugin_" + pluginName ) )
            {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
    };
} ( jQuery ));
