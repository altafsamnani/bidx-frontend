( function( $ )
{
    var bidx            = window.bidx || {}
    ,   bidxConfig      = window.bidxConfig || {}
    ,   groupDomain     = bidx.utils.getValue( bidxConfig, "context.bidxGroupDomain" ) || bidx.utils.getGroupDomain()
    ,   $body           = $( "body" )
    ,   notifier
    ;

    // Search for any join group button on the page, on click, perform an API call to join the group and reload the page on success
    //
    $body.delegate( "a[href$=#joinGroup]", "click", function( e )
    {
        e.preventDefault();

        var $btn = $( this );

        if ( $btn.hasClass( "disabled" ))
        {
            return;
        }

        $btn.addClass( "disabled" );

        var groupId = $btn.data( "groupid" );

        if ( !groupId )
        {
            groupId = bidx.utils.getValue( bidxConfig, "session.currentGroup" );
        }

        joinGroup( groupId, function( err )
        {
            $btn.removeClass( "disabled" );

            if ( err )
            {
                alert( err );
            }
            else
            {
                bidx.common.notifyRedirect();

                var url = document.location.protocol
                    + "//"
                    + document.location.hostname
                    + ( document.location.port ? ":" + document.location.port : "" )
                    + "?smsg=2&rs=true"
                ;

                document.location.href = url;
            }
        });
    } );

    // Perform an API call to join the group
    //
    function joinGroup( groupId, cb )
    {
        if ( !bidx.utils.getValue( bidxConfig, "authenticated" ))
        {
            alert( "It is only possible to join a group when you are logged in" );
            return;
        }

        if ( !groupId )
        {
            alert( "No group id found in session. Unable to join!" );
            return;
        }

        bidx.api.call(
            "groupsJoin.save"
        ,   {
                groupId:            groupId
            ,   groupDomain:        groupDomain
            ,   success:            function( response )
                {
                    bidx.utils.log( "bidx::groupsJoin::save::success", response );

                    cb();
                }
            ,   error:            function( jqXhr, textStatus )
                {
                    bidx.utils.log( "bidx::groupsJoin::save::error", jqXhr, textStatus );

                    cb( new Error( "Problem joining group" ) );
                }
            }
        );
    }

    // Search for any join group button on the page, on click, perform an API call to join the group and reload the page on success
    //
    $body.delegate( "a[href$=#leaveGroup]", "click", function( e )
    {
        e.preventDefault();

        var $btn = $( this );

        if ( $btn.hasClass( "disabled" ))
        {
            return;
        }

        $btn.addClass( "disabled" );

        var groupId = $btn.data( "groupid" );

        if ( !groupId )
        {
            groupId = bidx.utils.getValue( bidxConfig, "session.currentGroup" );
        }

        leaveGroup( groupId, function( err )
        {
            $btn.removeClass( "disabled" );

            if ( err )
            {
                alert( err );
            }
            else
            {
                bidx.common.notifyRedirect();

                var url = document.location.protocol
                    + "//"
                    + document.location.hostname
                    + ( document.location.port ? ":" + document.location.port : "" )
                    + "?smsg=3&rs=true"
                ;

                document.location.href = url;
            }
        });
    } );

    // Perform an API call to join the group
    //
    function leaveGroup( groupId, cb )
    {
        if ( !bidx.utils.getValue( bidxConfig, "authenticated" ))
        {
            alert( "It is only possible to leave a group when you are logged in" );
            return;
        }

        if ( !groupId )
        {
            alert( "No group id found in session. Unable to leave!" );
            return;
        }

        bidx.api.call(
            "groupsLeave.save"
        ,   {
                groupId:            groupId
            ,   groupDomain:        groupDomain
            ,   success:            function( response )
                {
                    bidx.utils.log( "bidx::groupsLeave::save::success", response );

                    cb();
                }
            ,   error:            function( jqXhr, textStatus )
                {
                    bidx.utils.log( "bidx::groupsLeave::save::error", jqXhr, textStatus );

                    cb( new Error( "Problem leaving group" ) );
                }
            }
        );
    }

    // Search for any publish button on the page, on click, perform an API call to
    // publish the entity reload the page on success
    //
    $body.delegate( "a[href*='#publish/']", "click", function( e )
    {
        e.preventDefault();

        var $btn            = $( this )
        ,   missingFields   = $btn.data( "missingfields" )
        ;

        if ( missingFields && $.type( missingFields ) === "array" )
        {
            notifyError( "Not all the required information for publishing is provided. Please go to edit and fill in the missing data: " + missingFields.join( ", " ));

            return;
        }

        if ( $btn.hasClass( "disabled" ))
        {
            return;
        }

        $btn.addClass( "disabled" );

        var hrefElements = $btn.attr( "href" ).split( "/" );

        if ( hrefElements.length !== 2 )
        {
            bidx.utils.error( "publish href", hrefElements, $btn.attr( "href" ) );
            alert( "Unexpected publish link!" );
            return;
        }

        var entityId = hrefElements[ 1 ];

        publish( entityId, function( err )
        {
            $btn.removeClass( "disabled" );

            if ( err )
            {
                bidx.common.notifyError( err.toString() );
            }
            else
            {
                bidx.common.notifyRedirect();

                var url = document.location.protocol
                    + "//"
                    + document.location.hostname
                    + ( document.location.port ? ":" + document.location.port : "" )
                    + "?smsg=5&rs=true"
                ;

                document.location.href = url;
            }
        });
    } );

    // Perform an API call to publish an entity
    //
    function publish( entityId, cb )
    {
        if ( !bidx.utils.getValue( bidxConfig, "authenticated" ))
        {
            alert( "It is only possible to publish something when you are logged in" );
            return;
        }

        bidx.api.call(
            "entityPublish.save"
        ,   {
                entityId:           entityId
            ,   groupDomain:        groupDomain
            ,   success:            function( response )
                {
                    bidx.utils.log( "bidx::entityPublish::save::success", response );

                    cb();
                }
            ,   error:            function( jqXhr, textStatus )
                {
                    bidx.utils.log( "bidx::entityPublish::save::error", jqXhr, textStatus );

                    var response;

                    try
                    {
                        // Not really needed for now, but just have it on the screen, k thx bye
                        //
                        response = JSON.stringify( JSON.parse( jqXhr.responseText ), null, 4 );
                    }
                    catch ( e )
                    {
                        bidx.utils.error( "problem parsing error response from entityPublish" );
                    }

                    cb( new Error( "Problem publishing entity: " + response ) );
                }
            }
        );
    }

    // Notify the user, for now it's just a wrapper over noty... but if we replace this
    //
    var _notify = function( params )
    {
        noty( params );
    };

    // Notify the user that he is going to be redirected
    //
    var notifyRedirect = function()
    {
        notifySuccessModal( "Wait for the redirect..." );
    };

    var notifyCustom = function( msg )
    {
        notifier = noty ({
            text:           msg
        ,   type:           "alert"
        ,   modal:          true
        } );
    };

    var notifyCustomSuccess = function (msg)
    {
        if( notifier )
        {
            notifier
                .setText( msg )
                .setType( "success" )
                .setTimeout( 2000 )
                ;

        }
        else
        {
            _notify(
                {
                    text:           msg
                ,   type:           "success"
                ,   modal:          true
                ,   timeout:        2000
                } );
        }
    };

    var notifySuccessModal = function( msg )
    {
        _notify(
        {
            text:           msg
        ,   type:           "success"
        ,   modal:          true
        } );
    };

    var notifySuccess = function( msg )
    {
        _notify(
        {
            text:           msg
        ,   type:           "success"
        ,   timeout:        4000
        } );
    };

    var notifyError = function( msg )
    {
        _notify(
        {
            text:           msg
        ,   type:           "error"
        ,   closeWith:      [ "button" ]
        ,   buttons:
            [
                {
                    addClass:   "btn btn-primary"
                ,   text:       "Ok"
                ,   onClick: function($noty)
                    {
                        $noty.close();
                    }
                }
            ]
        } );
    };

    // Make sure the i18n translations for the general form validations are available so we
    // do not have to redefine them everywhere. Only app specific form validations are then
    // needed to be set when setting up form validation for that app.
    //
    bidx.i18n.load( [ "__global" ] )
        .done( function()
        {
            $.extend( $.validator.messages,
            {
                required:               bidx.i18n.i( "frmFieldRequired" )
            ,   email:                  bidx.i18n.i( "frmFieldEmail" )
            ,   dpDate:                 bidx.i18n.i( "frmInvalidDate" )
            ,   skypeUsername:          bidx.i18n.i( "frmInvalidSkypeUsername" )
            ,   linkedInUsername:       bidx.i18n.i( "frmInvalidLinkedInUsername" )
            ,   facebookUsername:       bidx.i18n.i( "frmInvalidFacebookUsername" )
            ,   twitterUsername:        bidx.i18n.i( "frmInvalidTwitterUsername" )
            ,   url:                    bidx.i18n.i( "frmInvalidUrl" )
            } );
        } );

    // Expose
    //
    if ( !window.bidx )
    {
        window.bidx = bidx;
    }

    bidx.common =
    {
        groupDomain:                groupDomain
    ,   notifyRedirect:             notifyRedirect
    ,   notifyCustom:               notifyCustom
    ,   notifyCustomSuccess:        notifyCustomSuccess
    ,   notifyError:                notifyError
    ,   notifySuccess:              notifySuccess
    ,   notifySuccessModal:         notifySuccessModal
    ,   joinGroup:                  joinGroup
    ,   leaveGroup:                 leaveGroup

        // DEV API - do not use these in code!
    ,   _notify:                    _notify
    };

    // Control Bootstraps' tab control from outside of the tab header
    //
    $( ".tabControl" ).click(function(e)
    {
        e.preventDefault();

        var $btn    = $( this )
        ,   btnhref = $btn.attr( "href" )
        ,   tab     = $btn.data( "tab" )
        ,   $tab    = $( tab )
        ;

        $tab.find( "[href$='" + btnhref + "']" ).tab( "show" );
    });

    // Instantiate bidx tagsinputs
    // The ones with a class 'defer' on them are left alone in case there is a dependency
    // with the app that otherwise can't be fixed
    //
    $( "input.bidx-tagsinput:not(.defer)" ).tagsinput();

    // Activate all datepickers (this was previously done as part of the form.js plugin)
    //
    $( "input[data-type=date]" ).datepicker(
    {
        "dateFormat":                     "d MM yy"
    } );

} ( jQuery ));
