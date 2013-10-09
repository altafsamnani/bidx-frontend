// Common.js is a miscelaneous home for 'state full' utilities
//
( function( $ )
{
    var bidx            = window.bidx || {}
    ,   bidxConfig      = window.bidxConfig || {}

    ,   $body           = $( "body" )

    ,   groupDomain     = bidx.utils.getValue( bidxConfig, "context.bidxGroupDomain" ) || bidx.utils.getGroupDomain()
    ,   timeDifference  = ( bidx.utils.getValue( bidxConfig, "now" ) || ( new Date() ).getTime() ) - ( new Date() ).getTime()

    ,   notifier

    ,   changesQueue    = [] // array holding app names that have pending changes
    ;

    // Add something to the list of apps having a reason to ask the user for confirmation on page unload
    // http://stackoverflow.com/questions/1119289/how-to-show-the-are-you-sure-you-want-to-navigate-away-from-this-page-when-ch
    //
    function addAppWithPendingChanges( appName )
    {
        if ( changesQueue.length === 0 )
        {
            window.onbeforeunload = function confirmOnPageExit( e )
            {
                // If we haven't been passed the event get the window.event
                e = e || window.event;

                var message = bidx.i18n.i( "msgOnPageUnload" );

                // For IE6-8 and Firefox prior to version 4
                if ( e )
                {
                    e.returnValue = message;
                }

                // For Chrome, Safari, IE8+ and Opera 12+
                return message;
            };
        }

        if ( $.inArray( appName, changesQueue ) === -1 )
        {
            changesQueue.push( appName );
        }
    }

    // Remove something from the list of apps that have a reason to ask for confirmation before unload
    //
    function removeAppWithPendingChanges( appName )
    {
        changesQueue = $.grep( changesQueue, function( appWithChanges )
        {
            return appWithChanges !== appName;
        } );

        if ( changesQueue.length === 0 )
        {
            window.onbeforeunload = null;
        }
    }

    // Are there pending changes? If so, ask the end user if he really wants to navigate away
    //
    // @returns Boolean true when the user agrees, or there are no changes
    //
    function checkPendingChanges( cb )
    {
        var confirmationRequested = false;

        if ( changesQueue.length )
        {
            confirmationRequested = true;

            _notify(
            {
                text:       bidx.i18n.i( "msgOnPageUnload" )
            ,   modal:      true
            ,   type:       "confirm"
            ,   layout:     "center"
            ,   buttons:
                [
                    {
                        addClass:       "btn btn-primary"
                    ,   text:           "Ok"
                    ,   onClick: function( $noty )
                        {
                            // Clear the queue, because the user confirmed it
                            //
                            changesQueue = [];

                            cb( true );

                            $noty.close();
                        }
                    }
                ,   {
                        addClass:       "btn btn-danger"
                    ,   text:           "Cancel"
                    ,   onClick: function( $noty )
                        {
                            cb( false );

                            $noty.close();
                        }
                    }
                ]
            } );
        }

        return confirmationRequested;
    }

    // Convenience function for retrieving the id of the current group
    //
    function getCurrentGroupId()
    {
        return bidx.utils.getValue( bidxConfig, "session.currentGroup" );
    }

    // Convenience function for retrieving the id of the user group
    //
    function getCurrentUserId()
    {
        return bidx.utils.getValue( bidxConfig, "session.id" );
    }


    // Retrieve the most reliable "now" Date object we can give at the moment. This is SYSTEM DATE! Not localized
    //
    function getNow()
    {
        var now = ( new Date() ).getTime() + timeDifference;

        return new Date( now );
    }

    // Convenience function for itterating over the list of entities of the session
    // data and lookup the existance (and id) of a specific entity
    //
    function getEntityId( entityType )
    {
        var result      = null
        ,   entities    = bidx.utils.getValue( bidxConfig, "session.entities" )
        ;

        if ( entities )
        {
            $.each( entities, function( idx, entity )
            {
                var bidxMeta = bidx.utils.getValue( entity, "bidxMeta" ) || {};

                if ( bidxMeta.bidxEntityType === entityType )
                {
                    if ( !result )
                    {
                        result = bidxMeta.bidxEntityId;
                    }
                    else
                    {
                        result = [ result ];
                        result.push( bidxMeta.bidxEntityId );
                    }
                }
            } );
        }

        return result;
    }

    // data and lookup the joined group id's
    //
    function getGroupIds()
    {
        var result      = []
        ,   groups      = bidx.utils.getValue( bidxConfig, "session.groups" )
        ;

        if ( groups )
        {
            $.each( groups, function( idx, group )
            {
                var bidxMeta = bidx.utils.getValue( group, "bidxMeta" ) || {};

                result.push( bidxMeta.bidxGroupId );
            } );
        }

        return result;
    }

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
        notifySuccessModal( bidx.i18n.i( "msgWaitForRedirect" ) );
    };

    // Create custom Noty message
    //
    var notifyCustom = function( msg )
    {
        notifier = noty (
        {
            text:           msg
        ,   type:           "alert"
        ,   modal:          true
        } );
    };

    // Create a succes Noty or update an existing Noty to succes with custom message
    //
    var notifyCustomSuccess = function (msg)
    {
        if( notifier )
        {
            notifier.setText( msg )
                    .setType( "success" )
                    .setTimeout( 1500 )
                    ;

        }
        else
        {
            _notify(
            {
                text:           msg
            ,   type:           "success"
            ,   modal:          true
            ,   timeout:        1500
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
    // wrap the ones that require variable replacement in $.validator.format()
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
            ,   urlOptionalProtocol:    bidx.i18n.i( "frmInvalidUrl" )
            ,   monetaryAmount:         bidx.i18n.i( "frmInvalidMonetaryAmount" )
            ,   min:                    $.validator.format( bidx.i18n.i( "frmInvalidMin" ))
            ,   max:                    $.validator.format( bidx.i18n.i( "frmInvalidMax" ))
            ,   digits:                 bidx.i18n.i( "frmInvalidDigits" )
            ,   maxlength:              $.validator.format( bidx.i18n.i( "frmInvalidMaxlength" ))

                // bidx-tagsinput
                //
            ,   tagsinputRequired:      bidx.i18n.i( "frmFieldRequired" )
            ,   tagsinputMinItems:      $.validator.format( bidx.i18n.i( "frmInvalidMinItems" ) )
            } );
        } );

    // Define validator defaults
    //
    $.validator.setDefaults(
    {
        debug:              true
    ,   ignore:             ":hidden"

    ,   errorPlacement:     function( $error, $element )
        {
            var inserted            = false
            ,   $container
            ,   $errorIcon          = $( "<div>" ).addClass( "validation-icon" )
            ;

            // When handling any field, the error needs to go outside of the wrapper ("controls")
            //
            $container = $element.closest( ".control-group" );

            // Forms can be configured to have no validation icon behind the elements
            //
            if ( !this.settings || !this.settings.noIcon )
            {
                if ( $container.length )
                {
                    $error.appendTo( $container );
                    if( !$container.find( ".controls" ).find( ".validation-icon" ).length )
                    {
                        $container.find( ".controls" ).append( $errorIcon );
                    }

                    inserted = true;
                }

                // Didn't found a way to get inserted? Just insert it behind the input in the DOM
                //
                if ( !inserted )
                {

                    $error.insertAfter( $element );

                    // NOTE $msp: I deliberately chose not to insert the errorIcon if there is no control-group or control present, because I cannot guarantee the positioning of the element
                    bidx.utils.warn("No \'.controls\' wrapper found on element: ", $element);
                }
            }
        }

    ,   highlight: function( element, errorClass, validClass)
        {

            var $element             = $( element )
            ,   controlErrorClass
            ,   controlValidClass

            ;

            // default highlight behaviour
            //
            if ( element.type === "radio" )
            {
               this.findByName( element.name ).addClass( errorClass ).removeClass( validClass );
            }
            else
            {
                $element.addClass( errorClass ).removeClass( validClass );
            }
            //
            // end default highlight behaviour

            // custom addition which adds errorClass to control wrapper
            //
            errorClass = "control-" + errorClass;
            validClass = "control-" + validClass;
            $element.closest( ".controls" ).addClass( errorClass ).removeClass( validClass );
        }

    ,   unhighlight: function( element, errorClass, validClass)
        {
            var $element            = $( element )
            ,   $errorIcon          = $( "<div>" ).addClass( "validation-icon" )
            ,   $container
            ;

            // if element is currently on pending list, step out of this function
            //
            if( this.pending[ element.name ] )
            {
                return;
            }

            // default unhighlight behaviour
            //
            if ( element.type === "radio" )
            {
                this.findByName( element.name ).removeClass( errorClass ).addClass( validClass );
            }
            else
            {
                $element.removeClass( errorClass ).addClass( validClass );
            }
            //
            // end default unhighlight behaviour

            // Forms can be configured to have no validation icon behind the elements
            //
            if ( !this.settings.noIcon )
            {
                // add validation-icon to control group if it is not already available
                //
                $container = $element.closest( ".control-group" );
                if ( $container.length && !$container.find( ".controls" ).find( ".validation-icon" ).length )
                {
                    $container.find( ".controls" ).append( $errorIcon );
                }
            }

            // custom addition which adds errorClass to control wrapper
            //
            errorClass = "control-" + errorClass;
            validClass = "control-" + validClass;
            $element.closest( ".controls" ).removeClass( errorClass ).addClass( validClass );
        }

        // when element receives focus and errorPlacement has not fired, add the validation-icon in the control wrapper
        //
    ,   onfocusin: function( element, event )
        {
/*            var $errorIcon          = $( "<div>" ).addClass( "validation-icon" )
            ,   $element            = $( element )
            ,   $container
            ;

            $container = $element.closest( ".control-group" );

            if ( $container.length && !$container.find( ".controls" ).find( ".validation-icon" ).length )
            {
                $container.find( ".controls" ).append( $errorIcon );

            }
*/
        }
    } );

    //  Validator extentions
    //

    // extend of resetForm prototype
    //
    $.validator.prototype.originalResetForm = $.validator.prototype.resetForm;

    $.validator.prototype.resetForm = function()
    {
        var $formElements
        ,   $el
        ;

        // execute orginal function
        //
        this.originalResetForm();

        // execute custom code
        //

        $formElements = $( this.currentForm ).find( ":input" );
        // remove classes from the element and its control group
        //
        $formElements.each( function( idx, el )
        {
            $el = $( el );

            $el.removeClass( "valid" );
            $el.closest( ".controls" ).removeClass( "control-error control-valid" );
        } );

    };

    //
    // end validator extentions


    // Expose
    //
    if ( !window.bidx )
    {
        window.bidx = bidx;
    }

    bidx.common =
    {
        groupDomain:                    groupDomain
    ,   notifyRedirect:                 notifyRedirect
    ,   notifyCustom:                   notifyCustom
    ,   notifyCustomSuccess:            notifyCustomSuccess
    ,   notifyError:                    notifyError
    ,   notifySuccess:                  notifySuccess
    ,   notifySuccessModal:             notifySuccessModal
    ,   joinGroup:                      joinGroup
    ,   leaveGroup:                     leaveGroup

    ,   getInvestorProfileId: function()
        {
            return getEntityId( "bidxInvestorProfile" );
        }
    ,   getEntrepreneurProfileId: function()
        {
            return getEntityId( "bidxEntrepreneurProfile" );
        }

    ,   getGroupIds:                    getGroupIds
    ,   getCurrentGroupId:              getCurrentGroupId
    ,   getCurrentUserId:               getCurrentUserId
    ,   getNow:                         getNow

    ,   addAppWithPendingChanges:       addAppWithPendingChanges
    ,   removeAppWithPendingChanges:    removeAppWithPendingChanges
    ,   checkPendingChanges:            checkPendingChanges
    ,   getChangesQueue:                function()
        {
            return changesQueue.slice();
        }

        // DEV API - do not use these in code!
    ,   _notify:                        _notify
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
        dateFormat:             "d MM yy"
    ,   changeYear:             true
    ,   changeMonth:            true
    ,   yearRange:              "-100:+3"
    } );

    // Disable disabled links
    //
    $body.delegate( "a.disabled", "click", function( e )
    {
        e.preventDefault();
    } );

    // Administer the toggle state of an accordion by putting a .accordion-open class on the group when the accordion group is open
    // Usefull for setting icons / colors etc
    //
    $( ".accordion-body.collapse" )
        .bind( "show", function()
        {
            var $accordionBody = $( this );

            $accordionBody.closest( ".accordion-group" ).addClass( "accordion-open" );
        } )
        .bind( "hide", function()
        {
            var $accordionBody = $( this );

            $accordionBody.closest( ".accordion-group" ).removeClass( "accordion-open" );
        } );



} ( jQuery ));
