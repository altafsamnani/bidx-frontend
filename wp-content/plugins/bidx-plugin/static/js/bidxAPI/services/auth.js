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
    ,   baseUrl = "/wp-admin/admin-ajax.php?action=bidx_signin"
    ,   params  = []
    ;


    auth.login = function ( params )
    {
        var method = "POST";

        api._call(
        {
            method:                     method
   //     ,   groupDomain:                params.groupDomain
        ,   form:                       true
        ,   baseUrl:                    baseUrl
        ,   extraUrlParameters:         params.extraUrlParameters
        ,   wpCall:                     true
        ,   data:                       params.data

        ,   success: function( data, textStatus, jqXhr )
            {
                bidx.utils.log("Eerste lijn", arguments);
                params.success( data, textStatus, jqXhr );
            }
        ,   error: function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };

    api.auth = auth;
} )( jQuery );
