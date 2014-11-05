/**
 * @version 1.0
 * @author adebree
 * @author msp
 */
;(function( $ )
{
    var bidx                    = window.bidx
    ,   api                     = bidx.api
    ,   feedback                = {}
    ,   baseUrl                 = "/api/v1/entity/%id%/feedback"
    ,   fetchUrl                = "/api/v1/members/%id%/relationships"
    ,   params                  = []
    ;

    feedback.create = function( params )
    {
        var method  = "POST"
        ,   url     = baseUrl
                        .replace( "%id%", params.id )
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

    feedback.fetch = function( params )
    {
        var method = "GET"
        ,   url    = baseUrl.replace( "%id%", params.id )
        ;


        api._call(
        {
            method:                     method
        ,   groupDomain:                params.groupDomain
        ,   baseUrl:                    url
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

    feedback.mutate = function( params )
    {
        var method  = "PUT"
        ,   url     = baseUrl.replace( "%id%", params.id )
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

    feedback.cancel = function( params )
    {
        var method  = "DELETE"
        ,   url     = baseUrl.replace( "%id%", params.id )
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



    api.feedback = feedback;
} )( jQuery );
