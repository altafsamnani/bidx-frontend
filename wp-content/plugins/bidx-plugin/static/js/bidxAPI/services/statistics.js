/**
 * @version 1.0
 * @author jgorjup
 */
;(function( $ )
{
    var bidx        = window.bidx
    ,   api         = bidx.api
    ,   statistics  = {}
    ,   baseUrl     = "/api/v1/stat/events/perday"
    ,   params      = []
    ;

    statistics.fetch = function( params )
    {
        var method  = "GET"
        ;

        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
        ,   extraUrlParameters:         params.extraUrlParameters
        ,   success:        function( response, textStatus, jqXhr )
            {
                if ( response && response.data )
                {
                    response = response.data;
                }

                params.success( response, textStatus, jqXhr );
            }
        ,   error:          function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };
    api.statistics = statistics;
} )( jQuery );
