// Wrapper around the i18n data API
//

( function( $ )
{
    var bidx                = window.bidx
    ,   g                   = "__global"
    ;

        // Internal administration of cached items, let's keep it for now in an object, maybe later sync it to localstorage
        //
        // A cached item is identifed by it's property in the items object. This property is equal to the name of the context in the WordPress world
        //
        // Every item should get a set of properties:
        // - mtime          when it was set
        // - data           the actual data (array)
        // - byKey          the same data, but as a lookup by key / value
        //
    var items               = {}

        // Keep a request queue per key so we don't end up calling the same data in parallel
        //
    ,   requestQueue        = {}
    ;

    // Blocking i18n item retrieval function. Can be used after the context has been succesfully loaded
    //
    function i( key, context )
    {
        var result;

        if ( !context )
        {
            context = g;
        }

        if ( !items[ context ] )
        {
            bidx.utils.error( "bidx.i18n::context", context, "not loaded!" );
        }

        if ( $.isArray( key ) )
        {
            result = [];

            $.each( key, function( idx, k )
            {
                result[ idx ] = items[ context ].byKey[ key ].label;
            } );
        }
        else
        {
            result = items[ context ].byKey[ key ].label;
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
                        bidx.utils.log( "[i18n] Resolving", context );
                        d.resolve();
                    } );
                } )
            );
        } );

        return $.when.apply( $, deferreds );
    }

    // Retrieve the whole context
    //
    function getContext( context, cb )
    {
        var first = false;

        // Only called with a callback
        //
        if ( $.isFunction( context ) )
        {
            cb = context;
            context = null;
        }

        // When no context specified, it is the global context which by convention we named __global
        //
        if ( !context )
        {
            context = g;
        }

        // Already loaded?
        //
        if ( items[ context ] )
        {
            cb( null, items[ context ] );
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
        if ( first )
        {
            bidx.utils.warn( "bidx.i18n not having", context, "loaded. Calling API to retrieve it" );

            $.ajax(
            {
                url:        "/wp-admin/admin-ajax.php?action=bidx_translation&type=i18n&context=" + context
            ,   dataType:   "json"
            } )
                .done( function( data, status, jqXHR )
                {
                    if ( !data || !data[ context ] )
                    {
                        bidx.utils.error( "i18n::called the WP api for retrieving extra data, but unexpected response", data, status, jqXHR );

                        cb( new Error( "Problem retrieving i18n data" ));
                    }
                    else
                    {
                        setItem( context, data[ context ] );

                        $.each( requestQueue[ context ], function( idx, cb )
                        {
                            cb( null, items[ context ] );
                        } );
                    }

                    delete requestQueue[ context ];
                } )
                .fail( function()
                {
                    bidx.utils.error( "problem retrieving i18n data" );

                    cb( new Error( "problem retrieving i18n data" ));
                    delete requestQueue[ context ];
                } )
            ;
        }
    }

    function getItem( key, context, cb )
    {
        var item
        ,   myItem
        ,   keyLen
        ,   labels
        ,   ticks
        ;

        // When getItem() was called for a global item the context might be the callback
        // or there is no context and callback at all. Since context is fallbacked to
        // __global, we only need to fix the remapping of the callback here
        //
        if ( $.isFunction( context ) )
        {
            cb      = context;
            context = null;
        }

        // When no context specified, it is the global context which by convention we named __global
        //
        if ( !context )
        {
            context = g;
        }

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
    function setItem( context, data )
    {
        var keys = {};

        if ( !data )
        {
            bidx.utils.warn( "[i18n] setItem called for context", context, "but no data" );

            return;
        }

        $.each( data, function( idx, item )
        {
            keys[ item.value ] = item;
        });

        items[ context ] =
        {
            mtime:              +( new Date() )
        ,   data:               data
        ,   byKey:              keys
        };
    }

    // Was data preloaded?
    //
    if ( window.__bidxI18nPreload )
    {
        var preload;

        try
        {
            preload = window.__bidxI18nPreload;
        }
        catch ( e )
        {
            bidx.utils.error( "Problem parsing i18n preload data" );
        }

        if ( preload )
        {
            $.each( preload, function ( idx, item )
            {
                setItem( idx, item );
            } );
        }
    }

    // jQuery extensions
    //
    $.fn.i18nText = function i18nText( key, context )
    {
        var $el = $( this );

        getItem( key, context, function( err, label )
        {
            if ( err || !label )
            {
                label = key;
                bidx.utils.error( "i18n::Problem translating", key, context );
            }

            $el.text( label );
        } );

        return $el;
    };

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
    ,   getContext:                 getContext
    ,   load:                       load

    ,   i:                          i
    };
} ( jQuery ));
