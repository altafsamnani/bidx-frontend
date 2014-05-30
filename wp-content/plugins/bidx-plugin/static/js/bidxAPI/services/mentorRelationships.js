/**
 * @version 1.0
 * @author adebree
 * @author msp
 */
;(function( $ )
{
    var bidx                    = window.bidx
    ,   api                     = bidx.api
    ,   mentorRelationships     = {}
    ,   baseUrl                 = "/api/v1/entity/%id%/mentor"
    ,   fetchUrl                = "/api/v1/members/%id%/relationships"
    ,   memberFetchUrl          = "/api/v1/members/%id%/mentor"
    ,   params                  = []
    ;

    mentorRelationships.create = function( params )
    {
        var method  = "POST"
        ,   url     = baseUrl
                        .replace( "%id%", params.entityid )
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

    mentorRelationships.get = function( params )
    {
        var method = "GET"
        ,   url    = memberFetchUrl.replace( "%id%", params.requesterId )
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

    mentorRelationships.fetch = function( params )
    {
        var method = "GET"
        ,   url    = fetchUrl.replace( "%id%", params.requesterId )
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

    mentorRelationships.mutate = function( params )
    {
        var method  = "PUT"
        ,   url     = baseUrl.replace( "%id%", params.requesterId )
        ;

        api._call(
        {
            method:                 method
        ,   groupDomain:            params.groupDomain
        ,   extraUrlParameters:     params.extraUrlParameters
        ,   baseUrl:                url

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



    api.mentorRelationships = mentorRelationships;
} )( jQuery );
