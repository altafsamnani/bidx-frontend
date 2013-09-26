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



    api.mailbox = mailbox;
} )( jQuery );
