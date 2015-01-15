/* global bidx */
/**
 * @version 1.0
 * @author Altaf, Arne de Bree
 */
;(function( $ )
{
    var api             = bidx.api
    ,   competition         = {}
    ,   baseUrl         = "/api/v1/competition"
    ,   params          = []
    ;

    // Callable with an competitionSummaryId property on 'params' and without
    //
    competition.fetch = function( params )
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

        if ( params.competitionSummaryId )
        {
            requestParams.id = params.competitionSummaryId;
        }

        api._call( requestParams );
    };

    // Save or create the business summary. Depending on the presence of the competitionSummaryId property
    //
    competition.save = function( params )
    {
        var method          = "PUT"
        ,   url             = baseUrl
        ,   requestParams   =
            {
                method:         method
            ,   groupDomain:    params.groupDomain
            ,   baseUrl:        url
            ,   id:             params.id
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

        if ( params.competitionSummaryId )
        {
            requestParams.id = params.competitionSummaryId;
        }

        api._call( requestParams );
    };

    api.competition = competition;
} )( jQuery );
