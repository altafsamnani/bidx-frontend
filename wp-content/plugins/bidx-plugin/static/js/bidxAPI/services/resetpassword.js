/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx        = window.bidx
    ,   api         = bidx.api
    ,   resetpassword  = {}
    ,   baseUrl     = "/api/v1/resetpassword"
    ,   params      = []
    ;

    resetpassword.save = function( params )
    {
        var method  = "POST"
        ,   url     = baseUrl
        ;

        api._call(
        {
            method:         method
        ,   form:           true
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        url
        ,   data:           params.data
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

    api.resetpassword = resetpassword;
} )( jQuery );
