/**
 * @version 1.0
 * @author msp
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   groupsBusinesssummaries  = {}
    ,   baseUrl = "/api/v1/groups/businesssummaries/"
    ,   params  = []
    ;

    groupsBusinesssummaries.fetch = function( params )
    {
        var method = "GET";

        api._call(
        {
            method:         method
        ,   id:             params.memberId
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
        ,   extraUrlParameters:     params.extraUrlParameters
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

    api.groupsBusinesssummaries = groupsBusinesssummaries;
} )( jQuery );
