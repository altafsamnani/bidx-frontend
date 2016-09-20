/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   service = {}
    ,   baseUrl = "/api/v1/entity"
    ,   params  = []
    ;

    service.fetch = function( params )
    {
        var method = "GET";

        api._call(
        {
            method:         method
        ,   id:             params.entityId
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
        } );
    };

    service.destroy = function( params )
    {
        var method = "DELETE";

        api._call(
        {
            method:         method
        ,   id:             params.entityId
        ,   groupDomain:    params.groupDomain
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

    service.save = function( params )
    {
        var method = params.entityId ? "PUT" : "POST";

        api._call(
        {
            method:         method
        ,   id:             params.entityId
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
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

    service.bulk = function( params )
    {
        var url
        ,   method = params.entityId ? "PUT" : "POST";

        url =   baseUrl + '/bulk';

        api._call(
        {
            method:         method
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

    service.getBulk = function( params )
    {
        var url
        ,   method = "POST"
        ;

        url =   baseUrl + '/bulk';

        api._call(
        {
            method:         method
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





    api.entity = service;
} )( jQuery );
