/**
 * @version 1.0
 * @initiator adebree
 * @author msp
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   mailboxMark  = {}
    ,   baseUrl = "/api/v1/mailbox/mark/%mailIds%/"
    ,   params  = []
    ;

    mailboxMark.mutate = function( params )
    {
        var method  = "PUT"
        ,   url     = baseUrl.replace( "%mailIds%", params.mailIds )
        ;

        api._call(
        {
            method:                 method
        ,   groupDomain:            params.groupDomain
        ,   extraUrlParameters:     params.extraUrlParameters
        ,   baseUrl:                url
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

    api.mailboxMark = mailboxMark;
} )( jQuery );
