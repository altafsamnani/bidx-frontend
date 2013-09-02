/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   service = {}
    ,   baseUrl = "/api/v1/upload"
    ,   params  = []
    ;

    service.fetch = function( params )
    {
        var method = "GET";

        var apiParams =
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
        ,   success:        function( response, textStatus, jqXhr )
            {
                if ( response && response.data )
                {
                    response = response.data;
                }

                params.success( response, textStatus, jqXhr );
            }
        ,   error:          function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        };

        if ( params.id )
        {
            apiParams.id = params.id;
        }

        api._call( apiParams );
    };

    service.save = function( params )
    {
            // Not sure if ever a POST is needed via this service file...
            //
        var method  = params.id ? "PUT" : "POST"
        ,   url     = baseUrl
        ;

        api._call(
        {
            method:         method
        ,   id:             params.id
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        url
        ,   data:           params.data
        ,   success:        function( data, textStatus, jqXhr )
            {
                params.success( data, textStatus, jqXhr );
            }
        ,   error:          function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };

    service.destroy = function( params )
    {
        var method = "DELETE";

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   id:             params.id
        ,   baseUrl:        baseUrl
        ,   success:        function( data, textStatus, jqXhr )
            {
                params.success( data, textStatus, jqXhr );
            }
        ,   error:          function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };

    api.upload = service;
} )( jQuery );
