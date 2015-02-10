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

    // PUT /competition/{competitionId}/actors
    // Add/Update Actor to Competition
    competition.assignActorToCompetition       = function( params )
    {
        var method          = "PUT"
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

        if ( params.competitionId )
        {
            requestParams.baseUrl  +=   '/%id%/actors';
            requestParams.baseUrl   =   requestParams.baseUrl.replace( "%id%", params.competitionId );
        }

        api._call( requestParams );
    };

    //POST /competition/{competitionId}/application/{entityId}/actor
    //PUT /competition/{competitionId}/application/{entityId}/actors
    // Add/Update Actor to Application
    competition.assignActorToApplication       = function( params )
    {
        var method          = params.method
        ,   url             = baseUrl
        ,   requestParams   =
            {
                method:         method
            ,   groupDomain:    params.groupDomain
            ,   baseUrl:        url
            ,   competitionId:  params.competitionId
            ,   entityId:       params.entityId
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

        api._call( requestParams );
    };

    // POST /competition/{competitionId}/application
    // PUT /competition/{competitionId}/application/{entityId}
    // Apply for competition --> Apply --> Submit --> Withdraw --> Reject
    competition.assignPlanToCompetition      = function( params )
    {
        var method          = params.method
        ,   requestParams   =
            {
                method:         method
            ,   groupDomain:    params.groupDomain
            ,   baseUrl:        baseUrl
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

        if ( params.competitionId )
        {
            requestParams.baseUrl  +=   '/%id%/application';
            requestParams.baseUrl   =   requestParams.baseUrl.replace( "%id%", params.competitionId );
        }

        api._call( requestParams );
    };

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
