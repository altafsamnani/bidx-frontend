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
    ,   mentorUrl               = "/api/v1/mentor/%id%"
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

    mentorRelationships.getEntityForUser = function( params )
    {
        var method  = "GET"
        ,   url     = baseUrl.replace( "%id%", params.id )
        ;

        api._call(
        {
            method:             method
        ,   groupDomain:        params.groupDomain
        ,   baseUrl:            url
        ,   extraUrlParameters: params.extraUrlParameters
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

    mentorRelationships.getEntity = function( params )
    {
        var method  = "GET"
        ,   url     = baseUrl.replace( "%id%", params.id )
        ;

        api._call(
        {
            method:             method
        ,   groupDomain:        params.groupDomain
        ,   baseUrl:            url
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

    mentorRelationships.get = function( params )
    {
        var method = "GET"
        ,   url    = memberFetchUrl.replace( "%id%", params.id )
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

    mentorRelationships.fetch = function( params ) /* remove later */
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
        ,   url     = mentorUrl.replace( "%id%", params.requestId )
        ;

        api._call(
        {
            method:                 method
        ,   groupDomain:            params.groupDomain
        ,   data:                   params.data
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

    mentorRelationships.cancel = function( params )
    {
        var method  = "DELETE"
        ,   url     = mentorUrl.replace( "%id%", params.requestId )
        ;

        api._call(
        {
            method:                 method
        ,   groupDomain:            params.groupDomain
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
