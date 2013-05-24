/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx        = window.bidx
    ,   api         = bidx.api
    ,   groupsJoin  = {}
    ,   baseUrl     = "/api/v1/groups/join"
    ,   params      = []
    ;

    groupsJoin.save = function( params )
    {
        var method  = "DELETE"
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

    api.groupsJoin = groupsJoin;
} )( jQuery );
