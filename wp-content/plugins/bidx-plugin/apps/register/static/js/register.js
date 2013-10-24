;( function ( $ )
{
    var $element                    = $( "#register" )
    ,   $frmRegister                = $element.find( "#frmRegister" )
    ,   $btnRegister                = $frmRegister.find( ":submit" )
    ,   bidx                        = window.bidx
    ,   appName                     = "register"
    ,   userPreferences             = {}
    ,   location
    ;

    // private functions

    var _initHandlers = function()
    {

        // enable location plugin
        //
        $frmRegister.find( "[data-type=location]"   ).bidx_location(
        {
            showMap:                false
        } );


        // set validation and submitHandler
        //
        $frmRegister.validate(
        {
            ignore: ":hidden"
        ,   debug:  false
        ,   rules:
            {
                "personalDetails.firstName":
                {
                    required:               true
                }
            ,   "personalDetails.lastName":
                {
                    required:               true
                }
            ,   "username":
                {
                    required:               true
                ,   email:                  true
                ,   remoteBidxApi:
                    {
                        url:                "validateUsername.fetch"
                    ,   paramKey:           "username"

                    }

                }
            ,   "location":
                {
                    bidxLocationRequired:               true
                ,
                }

            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler:  function()
            {
                if ( $btnRegister.hasClass( "disabled" ) )
                {
                    bidx.utils.log("button disabled");
                    return;
                }

                $btnRegister.addClass( "disabled" );

                _doRegister(
                {
                    error: function( jqXhr )
                    {
                        $btnRegister.removeClass( "disabled" );
                    }
                } );
            }
        } );


    };


    var _doRegister = function( porams )
    {

        // Build up the data for the member request
        //
        var member =
            {
                emailAddress:                   $frmRegister.find( "[name='username']" ).val()
            ,   personalDetails:
                    {
                        firstName:              $frmRegister.find( "[name='personalDetails.firstName']" ).val()
                    ,   lastName:               $frmRegister.find( "[name='personalDetails.lastName']" ).val()
                    }
            ,   userPreferences:                userPreferences
            }
        ,   $location   = $frmRegister.find( "[name='location']" )
        ;

        // fetch the address from the location plugin
        //
        if ( $location.val() )
        {
            member.personalDetails.address =
            [
                 $location.bidx_location( "getLocationData" )
            ];
        }


        bidx.api.call(
            "member.save"
        ,   {
                groupDomain:    bidx.common.groupDomain
            ,   data:           member
            ,   success:        function( response )
                {
                    bidx.utils.log( "member.save::success::response", response );

                    // Go to group dashboard
                    //
                    var $urlparam = $frmRegister.find( "[name='urlparam']" );

                    $frmRegister.hide();
                    $element.find( ".registerSuccess" ).removeClass( "hide" );

                }
            ,   error:          function( jqXhr )
                {
                    $btnRegister.removeClass( "disabled" );

                    alert( "Problem while registering" );
                }
            }
        );
    };



    // generic view function. Hides all views and then shows the requested view
    //
/*    var _showView = function( view )
    {

        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();

    };*/

    // ROUTER

    var state;

    var navigate = function( options )
    {
        bidx.utils.log("routing of Register", options );

        if(  options.params && options.params.firstLogin )
        {
            bidx.utils.setValue( userPreferences, "firstLoginUrl", options.params.firstLogin );
            bidx.utils.setValue( userPreferences, "firstLoginGroup", bidxConfig.groupName );
            bidx.utils.log(userPreferences);
        }


     //   _showView( "register" );


    };

    //expose
    var app =
    {
        navigate:               navigate
    ,   $element:               $element
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }


    window.bidx.register = app;

    // Initialize handlers
    _initHandlers();

    // Only update the hash when user is authenticating and when there is no hash defined
    //
    if ( $( "body.bidx-register" ).length && !bidx.utils.getValue(window, "location.hash" ) )
    {

        // if there is a hash defined in the window scope, nagivate to this has
        //
        if ( bidx.utils.getValue( window, "__bidxHash" ) )
        {
            bidx.utils.log(document.location);
            document.location.hash = window.__bidxHash;
        }
        // load default
        //
        else
        {
            document.location.hash = "#register";
        }

    }


} ( jQuery ));
