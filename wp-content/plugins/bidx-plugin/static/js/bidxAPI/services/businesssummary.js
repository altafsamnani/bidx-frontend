/**
 * @version 1.0
 * @author Altaf
 */
;(function( $ )
{
    var bidx            = window.bidx
    ,   api             = bidx.api
    ,   businesssummary = {}
//    ,   baseUrl         = "/api/v1/groups/%groupId%/member"
    ,   baseUrl         = "/api/v1/businesssummary"
    ,   params          = []
    ;

    businesssummary.fetch = function( params )
    {
        var method = "GET"
        ,   url     = baseUrl
        ;

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        url
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



    api.businesssummary = businesssummary;
} )( jQuery );
