;( function ( $ )
{
    var $element                    = $( "#resetpassword" )
//    ,   $views                      = $element.find( ".view" )
    ,   $frmResetpassword                   = $element.find( "#frmResetpassword" )
    ,   $btnResetpassword                   = $frmResetpassword.find( ":submit" )
    ,   bidx                        = window.bidx
    ,   appName                     = "resetpassword"
    ,   currentView
    ;



    // private functions

    var _initHandlers = function()
    {

        // set validation and submitHandler
        //
        $frmResetpassword.validate(
        {
             debug:  false
        ,    rules:
            {
                "username":
                {
                    required:               true
                ,   email:                  true
                }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler:  function()
            {
                if ( $btnResetpassword.hasClass( "disabled" ) )
                {
                    bidx.utils.log("button disabled");
                    return;
                }

                $btnResetpassword.addClass( "disabled" );
                $loginErrorMessage.text( "" ).hide();

                _doResetPassword(
                {
                    error: function( jqXhr )
                    {
                        $btnResetpassword.removeClass( "disabled" );
                    }
                } );

            }
        } );


    };



    var _doResetPassword = function( params )
    {
        bidx.api.call(
            "resetpassword.save"
        ,   {
                groupDomain: bidx.common.groupDomain
            ,   data:
                {
                    username: $frmResetpassword.find( "[ name='username' ]" ).val()
                }

            ,   success: function( response )
                {
                    bidx.utils.log("resetpassword.save::success::response", response);

                    // Go to group dashboard
                    //

                    $frmResetpassword.hide();
                    $element.find(".resetpasswordSuccess").removeClass("hide");

                    //                          window.location.href = url;
                }

            ,   error:  function( jqXhr )
                {

                    params.error( "Error", jqXhr );
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
        bidx.utils.log("routing options", options );

     //   _showView( "login" );


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


    window.bidx.resetpassword = app;

    // Initialize handlers
    _initHandlers();

    // Only update the hash when user is authenticating and when there is no hash defined
    //

    if ( $( "body.bidx-resetpassword" ).length && !bidx.utils.getValue( window, "location.hash" ) )
    {

        document.location.hash = "#resetpassword";
    }

    // if there is a hash defined in the window scope, nagivate to this has
    //
    if ( bidx.utils.getValue( window, "__bidxHash" ) )
    {
        document.location.hash = window.__bidxHash;
    }



} ( jQuery ));
