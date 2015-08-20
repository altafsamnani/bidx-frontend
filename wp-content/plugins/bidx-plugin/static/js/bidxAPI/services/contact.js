/**
 * @version 1.0
 * @author adebree
 * @author msp
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   contact  = {}
    ,   baseUrl = "/api/v1/contact"
    ,   params  = []
    ;

    contact.fetch = function( params )
    {
        var method = "GET"
        ,   url     =   baseUrl + '/mycontacts'
        ;

        api._call(
        {
            method:                     method
        ,   groupDomain:                params.groupDomain
        ,   extraUrlParameters:         params.extraUrlParameters
        ,   baseUrl:                    url
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

    contact.disconnect = function( params )
    {
        var method  = "PUT"
        ,   url     =   baseUrl + '/disconnect'
        ;

        api._call(
        {
            method:             method
        ,   groupDomain:        params.groupDomain
        ,   extraUrlParameters: params.extraUrlParameters
        ,   baseUrl:            url

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

    contact.connect = function( params )
    {
        var method  =   "PUT"
        ,   url     =   baseUrl + '/connect'
        ;

        api._call(
        {
            method:             method
        ,   groupDomain:        params.groupDomain
        ,   extraUrlParameters: params.extraUrlParameters
        ,   baseUrl:            url
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

    contact.block = function( params )
    {
        var method  =   "PUT"
        ,   url     =   baseUrl + '/block'
        ;

        api._call(
        {
            method:             method
        ,   groupDomain:        params.groupDomain
        ,   extraUrlParameters: params.extraUrlParameters
        ,   baseUrl:            url
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

    contact.unblock = function( params )
    {
        var method  =   "PUT"
        ,   url     =   baseUrl + '/unblock'
        ;

        api._call(
        {
            method:             method
        ,   groupDomain:        params.groupDomain
        ,   extraUrlParameters: params.extraUrlParameters
        ,   baseUrl:            url
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


    api.contact = contact;
} )( jQuery );
