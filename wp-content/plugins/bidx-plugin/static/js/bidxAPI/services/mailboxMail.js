/**
 * @version 1.0
 * @initiator adebree
 * @author msp
 */
;(function( $ )
{
    var bidx            = window.bidx
    ,   api             = bidx.api
    ,   mailboxMail     = {}
    ,   baseUrl         = "/api/v1/mailbox/mail/%mailId%"
    ,   params          = []
    ;


    mailboxMail.fetch = function( params )
    {
        var method = "GET"
        ,   url    = baseUrl.replace( "%mailId%", params.mailId )
        ;

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        url
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

    mailboxMail.send = function ( params )
    {
        var method = "POST"
        ,   url    = baseUrl.replace( "/%mailId%", "" );


        api._call(
        {
            method:                     method
        ,   groupDomain:                params.groupDomain
        ,   baseUrl:                    url
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

    mailboxMail.delete = function ( params )
    {
        var method = "DELETE"
        ,   url    = baseUrl.replace( "%mailId%", params.mailIds )
        ;

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        url
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





    api.mailboxMail = mailboxMail;
} )( jQuery );
