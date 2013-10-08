/**
 * @version 1.0
 * @initiator adebree
 * @author msp
 */
;(function( $ )
{
    var bidx                = window.bidx
    ,   api                 = bidx.api
    ,   mailboxEmptyTrash   = {}
    ,   baseUrl             = "/api/v1/mailbox/emptyTrash"
    ,   params              = []
    ;


    mailboxEmptyTrash.fetch = function( params )
    {
        var method = "GET"
        ;

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
//        ,   form:           true
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







    api.mailboxEmptyTrash = mailboxEmptyTrash;
} )( jQuery );
