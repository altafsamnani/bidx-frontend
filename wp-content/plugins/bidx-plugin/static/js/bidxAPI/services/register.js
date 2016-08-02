/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx        = window.bidx
    ,   api         = bidx.api
    ,   register  = {}
    ,   baseUrl     = "/api/v1/register/register"
    ,   params      = []
    ;

    register.register = function( params )
    {
        var method  = "POST"
        ,   url     = baseUrl
        ;

        api._call(
        {
            method:                     method
        ,   groupDomain:                params.groupDomain
        ,   baseUrl:                    baseUrl
       // ,   extraUrlParameters:         params.extraUrlParameters
        ,   data:                       params.data
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

    api.register = register;
} )( jQuery );
