/**
 * @version 1.0
 * @author Altaf
 */
;(function( $ )
{
    var bidx            = window.bidx
    ,   api             = bidx.api
    ,   groups    = {}
//    ,   baseUrl         = "/api/v1/groups/%groupId%/member"
    ,   baseUrl         = "/api/v1/groups"
    ,   params          = []
    ;

    groups.fetch = function( params )
    {
        var method = "GET"
        ,   url     = baseUrl
        ;

        api._call(
        {
            method:         method
        ,   id:             params.groupId
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



    api.groups = groups;
} )( jQuery );
