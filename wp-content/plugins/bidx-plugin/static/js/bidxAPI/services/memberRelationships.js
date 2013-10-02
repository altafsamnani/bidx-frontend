/**
 * @version 1.0
 * @author adebree
 * @author msp
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   memberRelationships  = {}
    ,   baseUrl = "/api/v1/members/relationships"
    ,   params  = []
    ;

    memberRelationships.fetch = function( params )
    {
        var method = "GET"
        ;


        api._call(
        {
            method:                     method
        ,   groupDomain:                params.groupDomain
        ,   baseUrl:                    baseUrl
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

 /*   memberRelationships.save = function( params )
    {
        var method = params.memberId ? "PUT" : "POST"
        ,   url     = baseUrl.replace( "%requesterId%", params.requesterId ) + "/" + params.requesteeId
        ;

        //to be finished later
        //api._call(....
    };

    memberRelationships.destroy = function( params )
    {
        var method = "DELETE"
        ,   url     = baseUrl.replace( "%requesterId%", params.requesterId ) + "/" + params.requesteeId
        ;

        //to be finished later
        //api._call(...
    };*/


    api.memberRelationships = memberRelationships;
} )( jQuery );
