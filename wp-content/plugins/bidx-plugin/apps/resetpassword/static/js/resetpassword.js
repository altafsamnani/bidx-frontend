;( function ( $ )
{
    var $element                    = $( "#resetpassword" )
//    ,   $views                      = $element.find( ".view" )
    ,   $frmResetpassword           = $element.find( "#frmResetpassword" )
    ,   $btnResetpassword           = $frmResetpassword.find( ":submit" )
    ,   $resetpasswordSuccess       = $element.find( ".resetpasswordSuccess" )
    ,   $loginErrorMessage          = $frmResetpassword.find( ".error-separate" )
    ,   bidx                        = window.bidx
    ,   appName                     = "resetpassword"
    ,   submitBtnLabel
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

                // set button to disabled and set Wait text. We store the current label so we can reset it when an error occurs
                //
                $btnResetpassword.addClass( "disabled" );
                submitBtnLabel = $btnResetpassword.text();
                $btnResetpassword.i18nText("btnPleaseWait");

                $loginErrorMessage.text( "" ).hide();

                _doResetPassword(
                {
                    error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText);

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            $loginErrorMessage.i18nText( response.code, appName ).show();

                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            $loginErrorMessage.text( response.text ).show();
                        }

                        $btnResetpassword.removeClass( "disabled" )
                            .text( submitBtnLabel )
                        ;
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

                    // show success message
                    //
                    $frmResetpassword.hide();
                    $resetpasswordSuccess.show();
                }

            ,   error:  function( jqXhr, textStatus )
                {
                    params.error( jqXhr, textStatus );
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
