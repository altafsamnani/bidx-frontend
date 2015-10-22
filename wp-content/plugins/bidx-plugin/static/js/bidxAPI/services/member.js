/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   member  = {}
    ,   baseUrl = "/api/v1/members/%id%"
    ,   params  = []
    ;

    member.fetch = function( params )
    {
        var method = "GET"
        ,   url    = baseUrl
        ;

        if ( params.requesteeId )
        {
            url    = baseUrl.replace( "%id%", params.requesteeId );
        }
        else
        {
            url    = baseUrl.replace( "/%id%", "" );
        }

        api._call(
        {
            method:         method
        ,   id:             params.memberId
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        url
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

    member.summaries = function( params )
    {
        var method = "POST"
        ,   url    = "/api/v1/members/summaries"
        ;

        api._call(
        {
            method:         method
        ,   data:           params.data
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        url
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


    member.destroy = function( params )
    {
        var method = "DELETE"
        ,   url    = baseUrl.replace( "/%id%", "" )
        ;

        api._call(
        {
            method:         method
        ,   id:             params.memberId
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
        } );
    };

    member.save = function( params )
    {
        var method = params.memberId ? "PUT" : "POST"
        ,   url    = baseUrl.replace( "/%id%", "" )
        ;

        api._call(
        {
            method:         method
        ,   id:             params.memberId
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

    api.member = member;
} )( jQuery );
