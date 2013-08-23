/**
 * @version 1.0
 * @initiator adebree
 * @author mattijs spierings
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   mail  = {}
    ,   baseUrl = "/api/v1/mail"
    ,   params  = []
    ;


    mail.fetch = function( params )
    {
        var method = "GET";

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
        ,   form:           true
        ,   data:           params.data
        ,   success:        function( response, textStatus, jqXhr )
            {
                if ( response && response.data )
                {
                    response = response;
                }

                params.success( response, textStatus, jqXhr );
            }
        ,   error:          function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };

    mail.read = function ( params )
    {
        var method = "GET";

        api._call(
        {
            method:         method
        ,   id:             params.mailId
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

    mail.delete = function ( params )
    {
        var method = "DELETE";

        api._call(
        {
            method:         method
        ,   id:             params.mailId
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

    mail.send = function ( params )
    {
        var method = "POST";

        api._call(
        {
            method:                     method
        ,   groupDomain:                params.groupDomain
        ,   baseUrl:                    baseUrl
        ,   extraUrlParameters:         params.extraUrlParameters
        ,   data:                       params.data

        ,   success: function( data, textStatus, jqXhr )
            {
                params.success( data, textStatus, jqXhr );
            }
        ,   error: function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };

    api.mail = mail;
} )( jQuery );
