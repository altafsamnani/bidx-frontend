/**
 * @version 1.0
 * @initiator adebree
 * @author msp
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   mailbox  = {}
    ,   baseUrl = "/api/v1/mailbox/%mailboxId%/"
    ,   params  = []
    ;


    mailbox.fetch = function( params )
    {
        var method  = "GET"
        ,   url     = baseUrl
        ;

        if ( params.mailboxId )
        {
            url     = baseUrl.replace( "%mailboxId%", params.mailboxId );
        }
        else
        {
            url     = baseUrl.replace( "/%mailboxId%/", "" );
        }

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        url
        ,   extraUrlParameters:     params.extraUrlParameters

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


    mailbox.move = function( params )
    {
        var method  = "PUT"
        ,   url     = baseUrl.replace( "%mailboxId%", params.mailboxId ) + "mail/" + params.mailIds
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

    api.mailbox = mailbox;
} )( jQuery );
