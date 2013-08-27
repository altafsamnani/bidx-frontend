/**
 * @version 1.0
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
        ,   supressBidxUrlParams:       true
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

    api.auth = auth;
} )( jQuery );
