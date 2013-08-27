/**
 * @version 1.0
 * @author msp
 */
;(function( $ )
{
    var bidx                = window.bidx
    ,   api                 = bidx.api
    ,   validateUsername    = {}
    ,   baseUrl             = "/api/v1/members/validateUsername"
    ,   params              = []
    ;

    validateUsername.fetch = function( params )
    {
        var method = "GET";

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
        ,   data:           params.data
        ,   form:           true
        ,   success:        function( response, textStatus, jqXhr )
            {
                if ( response && response.data )
                {
                    response = response.data;
                }

                params.success( response, textStatus, jqXhr );
            }
        ,   error:          function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };

    api.validateUsername = validateUsername;

} )( jQuery );
