// Wrapper around the i18n data API
//

( function( $ )
{
    var bidx                = window.bidx
    ,   g                   = "__global"
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

    // Blocking i18n item retrieval function. Can be used after the context has been succesfully loaded
    //
    function i( key, context )
    {
        if ( !context )
        {
            context = g;
        }

        if ( !items[ context ] )
        {
            bidx.utils.error( "bidx.i18n::context", context, "not loaded!" );
        }

        return bidx.utils.getValue( items, context + ".byKey." + key  + ".label" );
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

    // Retrieve the whole context
    //
    function getContext( context, cb )
    {
        var first = false;

        // Only called with a callback
        //
        if ( $.isFunction( context ))
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
        // TODO: proper implementation, currently no API available... shouldn't end up here
        //
        if ( first )
        {
            bidx.utils.warn( "bidx.i18n not having", context, "loaded. Calling API to retrieve it" );

            bidx.api.call(
                "I18N.TO_BE_DEFINED" // TODO: what API to call for this?
            ,   {
                    key:            context
                ,   success:        function( data )
                    {
                        setItem( context, data );

                        $.each( requestQueue[ context ], function( idx, cb )
                        {
                            cb( null, items[ context ] );
                        } );

                        delete requestQueue[ context ];
                    }
                ,   error:          function( data )
                    {
                        bidx.utils.error( "problem retrieving static data" );

                        cb( new Error( "problem retrieving static data"     ));
                    }
                }
            );
        }
    }

    function getItem( key, context, cb )
    {
        var item, myItem;

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
            //
            if ( !key )
            {
                cb( null, item );
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
            preload = $.parseJSON( window.__bidxI18nPreload );
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
