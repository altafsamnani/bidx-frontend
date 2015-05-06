/**
 * @version 1.0
 * @author adebree
 * @author msp
 */
;(function( $ )
{
    var bidx                    = window.bidx
    ,   api                     = bidx.api
    ,   accreditation                = {}
    ,   baseUrl                 = "/api/v1/entity/%id%"
    ,   tagUrl                  = "/api/v1/tag"
    ,   params                  = []
    ;

    accreditation.getAssignedTags = function( params )
    {
        var url
        ,   method  = "GET"
        ;

        url =   baseUrl + '/tags';

        url     = url.replace( "%id%", params.id )
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

    accreditation.assignTags = function( params )
    {
        var url
        ,   method  = "POST"
        ;

        url =   baseUrl + '/tags';

        url     = url.replace( "%id%", params.id )
        ;

        api._call(
        {
            method:                 method
        ,   groupDomain:            params.groupDomain
        ,   baseUrl:                url
        ,   data:                   params.data
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

    accreditation.getOptions = function( params )
    {
        var url
        ,   method  = "GET"
        ;

        url =   baseUrl + '/tagoptions';

        url     = url.replace( "%id%", params.id )
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

    accreditation.getTags = function( params )
    {
        var method  = "GET"
        ;

        api._call(
        {
            method:                 method
        ,   groupDomain:            params.groupDomain
        ,   baseUrl:                tagUrl
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

    accreditation.createTags = function( params )
    {
        var method  = "POST"
        ;

        api._call(
        {
            method:                 method
        ,   groupDomain:            params.groupDomain
        ,   baseUrl:                tagUrl
        ,   data:                   params.data
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

    api.accreditation = accreditation;

} )( jQuery );
