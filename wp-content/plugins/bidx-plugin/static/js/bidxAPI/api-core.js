/**
 * @description The API core defines the API entry point
 *
 * @namespace bidx
 * @name api
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var api
    ,   bidx
    ;

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    bidx        = window.bidx;
    bidx.api    = bidx.api || {};

    api = bidx.api;


    api.buildNr = /* @@build-nr-start@@ */ new Date().getTime()/* @@build-nr-end@@ */;

    if ( true !== api[ "initialized" ] )
    {

        /**
         * The settings for the api
         *
         * <h2>Settings:</h2>
         * <dl>
         * <dt>timeout</dt>        <dd>(integer) The timeout used when waiting for API calls</dd>
         * </dl>
         *
         * @fieldOf bidxAPI
         */
        api.settings = $.extend(
        {
            timeout:        30000
        ,   servicesPath:   "js/bidxAPI/services/"
        ,   deCaching:      false
        }, ( api.settings || {} ) );


        /**
         * Indicates the API has been initialized
         * @fieldOf api
         */
        api.initialized = false;

        /**
         * Initializes the API and a possible bridge
         *
         * @memberOf api
         *
         * @param params
         * @param params.successHandler         (function)  Callback function when the call is succesful
         * @param params.errorHandler           (function)  Callback function when the call fails
         */
        api.init = function( params )
        {
            var options = $.extend(
            {
                successHandler: function(){}
            ,   errorHandler:   function(){}
            }, params );

            // Update servicesPath if provided
            //
            api.settings.servicesPath = params[ "servicesPath" ] || api.settings.servicesPath;

            if ( true === api.initialized )
            {
                options.successHandler();
                return;
            }

            // Add stuff here for init reasons
            //
            options.successHandler();
         };


        /**
         * Call a method on the API. Method will be loaded if not available yet
         *
         * @memberOf api
         *
         */
        api.call = function( method, params )
        {
            var service;

            service = bidx.utils.getValue( api, method );
            if ( service )
            {
                bidx.utils.log( "[bidxAPI] calling service", method );
                service( params );
            }
            else
            {
                api.load( method, function( data, status )
                {
                    bidx.utils.log( "[api] Loaded service", method, status );
                    service = bidx.utils.getValue( api, method );

                    if ( service )
                    {
                        bidx.utils.log( "[api] Calling service", method );
                        service( params );
                    }
                    else
                    {
                        bidx.utils.log( "[api] Failed to load service", method, params );

                        if ( $.isFunction( params[ "errorHandler" ] ) )
                        {
                            params.errorHandler( {request: null, response: null, xhr: {data: null, status: 404, statusText: "Not found"}} );
                        }
                    }
                } );
            }
        };

        /**
         * Loads a method for the API
         *
         * @memberOf bidxAPI
         *
         */
        var currentlyLoading = {};
        api.load = function( method, callback )
        {
            var file
            ,   parts
            ;

            if ( currentlyLoading[ method ] )
            {
                // Someone has already asked for this service to be loaded.
                // Add our callback to the que
                //
                currentlyLoading[ method ].push( callback );
            }
            else
            {
                // Register our callback
                //
                currentlyLoading[ method ] = [];
                currentlyLoading[ method ].push( callback );

                // Load the API service implementation
                //
                bidx.utils.log( "[api] Loading service", method );

                parts = method.split( "." );

                file = parts.slice( 0, parts.length - 1 ).join( "/" );

                $.ajax( {
                    url:        api.settings.servicesPath + file + ".js?__b=" + api.buildNr + ( api.settings.deCaching ? +new Date() : "" )
                ,   type:       "GET"
                ,   dataType:   "script"
                ,   success:    function( data, status, xhr )
                                {
                                    $.each( currentlyLoading[ method ], function( index, callback )
                                    {
                                        if ( $.isFunction( callback ) )
                                        {
                                            callback( data, status );
                                        }
                                    } );

                                    delete currentlyLoading[ method ];
                                }
                ,   error:      function( xhr, status, error )
                                {
                                    $.each( currentlyLoading[ method ], function( index, callback )
                                    {
                                        if ( $.isFunction( callback ) )
                                        {
                                            callback( null, status );
                                        }
                                    } );

                                    delete currentlyLoading[ method ];
                                }
                } );
            }
        };

        api.getUrl = function( baseUrl, id, groupDomain, extraUrlParameters, wpCall )
        {
            var result              = baseUrl;
            var extraUrlParams      = "";

            if ( id )
            {
                result += "/" + id;
            }

            if ( extraUrlParameters )
            {
                $.each( extraUrlParameters, function( index, item )
                {
                    extraUrlParams += "&" + item.label + "=" + item.value;
                } );
            }

            // Override groupDomain from the URL
            //
            var forcedGroupDomain = bidx.utils.getQueryParameter( "__bidxGroupDomain" );

            // the WordPress handler can't handle the extra url variables, so we only use this for direct API calls
            //
            if( !wpCall )
            {
                result += "?csrf=false&bidxGroupDomain=" + encodeURIComponent( forcedGroupDomain || groupDomain ) + extraUrlParams;
            }

            return result;
        };

        // Actually doing the service call
        //
        api._call = function( options )
        {
            var url     = api.getUrl( options.baseUrl, options.id, options.groupDomain, options.extraUrlParameters, options.wpCall )
            ,   params  =
                {
                    url:            url
                ,   method:         options.method
                ,   type:           options.method
                ,   dataType:       "json"
                ,   success:        options.success
                ,   error:          options.error
                }
            ;

            if ( !options.form )
            {
                params.contentType = "application/json";
            }

            if ( options.data )
            {
                params.data = options.form ? options.data : JSON.stringify( options.data );
            }

            $.ajax( params );
        };

    }
} )( jQuery );
