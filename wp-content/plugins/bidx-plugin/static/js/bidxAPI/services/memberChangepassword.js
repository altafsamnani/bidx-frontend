/**
 * @version 1.0
 * @initiator adebree
 * @author msp
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   memberChangepassword  = {}
    ,   baseUrl = "/api/v1/members/changepassword"
    ,   params  = []
    ;

    memberChangepassword.update = function( params )
    {
        var method  = "PUT"
        ;

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
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

    api.memberChangepassword = memberChangepassword;
} )( jQuery );
