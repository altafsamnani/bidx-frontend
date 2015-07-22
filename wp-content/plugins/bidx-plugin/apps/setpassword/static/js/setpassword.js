/* global bidx */
;( function ( $ )
{
    "use strict";

    var $element                    = $( "#setpassword" )       // setpassword form state
    ,   $feedback                   = $( "#feedback" )          // feedback state
    ,   $body                       = $( "body" )
    ,   $views                      = $feedback.find( ".view" )
    ,   $frmCredentials             = $element.find( "#frmCredentials" )
    ,   $savePassword               = $frmCredentials.find( ":submit" )
    ,   bidx                        = window.bidx
    ,   appName                     = "setpassword"
    ,   location
    ;

    // private functions

    function _oneTimeSetup()
    {


        // set validation and submitHandler
        //
        $frmCredentials.validate(
        {
            ignore: ":hidden"
        ,   debug:  false
        ,   rules:
            {

                "newPassword":
                {
                    required:               true
                ,   minlength:              5
                }
            ,   "newPasswordRepeat":
                {
                    required:               true
                ,   equalTo:               "[name=newPassword]"
                ,   minlength:              5
                }

            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already

            }
        ,   submitHandler:  function()
            {
                if ( $savePassword.hasClass( "disabled" ) )
                {
                    bidx.utils.log("button disabled");
                    return;
                }

                $savePassword.addClass( "disabled" );

                _doSave(
                {
                    error: function( jqXhr )
                    {
                        $savePassword.removeClass( "disabled" );
                    }
                } );
            }
        } );


    }
    // generic view function. Hides all views and then shows the requested view. In case State argument is passed in, it will be used to show the title tag of that view
    //
    function _showView( view, state )
    {
        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();

        //  show title of the view if available
        //
        if( state )
        {
            $view.find( ".title" ).hide().filter( bidx.utils.getViewName( state, "title" ) ).show();
        }
    }

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    function _doSave()
    {
        var extraUrlParameters =
        [
            {
                label :     "password",
                value :     $frmCredentials.find( "[name='newPassword']" ).val()
            },
            {
                label :     "activationToken",
                value :     window.location.href.split( "=" )[1].split("/")[0] // get the activationCode from Address Bar
            }
        ];

        bidx.api.call(
            "memberSetpassword.set"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   extraUrlParameters:     extraUrlParameters
            ,   success:        function( response )
                {
                    bidx.utils.log( "member.passwordset ", response );

                    _getSession();

                }
            ,   error:          function( jqXhr )
                {
                    var response = $.parseJSON( jqXhr.responseText )
                    ,   status = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                    ;

                    reset();
                    document.location.href= "/setpassword/#setpassword/error";
                    _showError( "Something went wrong changing the password: (" + status + ") " + response.code );
                }
            }
        );
    }

    function _getSession()
    {
        var session;

        bidx.api.call(
            "session.fetch"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   success:        function( response )
                {
                    bidx.utils.log( "session.fetch ", response );

                    if ( $.isEmptyObject(response.entities ) )
                    {
                        document.location.href= "/setpassword/#setpassword/role";
                    }
                    else
                    {
                        document.location.href= "/setpassword/#setpassword/done";
                    }
                }
            ,   error:          function( jqXhr )
                {
                    var response = $.parseJSON( jqXhr.responseText )
                    ,   status = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                    ;

                    document.location.href= "/setpassword/#setpassword/error";
                    _showError( "Something went wrong changing the password: (" + status + ") " + response.code );
                }
            }
        );
    }

    // reset the form
    //
    function reset()
    {
        $frmCredentials.find( ":input" ).each( function()
        {
            $( this ).val( "" );
        } );
        $savePassword.removeClass( "disabled" );
    }


    // ROUTER

    var state;

    var navigate = function( options )
    {
        bidx.utils.log("routing of setPassword", options );

        switch ( options.state )
        {
            case "expired":
                _showView( "expired" );
            break;
            case "done":
                _showView( "done" );
            break;
            case "role":
                _showView( "role" );
            break;
            default:
                _showView( "error" );
        }
    };

    //expose
    var app =
    {
        navigate:               navigate
    ,   $element:               $element
    ,   reset:                  reset
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }


    window.bidx.setpassword = app;

    // Initialize handlers
    _oneTimeSetup();

    // Only update the hash when user is authenticating and when there is no hash defined
    //
    // if ( $( "body.bidx-account" ).length && !bidx.utils.getValue(window, "location.hash" ) )
    // {

    //     // if there is a hash defined in the window scope, nagivate to this has
    //     //
    //     if ( bidx.utils.getValue( window, "__bidxHash" ) )
    //     {
    //         bidx.utils.log(document.location);
    //         document.location.hash = window.__bidxHash;
    //     }
    //     // load default
    //     //
    //     else
    //     {
    //         document.location.hash = "#account";
    //     }

    // }


} ( jQuery ));
