/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx        = window.bidx
    ,   api         = bidx.api
    ,   service     = {}
    ,   baseUrl     = "/api/v1/groups/leave"
    ,   params      = []
    ;

    service.save = function( params )
    {
        var method  = "POST"
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

    api.groupsLeave = service;
} )( jQuery );
