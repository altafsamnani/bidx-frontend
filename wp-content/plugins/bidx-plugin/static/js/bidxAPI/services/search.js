/**
 * @version 1.0
 * @author jgorjup
 */
;(function( $ )
{
    var bidx            = window.bidx
    ,   api             = bidx.api
    ,   search          = {}
    ,   nnSearchUrl     = "/api/v1/nnsearch"
    ,   baseUrl         = "/api/v1/nsearch"
    ,   baseOldUrl      = "/api/v1/search"
    ,   baseMemberUrl   = "/api/v1/nnsearch"
    ,   params          = []
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
        ,   baseUrl:        nnSearchUrl
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

    search.found = function( params )
    {
        var method = "POST";

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        nnSearchUrl
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

    search.members = function( params )
    {
        var method  = "GET"
        ;

        api._call(
        {
            method:             method
        ,   groupDomain:        params.groupDomain
        ,   baseUrl:            baseMemberUrl
        ,   extraUrlParameters: params.extraUrlParameters
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
