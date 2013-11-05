;( function ( $ )
{
    var $element                    = $( "#login" )
    //,   $views                      = $element.find( ".view" )
    ,   $frmLogin                   = $element.find( "#frmLogin" )
    ,   $btnLogin                   = $frmLogin.find( ":submit" )
    ,   $loginErrorMessage          = $frmLogin.find( ".error-separate" )
    ,   bidx                        = window.bidx
    ,   appName                     = "login"
    ,   currentView
    ,   submitBtnLabel
    ;



    // private functions

    var _initHandlers = function()
    {


        // set validation and submitHandler
        //
        $frmLogin.validate(
        {
             debug:  false
        ,    rules:
            {
                "log":
                {
                    required:               true
                ,   email:                  true
                }
            ,   "pwd":
                {
                    required:               true
                }

            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler:  function()
            {


                if ( $btnLogin.hasClass( "disabled" ) )
                {
                    return;
                }
                // set button to disabled and set Wait text. We store the current label so we can reset it when an error occurs
                //
                $btnLogin.addClass( "disabled" );
                submitBtnLabel = $btnLogin.text();
                $btnLogin.i18nText("btnPleaseWait");

                $loginErrorMessage.text( "" ).hide();

                _doLogin(
                {
                    error: function( jqXhr )
                    {
                        $btnLogin.removeClass( "disabled" )
                            .text( submitBtnLabel )
                        ;

                    }
                } );

            }
        } );



    };



    // this is the callback the is passed to the validator. I have borrowed heavily from the remote method in handling of the success/error response
    //
/*    var _validateUsernameApi = function( value, element, param )
    {
        bidx.utils.log("I am called");
    };*/

    // handle the login proces, fired by the validator when form is validated
    //
    var _doLogin = function( params )
    {


        bidx.api.call(
            "auth.login"
        ,   {

                data:       $frmLogin.find(":input:not(.ignore)").serialize()


            ,   success: function( response, textStatus, jqXHR )
                {

                    if ( response )
                    {
                        if ( response.status === 'OK' )
                        {
                            if (response.redirect)
                            {

                                if ( window.noty )
                                {
                                    var redirectText;
                                    bidx.i18n.getItem( "msgWaitForRedirect", function( err, label )
                                    {
                                        redirectText = label;

                                    } );

                                    noty(
                                    {
                                        type:           "success"
                                    ,   text:           redirectText
                                    } );
                                }

                                document.location=response.redirect;
                            }
                        }
                        else if ( response.status === "ERROR")
                        {
                            $loginErrorMessage.text( response.text).show();

                            params.error( jqXHR );
                        }
                    }
                     // response 0 means user is still logged into WP
                    else
                    {
                        if( response === 0 )
                        {
                            $loginErrorMessage.text( "Please log out of Wordpress administrator").show();
                        }
                        params.error( jqXHR );
                    }
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

        //_showView( "login" );


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


    window.bidx.login = app;

    // Initialize handlers
    _initHandlers();

    // Only update the hash when user is authenticating and when there is no hash defined
    //
    if ( ($( "body.bidx-login" ).length || $( "body.bidx-sso-authentication" )) && !bidx.utils.getValue( window, "location.hash" ) )
    {
        document.location.hash = "#login";
    }

    // if there is a hash defined in the window scope, nagivate to this has
    //
    if ( bidx.utils.getValue( window, "__bidxHash" ) )
    {
        document.location.hash = window.__bidxHash;
    }



} ( jQuery ));
