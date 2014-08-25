/**
 * Rating of entities.
 * 
 * @version 1.0
 */
;(function( $ )
{
    var bidx                    = window.bidx
    ,   api                     = bidx.api
    ,   entityRate              = {}
    ,   baseUrl                 = "/api/v1/entity/%id%/rating"
    ,   params                  = []
    ;

    /* This POST is used for the first rating, when changing a rating, and when 
     * deleting a rating by settings its value to null. It will always return
     * updated Rating details, allowing to update the overall rating. 
     */
    entityRate.save = function( params )
    {
        var method  = "POST"
        ,   url     = baseUrl
                        .replace( "%id%", params.id )
        ;

        api._call(
        {
            method:         method
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

    api.entityRate = entityRate;
} )( jQuery );
