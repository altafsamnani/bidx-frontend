/**
 * @version 1.0
 * @author msp
 */
;(function( $ )
{
    var bidx            = window.bidx
    ,   api             = bidx.api
    ,   groupMembers    = {}
//    ,   baseUrl         = "/api/v1/groups/%groupId%/member"
    ,   baseUrl         = "/api/v1/search"
    ,   params          = []
    ;

    groupMembers.fetch = function( params )
    {
        var method = "GET"
        ,   url     = baseUrl
        ;

        api._call(
        {
            method:                     method
        ,   groupDomain:                params.groupDomain
        ,   baseUrl:                    url
        ,   extraUrlParameters:         params.extraUrlParameters

        ,   success: function( response, textStatus, jqXhr )
            {
                if ( response && response.data )
                {
                    response = response.data;
                }

                params.success( response, textStatus, jqXhr );
            }
        ,   error: function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };



    api.groupMembers = groupMembers;
} )( jQuery );
