/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx        = window.bidx
    ,   api         = bidx.api
    ,   service     = {}
    ,   baseUrl     = "/api/v1/entity/%entityId%/publish"
    ,   params      = []
    ;

    service.save = function( params )
    {
        var method  = "PUT"
        ,   url     = baseUrl.replace( "%entityId%", params.entityId )
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

    api.entityPublish = service;
} )( jQuery );
