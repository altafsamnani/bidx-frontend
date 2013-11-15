/**
 * @version 1.0
 * @author msp
 */
;(function( $ )
{
    var bidx                            = window.bidx
    ,   api                             = bidx.api
    ,   businesssummaryRequestAccess    = {}
    ,   baseUrl                         = "/api/v1/businesssummary/%id%/requestAccess"
    ,   params                          = []
    ;

    businesssummaryRequestAccess.send = function( params )
    {
        var method = "POST"
        ,   url    = baseUrl.replace( "%id%", params.id )
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



    api.businesssummaryRequestAccess = businesssummaryRequestAccess;
} )( jQuery );
