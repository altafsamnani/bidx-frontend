/**
 * @version 1.0
 * @author adebree
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
        ,   id:             params.memberId
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
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

   

    api.mail = mail;
} )( jQuery );
