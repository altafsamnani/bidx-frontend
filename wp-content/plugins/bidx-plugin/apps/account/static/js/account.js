;( function ( $ )
{
    var $element                    = $( "#register" )
    ,   $frmRegister                = $element.find( "#frmRegister" )
    ,   $btnRegister                = $frmRegister.find( ":submit" )
    ,   bidx                        = window.bidx
    ,   appName                     = "account"
    ,   location
    ;

    // private functions

    var _oneTimeSetup = function()
    {

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
        bidx.utils.log("routing of Account", options );




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


    window.bidx.account = app;

    // Initialize handlers
    _oneTimeSetup();

    // Only update the hash when user is authenticating and when there is no hash defined
    //
    if ( $( "body.bidx-account" ).length && !bidx.utils.getValue(window, "location.hash" ) )
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
            document.location.hash = "#account";
        }

    }


} ( jQuery ));
