;( function ( $ )
{
    "use strict";

    var $element                    = $( "#login" )
    ,   $frmLogin                   = $element.find( "#frmLogin" )
    ,   $btnLogin                   = $frmLogin.find( ":submit" )
    ,   $loginErrorMessage          = $frmLogin.find( ".error-separate" )
    ,   bidx                        = window.bidx
    ,   appName                     = "login"
    ,   currentView
    ,   submitBtnLabel
    ,   submitI18nLabel
    ;

    // private functions
    //
    function _initHandlers()
    {
        // set validation and submitHandler
        //
        $frmLogin.validate(
        {
             debug:  false
        ,    rules:
            {
                log:
                {
                    required:               true
                ,   email:                  true
                }
            ,   pwd:
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

                /*submitI18nLabel = bidx.i18n.i( "btnPleaseWait" );
                $btnLogin.text( submitI18nLabel );*/

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
    }

    // handle the login proces, fired by the validator when form is validated
    //
    function _doLogin( params )
    {
        bidx.api.call(
            "auth.login"
        ,   {
                data:       $frmLogin.find(":input:not(.ignore)").serialize()

            ,   success: function( response, textStatus, jqXHR )
                {
                    var errorText
                    ;
                    if ( response )
                    {
                        if ( response.status === 'OK' )
                        {
                            //if (response.redirect)
                            //{
                                var iclVars         =   window.icl_vars || {}
                                ,   loginRedirect   =   response.redirect
                                ;

                                if ( window.noty )
                                {
                                    var redirectText;

                                    redirectText = bidx.i18n.i( "msgWaitForRedirect" );
                                    bidx.utils.log('redirectText', redirectText);

                                    noty(
                                    {
                                        type:           "success"
                                    ,   text:           redirectText
                                    } );
                                }

                                if(!loginRedirect) // If there is no login redirect then use icl_home homepage variable
                                {
                                    loginRedirect   =   ( $.isEmptyObject(  iclVars.icl_home ) ) ? '/'  : iclVars.icl_home ; // get the current language from sitepress if set

                                }

                                bidx.utils.log('Redirecting to link ', loginRedirect);

                                document.location   =   loginRedirect;
                            //}
                        }
                        else if ( response.status === "ERROR")
                        {
                            errorText   =  bidx.i18n.i( response.code );

                            errorText   =  ( errorText ) ? errorText : response.text;

                            $loginErrorMessage.text( errorText ).show( );

                            params.error( jqXHR );
                        }
                    }
                     // response 0 means user is still logged into WP
                    else
                    {
                        if( response === 0 )
                        {
                            errorText   =  bidx.i18n.i( 'wordpressLoggedInError' );

                            $loginErrorMessage.text( errorText ).show();
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
    }

    // ROUTER
    //
    var state;

    function navigate( options )
    {
        bidx.utils.log("routing options", options );
    }

    // Expose
    //
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
    //
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
