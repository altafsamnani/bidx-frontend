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
                    ,   error:          function( jqXhr )
                        {
                            params.error( jqXhr );
                            bidx.common.closeNotifications();
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
} ( jQuery ));
