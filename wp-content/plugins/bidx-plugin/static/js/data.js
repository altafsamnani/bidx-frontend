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

    // Blocking data item retrieval function. Can be used after the context has been succesfully loaded
    //
    function i( key, context )
    {
        var result;

        if ( !items[ context ] )
        {
            bidx.utils.error( "bidx.data::context", context, "not loaded!" );
        }

        if ( $.isArray( key ) )
        {
            result = [];

            $.each( key, function( idx, k )
            {
                result[ idx ] = bidx.utils.getValue( items, context + ".byKey." + k  + ".label" );
            } );
        }
        else
        {
            result = bidx.utils.getValue( items, context + ".byKey." + key  + ".label" );
        }

        return result;
    }

    // Returns a promise which will be done() after loading all the contexts'
    // TODO: handle error situation
    //
    function load( contexts )
    {
        var deferreds = [];

        $.each( contexts, function( idx, context )
        {
            deferreds.push(
                $.Deferred( function( d )
                {
                    getContext( context, function( err, item )
                    {
                        d.resolve();
                    } );
                } )
            );
        } );

        return $.when.apply( $, deferreds );
    }

    // Main function for access the data cache
    //
    function getContext( context, cb )
    {
            // Untill we have defined what the caching rules are.. let's just disable it and cache forever
            //
        var oldestAllowedMTime  = 0
        ,   first               = false
        ;

        // Is the item in the cache and not 'too' old? return it
        //
        if ( items[ context ] && items[ context ].mtime > oldestAllowedMTime )
        {
            cb( null, items[ context ].data );
            return;
        }

        // Are we the first one to ask? Let's create a queue and perform the actual request
        //
        if ( !requestQueue[ context ] )
        {
            requestQueue[ context ] = [];
            first = true;
        }

        requestQueue[ context ].push( cb );

        // Retrieve data from API
        //
        if ( first )
        {
            bidx.utils.warn( "bidx.data not having", context, "loaded. Calling API to retrieve it" );

            $.ajax(
            {
                url:        "/wp-admin/admin-ajax.php?action=bidx_translation&type=static&statictype=" + context
            ,   dataType:   "json"
            } )
                .done( function( data, status, jqXHR )
                {
                    if ( !data || !data[ context ] )
                    {
                        bidx.utils.error( "bidx.data::called the WP api for retrieving extra data for context", context, ", but unexpected response", data, status, jqXHR );

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
    }

    // Retrieve the label for a single key within a specific context in an async fashion
    //
    function getItem( key, context, cb )
    {
        var item
        ,   myItem
        ,   labels
        ,   ticks
        ,   keyLen
        ;

        // Context not loaded? Retrieve it first, and then retry finding it
        //
        if ( !items[ context ] )
        {
            getContext( context, function( err, item )
            {
                if ( err )
                {
                    cb( err, key );
                }
                else
                {
                    getItem( key, context, cb );
                }
            } );
        }
        else
        {
            item = items[ context ] || {};

            // Was asked for the whole context or a single key?
            // When asked with an array, create a new array of same lenght containing the translated values
            //
            if ( !key )
            {
                cb( null, item );
            }
            else if ( $.isArray( key ))
            {
                labels  = [];
                keyLen  = key.length;
                ticks   = 0;

                $.each( key, function( idx, k )
                {
                    getItem( k, context, function( err, label )
                    {
                        labels[ idx ] = label;

                        ticks += 1;

                        if ( ticks === keyLen )
                        {
                            cb( null, labels );
                        }
                    } );
                } );
            }
            else
            {
                myItem = item.byKey[ key ] || {};

                cb( null, myItem.label || key );
            }
        }
    }

    // Internal setter of cache items
    //
    var setItem = function( context, data )
    {
        var keys = {};

        $.each( data, function( idx, item )
        {
            keys[ item.value ] = item;
        } );

        // Make sure the array of items is in alphabetical order by the label property
        //
        data.sort( function ( a, b )
        {
            if ( a.label > b.label )
            {
                return 1;
            }

            if ( a.label < b.label )
            {
                return -1;
            }

            return 0;
        } );

        items[ context ] =
        {
            mtime:              +( new Date() )
        ,   data:               data
        ,   byKey:              keys
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
    ,   getContext:                 getContext
    ,   load:                       load
    ,   i:                          i
    };
} ( jQuery ));
