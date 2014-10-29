/**
 * Rank and Review user sessions.
 *
 * A user session has a list of entities that first need to be rated in a
 * given order, and then need to be ranked. A user session is created for
 * a specific user by the backend; a user cannot create their own review
 * session.
 *
 * @version 1.0
 */
;(function( $ )
{
    var bidx                    = window.bidx
    ,   api                     = bidx.api
    ,   reviewSession           = {}
    ,   baseUrl                 = "/api/v1/review/session/%id%"
    ,   rateUrl                 = baseUrl + "/rate"
    ,   rankUrl                 = baseUrl + "/rank"
    ,   nextUrl                 = baseUrl + "/next"
    ;

    reviewSession.fetch = function( params )
    {
        _call( "GET", baseUrl, params );
    };

    reviewSession.next = function( params )
    {
        _call( "POST", nextUrl, params );
    };

    reviewSession.rate = function( params )
    {
        _call( "POST", rateUrl, params );
    };

    reviewSession.rank = function( params )
    {
        _call( "POST", rankUrl, params );
    };

    // Debug/testing only; support in API will be removed, some day.
    reviewSession.debugReset = function( params )
    {
        _call( "PUT", baseUrl + "/debug/reset", params );
    };

    // Calls the review API, assuming params.groupDomain,
    // params.reviewUserSessionId, params.data and so on.
    //
    _call = function ( method, url, params )
    {
        api._call(
        {
            method:         method
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        url.replace( "%id%", params.reviewUserSessionId )
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
    }

    api.reviewSession = reviewSession;
} )( jQuery );
