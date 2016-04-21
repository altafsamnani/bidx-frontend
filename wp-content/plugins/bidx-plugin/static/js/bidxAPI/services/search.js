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
    ,   baseMemberUrl   = "/api/v1/nnsearch"
    ,   presetUrl       = "/api/v1/storage/searchpreset"
    ,   params          = []
    ;

    search.fetch = function( params )
    {
        var method  = "GET"
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

    search.preset = function( params )
    {
        var method          = params.presetId ? "PUT" : "PUT"
        ;

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        presetUrl
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

    search.getpreset = function( params )
    {
        var method          = "GET"
        ;

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        presetUrl
        ,   extraUrlParameters:         params.extraUrlParameters
        ,   success:        function( response, textStatus, jqXhr )
            {
                if ( response && response.data )
                {
                    response = response.data;
                }
                else
                {
                    response = {};
                }

                params.success( response, textStatus, jqXhr );
            }
        ,   error:          function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };



    /*search.members = function( params )
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
    }; */

    api.search = search;
} )( jQuery );
