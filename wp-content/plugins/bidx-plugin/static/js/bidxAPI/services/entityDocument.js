/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   entityDocument  = {}
    ,   baseUrl = "/api/v1/entity/%entityId%/document"
    ,   params  = []
    ;

    entityDocument.destroy = function( params )
    {
        var method  = "DELETE"
        ,   url     = baseUrl.replace( "%entityId%", params.entityId )
        ;

        api._call(
        {
            method:         method
        ,   id:             params.documentId
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

    api.entityDocument = entityDocument;
} )( jQuery );
