// Wrapper around the static data API
//

( function( $ )
{
    var bidx                = window.bidx
    ;

        // Internal administration of cached items, let's keep it for now in an object, maybe later sync it to localstorage
        //
        // A cached item is identifed by it's context in the items object. This context is equal to the name of the list in the static data API
        //
        // Every item should get a set of properties:
        // - mtime          when was it set, in ms
        // - data           the actual data
        //
    var items               = {}

        // Keep a request queue per context so we don't end up calling the same data in parallel
        //
    ,   requestQueue        = {}
    ;

    // Main function for access the data cache
    //
    var getItem = function( context, cb )
    {
            // Untill we have defined what the caching rules are.. let's just disable it and cache forever
            //
        var oldestAllowedMTime  = 0
        ,   first
        ;

        // Is the item in the cache and not 'too' old? return it
        //
        if ( items[ context ] && items[ context ].mtime > oldestAllowedMTime )
        {
            cb( null, items[ context ].data );
            return;
        }


        if ( !requestQueue[ context ] )
        {
            requestQueue[ context ] = [];
            first = true;
        }

        requestQueue[ context ].push( cb );

        // Retrieve data from API
        //
        // TODO: proper implementation, currently no API available... shouldn't end up here
        //
        if ( first )
        {
            bidx.utils.warn( "bidx.data not having", context, "loaded. Calling API to retrieve it" );

            $.ajax(
            {
                url:        "/wp-admin/admin-ajax.php?action=bidx_translation&type=static&context=" + context
            ,   dataType:   "json"
            } )
                .done( function( data, status, jqXHR )
                {
                    if ( !data || !data[ context ] )
                    {
                        bidx.utils.error( "bidx.data::called the WP api for retrieving extra data, but unexpected response", data, status, jqXHR );

                        cb( new Error( "Problem retrieving static data" ));
                    }
                    else
                    {
                        setItem( context, data[ context ] );

                        $.each( requestQueue[ context ], function( idx, cb )
                        {
                            cb( null, items[ context ].data );
                        } );

                        delete requestQueue[ context ];
                    }
                } )
                .fail( function()
                {
                    bidx.utils.error( "problem retrieving static data" );

                    cb( new Error( "problem retrieving static data" ));
                } )
            ;
        }
    };

    // Internal setter of cache items
    //
    var setItem = function( context, data )
    {
        items[ context ] =
        {
            mtime:              +( new Date() )
        ,   data:               data
        };
    };

    // Was data preloaded?
    //
    if ( window.__bidxDataPreload )
    {
        var preload;

        try
        {
            preload = window.__bidxDataPreload;
        }
        catch ( e )
        {
            bidx.utils.error( "Problem parsing data preload data" );
        }

        if ( preload )
        {
            $.each( preload, function ( idx, item )
            {
                setItem( idx, item);
            } );
        }
    }

    // Exports
    //
    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.data =
    {
        getItem:                    getItem
    ,   setItem:                    setItem
    };
} ( jQuery ));
