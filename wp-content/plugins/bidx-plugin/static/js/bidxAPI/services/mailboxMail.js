/**
 * @version 1.0
 * @initiator adebree
 * @author mattijs spierings
 */
;(function( $ )
{
    var bidx            = window.bidx
    ,   api             = bidx.api
    ,   mailboxMail     = {}
    ,   baseUrl         = "/api/v1/mailbox/mail"
    ,   params          = []
    ;


    mailbox.fetch = function( params )
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



    api.mailboxMail = mailboxMail;
} )( jQuery );
