/* global bidx */
;( function( $ )
{
    "use strict";


    // ROUTER
    //
    function navigate( options )
    {


        switch ( options.requestedState )
        {

            case "edit" :

                var    memberId        = bidx.utils.getValue( bidxConfig, "session.id" )
                ,      preferenceData  = {
                                            "bidxMeta":{
                                                "bidxEntityType":"bidxMemberProfile"
                                            },
                                            "userPreferences":{
                                                "firstLoginUrl":"",
                                                "firstLoginGroup":""
                                            }
                                         };
                bidx.api.call(
                    "member.save"
                ,   {
                        memberId:       memberId
                    ,   groupDomain:    bidx.common.groupDomain
                    ,   data:           preferenceData
                    ,   success:        function( response )
                        {
                            bidx.utils.log( "member.save::success::response", response );

                        }
                    ,   error: function( jqXhr )
                        {
                            var response;

                            try
                            {
                                // Not really needed for now, but just have it on the screen, k thx bye
                                //
                                response = JSON.stringify( JSON.parse( jqXhr.responseText ), null, 4 );
                            }
                            catch ( e )
                            {
                                bidx.utils.error( "problem parsing error response from member preference saving" );
                            }

                            bidx.common.notifyError( "Something went wrong during save: " + response );

                        }
                    }
                );
                break;
        }
    }




    // Expose
    //
    var app =
    {
        navigate:                   navigate

        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.content = app;

    // if hash is empty and there is not path in the uri, load #home
    //
    if ($("body.logged-in").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        window.location.hash = "#editPreference";
    }

} ( jQuery ));
