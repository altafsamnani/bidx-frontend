/**
 * @version 1.0
 * @author Altaf S
 */
;(function( $ )
{
    var bidx                            = window.bidx
    ,   api                             = bidx.api
    ,   businesssummaryGrantAccess    = {}
    ,   baseUrl                         = "/api/v1/businesssummary/%id%/grantAccess/%investorId%"
    ,   params                          = []
    ;

    businesssummaryGrantAccess.send = function( params )
    {
        var method = "PUT"
        ,   url    = baseUrl.replace( "%id%", params.id )
                    .replace( "%investorId%", params.investorId)
        ;

        api._call(
        {
            method:                     method
        ,   groupDomain:                params.groupDomain
        ,   extraUrlParameters:         params.extraUrlParameters
        ,   baseUrl:                    url
        ,   success:                    function( data, textStatus, jqXhr )
            {
                params.success( data, textStatus, jqXhr );
            }
        ,   error:                      function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };



    api.businesssummaryGrantAccess = businesssummaryGrantAccess;
} )( jQuery );
