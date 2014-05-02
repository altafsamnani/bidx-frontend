/**
 * @version 1.0
 * @author jgorjup
 */
;(function( $ )
{
    var bidx        = window.bidx
    ,   api         = bidx.api
    ,   search      = {}
    ,   baseUrl     = "/api/v1/nsearch"
    ,   baseOldUrl  = "/api/v1/search"
    ,   params      = []
    ;

    search.fetch = function( params )
    {
        var method  = "GET"
        ,   baseOldUrl = "/api/v1/search"
        ;

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseOldUrl
        ,   extraUrlParameters:         params.extraUrlParameters
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
        } );
    };

    search.get = function( params )
    {
        var method = "POST";

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
        ,   data:           params.data
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
        } );
    };

    api.search = search;
} )( jQuery );
