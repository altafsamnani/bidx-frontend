;( function ( $ )
{
    "use strict";

    var $element                    = $( "#account" )
    ,   $views                      = $element.find( ".view" )
    ,   $frmCredentials             = $element.find( "#frmCredentials" )
    ,   $btnUpdateCredentials       = $frmCredentials.find( ":submit" )
    ,   bidx                        = window.bidx
    ,   appName                     = "account"
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
                "currentPassword":
                {
                    required:               true
                ,   remoteBidxApi:
                    {
                        url:                "memberValidatePassword.send"
                    ,   paramKey:           "password"
                    }
                }
            ,   "newPassword":
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
                if ( $btnUpdateCredentials.hasClass( "disabled" ) )
                {
                    bidx.utils.log("button disabled");
                    return;
                }

                $btnUpdateCredentials.addClass( "disabled" );

                _doPasswordChange(
                {
                    error: function( jqXhr )
                    {
                        $btnUpdateCredentials.removeClass( "disabled" );
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
        if( state )
        {
            $view.find( ".title").hide().filter( bidx.utils.getViewName( state, "title" ) ).show();
        }
    }

        // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }



    function _doPasswordChange()
    {

        // Build up the data for the member request
        //
        var postData =
        {
            username:                   bidx.common.getSessionValue( "username" )
        ,   password:                   $frmCredentials.find( "[name='currentPassword']" ).val()
        ,   newPassword:                $frmCredentials.find( "[name='newPassword']" ).val()
        };

        bidx.api.call(
            "memberChangepassword.update"
        ,   {
                groupDomain:    bidx.common.groupDomain
            ,   data:           postData
            ,   success:        function( response )
                {
                    bidx.utils.log( "member.save::success::response", response );

                    $btnUpdateCredentials.removeClass( "disabled" );
                    _showView( "credentialsChanged" );



                }
            ,   error:          function( jqXhr )
                {
                    var response = $.parseJSON( jqXhr.responseText )
                        status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;
                    ;

                    $btnUpdateCredentials.removeClass( "disabled" );

                    _showError( "Something went wrong changing the password: (" + status + ") " + response.code );

                }
            }
        );
    }


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




        _showView( "credentials" );


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
