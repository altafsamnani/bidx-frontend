/**
 * @version 1.0
 * @author adebree
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   member  = {}
    ,   baseUrl = "/api/v1/members"
    ,   params  = []
    ;

    member.fetch = function( params )
    {
        var method = "GET";

        api._call(
        {
            method:         method
        ,   id:             params.memberId
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
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
        var method = "DELETE";

        api._call(
        {
            method:         method
        ,   id:             params.memberId
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        baseUrl
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
        var method = params.memberId ? "PUT" : "POST";

        var url = baseUrl;

        // Creation must be done via the Entity API..
        //
        if ( method === "POST" )
        {
            url = "/api/v1/entity";
        }


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
