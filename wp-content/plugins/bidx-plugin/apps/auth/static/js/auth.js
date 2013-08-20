;( function ( $ )
{
    var $element                    = $( "#auth" )
    ,   $views                      = $element.find( ".view" )
    ,   $frmLogin                   = $views.filter( ".viewLogin" ).find( "form" )
    ,   $frmPasswordReset           = $views.filter( ".viewResetpassword" ).find( "form" )
    ,   $frmRegister                = $views.filter( ".viewRegister" ).find( "form" )
    ,   $btnLogin                   = $frmLogin.find( ":submit" )
    ,   $btnPasswordReset           = $frmPasswordReset.find( ":submit" )
    ,   $btnRegister                = $frmRegister.find( ":submit" )
    ,   $loginErrorMessage          = $frmLogin.find( ".error_separate" )
    ,   bidx                        = window.bidx
    ,   appName                     = "auth"
    ,   currentView
    ;



    // private functions

    var _initHandlers = function()
    {

        // Initialise form and enable validation
        //

        /*$frmLogin.form(
        {
            callToAction: '.jsLogin',
            errorClass: 'error',
            url: '/wp-admin/admin-ajax.php?action=bidx_signin'
        } );*/

        var $validator = $frmLogin.validate(
        {
            rules:
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

                $btnLogin.addClass( "disabled" );
                $loginErrorMessage.text( "" ).hide();

                _doLogin(
                {
                    error: function( jqXhr )
                    {
                        $btnLogin.removeClass( "disabled" );
                    }
                } );
                /*_save(
                {
                    error: function( jqXhr )
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
                            bidx.utils.error( "problem parsing error response from memberProfile save" );
                        }

                        bidx.common.notifyError( "Something went wrong during save: " + response );

                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                    }
                } );*/
            }
        } );



        // initialize form and enable plugins
        //
        $frmRegister.form(
        {
                errorClass : 'error',
                enablePlugins: ['location','countryAutocomplete']
        } );

        // bind the submithandler to the passwordReset form.
        //
        $frmPasswordReset.submit(function(e)
        {
            e.preventDefault();

            $btnPasswordReset.addClass("disabled");

            bidx.api.call(
                "resetpassword.save"
            ,   {
                    groupDomain: bidx.common.groupDomain
                ,   data:
                    {
                        username: $frmPasswordReset.find( "[ name='username' ]" ).val()
                    }

                ,   success: function( response )
                    {
                        bidx.utils.log("resetpassword.save::success::response", response);

                        // Go to group dashboard
                        //

                        $frmPasswordReset.hide();
                        $views.filter( ".viewResetpassword" ).find(".resetpasswordSuccess").removeClass("hide");

                        //                          window.location.href = url;
                    }

                ,   error: function(jqXhr)
                    {
                        bidx.utils.log( "error", jqXhr );

                        $btnPasswordReset.removeClass( "disabled" );

                        alert( "A problem occured while reseting the password" );
                    }
                }
            );
        } );



        // bind the register form submit handler
        //
        $frmRegister.submit( function( e )
        {
            currentView = $views.filter( ".viewRegister" );
            e.preventDefault();

            var valid = $frmRegister.form( "validateForm" );

            if ( !valid || $btnRegister.hasClass( "disabled" ) )
            {
                    return;
            }

            $btnRegister.addClass( "disabled" );

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
            };

            // Currently, address is required, so this is a bit of an unlogical test. Wouldn't be surprised it will
            // be gone
            //
            if ( $frmRegister.find( "[name='address']" ).val() )
            {
                // Finding the hidden fields is a hack, just search for the fields *ENDING* with names we are looking for
                // Just to not have to change the location.js plugin
                //
                member.personalDetails.address =
                [
                        {
                            coordinates:            $frmRegister.find( "[name$=location]" ).val()
                        ,   postalCode:             $frmRegister.find( "[name$=postalCode]" ).val()
                        ,   country:                $frmRegister.find( "[name$=country]" ).val()
                        ,   cityTown:               $frmRegister.find( "[name$=cityTown]" ).val()
                        ,   neighborhood:           $frmRegister.find( "[name$=neighborhood]" ).val()
                        ,   streetNumber:           $frmRegister.find( "[name$=streetNumber]" ).val()
                        ,   street:                 $frmRegister.find( "[name$=street]" ).val()
                        }
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


                        $frmRegister.hide();
                        currentView.find( ".registerSuccess" ).removeClass( "hide" );
                        var urlparam = currentView.find("[name=urlparam]").length ? currentView.find("[name=urlparam]").val() : "";
                        var url = window.location.protocol + "//" + window.location.host + "?smsg=4&rs=true&sparam=" + urlparam;
                        window.location.href = url;
                    }
                ,   error:          function( jqXhr )
                    {
                        $btnRegister.removeClass( "disabled" );

                        alert( "Problem while registering" );
                    }
                }
            );

        } );
    };

    // handle the login proces, fired by the validator when form is validated
    //
    var _doLogin = function( params )
    {
        $.ajax(
        {
            type:       'post'
        ,   url:        '/wp-admin/admin-ajax.php?action=bidx_signin'
        ,   dataType:   'json'
        ,   data:       $frmLogin.find(":input:not(.ignore)").serialize() //+ "&apiurl=" + options.apiurl +  "&apimethod=" + options.apimethod

        ,   success:     function( data, textStatus, jqXHR )
            {
                bidx.utils.log(data);

                if ( data )
                {
                    if (data.status === 'OK')
                    {
                        if (data.redirect)
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

                            document.location=data.redirect;
                        }
                    }
                    else if ( data.status === "ERROR" )
                    {
                        $loginErrorMessage.text( data.text).show();

                        params.error( jqXHR );
                    }
                }


            }
        ,   error:      function( jqXhr )
            {
                params.error( jqXhr );
            }
        } );
//
    };

    // This function prepares the form so that the user can trigger the submit
    //
    var _initResetPasswordForm = function()
    {
        $btnPasswordReset.removeClass( "disabled" );

    };

    // generic view function. Hides all views and then shows the requested view
    //
    var _showView = function( view )
    {

        var $view = $views.hide().filter( bidx.utils.getViewName( view ) ).show();

    };


    // ROUTER

    var state;

    var navigate = function( options )
    {
        bidx.utils.log("routing options", options );



        switch ( options.section )
        {
            case "resetpassword" :

                _showView( "resetpassword" );

            break;

            case "register" :

                _showView( "register" );

            break;

            default:

                _showView( "login" );

        }
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


    window.bidx.auth = app;

    // Initialize handlers
    _initHandlers();

    // Only update the hash when user is authenticating and when there is no hash defined
    //
    if ( $( "body.bidx-authentication" ).length && !bidx.utils.getValue(window, "location.hash").length )
    {
        document.location.hash = "#auth/login";
    }



} ( jQuery ));
