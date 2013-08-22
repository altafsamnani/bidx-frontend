/**
 * @version 1.0
 * @initiator adebree
 * @author msp
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   auth    = {}
    ,   baseUrl = "/api/v1/auth"
    ,   params  = []
    ;


    auth.send = function ( params )
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
    }

    api.auth = auth;
} )( jQuery );
