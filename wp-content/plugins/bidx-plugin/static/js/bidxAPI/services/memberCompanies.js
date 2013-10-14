/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   service = {}
    ,   baseUrl = "/api/v1/members/%memberId%/companies"
    ,   params  = []
    ;

    service.fetch = function( params )
    {
        var method = "GET"
        ,   url    = baseUrl.replace( "%memberId%", params.memberId )
        ;

        api._call(
        {
            method:                     method
        ,   groupDomain:                params.groupDomain
        ,   baseUrl:                    url
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

    // Expose
    //
    api.memberCompanies = service;
} )( jQuery );
