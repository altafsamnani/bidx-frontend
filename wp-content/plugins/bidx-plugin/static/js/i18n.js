// Wrapper around the i18n data API
//

( function( $ )
{
    var bidx                = window.bidx
    ;


        // Internal administration of cached items, let's keep it for now in an object, maybe later sync it to localstorage
        //
        // A cached item is identifed by it's key in the items object. This key is equal to the name of the list in the static data API
        //
        // Every item should get a set of properties:
        // - mtime          when was it set, in ms
        // - data           the actual data
        //
    var items               = {}

        // Keep a request queue per key so we don't end up calling the same data in parallel
        //
    ,   requestQueue        = {}
    ;

    // Main function for access the data cache
    //
    var getItem = function( key, cb )
    {
            // Untill we have defined what the caching rules are.. let's just disable it and cache forever
            //
        var oldestAllowedMTime  = 0
        ,   first
        ;

        // Is the item in the cache and not 'too' old? return it
        //
        if ( items[ key ] && items[ key ].mtime > oldestAllowedMTime )
        {
            cb( null, items[ key ].data );
            return;
        }


        if ( !requestQueue[ key ] )
        {
            requestQueue[ key ] = [];
            first = true;
        }

        requestQueue[ key ].push( cb );

        // Retrieve data from API
        //
        // TODO: proper implementation, currently no API available... shouldn't end up here
        //
        if ( first )
        {
            bidx.api.call(
                "STATIC_DATA.TO_BE_DEFINED" // TODO: what API to call for this?
            ,   {
                    key:            key
                ,   locale:         "en"    // TODO: determine locale in front-end or back-end?
                ,   success:        function( data )
                    {
                        setItem( key, data );

                        $.each( requestQueue[ key ], function( idx, cb )
                        {
                            cb( null, items[ key ].data );
                        } );

                        delete requestQueue[ key ];
                    }
                ,   error:          function( data )
                    {
                        bidx.utils.error( "problem retrieving static data" );

                        cb( new Error( "problem retrieving static data"     ));
                    }
                }
            );
        }
    };

    // Internal setter of cache items
    //
    var setItem = function( key, data )
    {
        items[ key ] =
        {
            mtime:              +( new Date() )
        ,   data:               data
        };
    };

    // Was data preloaded?
    //
    if ( bidx.i18n && bidx.i18n.__preload )
    {
        var preload;

        try
        {
            preload = $.parseJSON( bidx.i18n.__preload );
        }
        catch ( e )
        {
            bidx.utils.error( "Problem parsing i18n preload data" );
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

    window.bidx.i18n =
    {
        getItem:                    getItem
    ,   setItem:                    setItem
    };
} ( jQuery ));
