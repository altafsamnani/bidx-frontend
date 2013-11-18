/* global bidx */
/**
 * @version 1.0
 * @author Altaf, Arne de Bree
 */
;(function( $ )
{
    var api             = bidx.api
    ,   service         = {}
    ,   baseUrl         = "/api/v1/businesssummary"
    ,   params          = []
    ;

    // Callable with an businessSummaryId property on 'params' and without
    //
    service.fetch = function( params )
    {
        var method          = "GET"
        ,   url             = baseUrl
        ,   requestParams   =
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
            }
        ;

        if ( params.businessSummaryId )
        {
            requestParams.id = params.businessSummaryId;
        }

        api._call( requestParams );
    };

    // Save or create the business summary. Depending on the presence of the businessSummaryId property
    //
    service.save = function( params )
    {
        var method          = params.businessSummaryId ? "PUT" : "POST"
        ,   url             = baseUrl
        ,   requestParams   =
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
            }
        ;

        if ( params.businessSummaryId )
        {
            requestParams.id = params.businessSummaryId;
        }

        api._call( requestParams );
    };

    api.businesssummary = service;
} )( jQuery );
