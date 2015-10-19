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
            ,   "placeholder_text_single":      bidx.i18n.i("selectSingleOption")
            ,   "no_results_text":              bidx.i18n.i("selectNoResults")
            ,   "placeholder_text_multiple":    bidx.i18n.i("selectMultipleOptions")
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

            function _create()
            {
                // Instantiate the chosen plugin
                //
                plugin.$element.chosen( plugin.settings.chosen );

                // Inform the world we are ready
                //
                plugin.$element.trigger( pluginName + ":ready" );
            }

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

            // if there is a datakey provided, get data from static data API
            //
            if ( this.settings.dataKey )
            {
                // Retrieve the items from the static data API
                //
                bidx.data.getContext( this.settings.dataKey, function( err, items )
                {
                    plugin.items = items;

                    // Convert the items retrieved from the static API into <option />s
                    //
                    plugin.populateItems();

                    _create();
                } );
            }
            // population of options takes place somewhere else and we just want to initialize the plugin
            //
            else
            {
                _create();
            }


            // Make sure the validator plugin picks up the selected value for validation || Causes the dropdown to open again
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
            var sortItems
            ,   plugin = this;

            if ( !plugin.items || $.type( plugin.items ) !== "array" )
            {
                return;
            }

            sortItems = _.sortBy(plugin.items, 'value');

            $.each( sortItems, function( i, option )
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
            var $this = $( this );

            // test if the element is not already a chosen plugin
            //
            if ( !$.data( this, "plugin_" + pluginName ) )
            {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
            // element is a chosen plugin, so run an update
            //
            else
            {
                $this.trigger("chosen:updated");
            }
        });
    };
} ( jQuery ));
