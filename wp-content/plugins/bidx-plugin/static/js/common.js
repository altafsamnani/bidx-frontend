// Common.js is a miscelaneous home for 'state full' utilities
//
( function( $ )
{
    "use strict";

    var bidx            = window.bidx || {}
    ,   bidxConfig      = window.bidxConfig || {}

        // $bidx will be used to trigger events from
        //
    ,   $bidx           = $( bidx )

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

                bidx.utils.log( "Apps with pending changes", changesQueue.join( ", " ));

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

            bidx.utils.log( "Apps with pending changes", changesQueue.join( ", " ));

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
                    ,   text:           "Yes, lose changes"
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
                    ,   text:           "No, go back"
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
        return getSessionValue( "currentGroup" );
    }

    // Convenience function for retrieving the id of the current group
    //
    function getCurrentUserId()
    {
        return getSessionValue( "id" );
    }


    // retrieve a value from the session object
    //
    function getSessionValue( key )
    {
        return bidx.utils.getValue( bidxConfig, "session." + key );

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

        var groupId = $btn.data( "groupid" );

        if ( !groupId )
        {
            groupId = bidx.utils.getValue( bidxConfig, "session.currentGroup" );
        }

        _notify(
        {
            text:       bidx.i18n.i( "btnConfirm" )
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

                        leaveGroup( groupId, function( err )
                        {

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

                        $noty.close();
                    }
                }
            ,   {
                    addClass:       "btn btn-danger"
                ,   text:           "Cancel"
                ,   onClick: function( $noty )
                    {
                        $noty.close();
                    }
                }
            ]
        } );
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

    // Trigger an internal event on the $( window.bidx ) object
    //
    function trigger( event, data )
    {
        bidx.utils.log( "[bidx event]", event, data );
        $bidx.trigger( event, data );
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

    // Notify the user that a save action is taking place
    //
    var notifySave = function()
    {
        notifyInformationModal( bidx.i18n.i( "msgWaitForSave" ) );
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

    var notifyInformationModal = function( msg )
    {
        _notify(
        {
            text:           msg
        ,   type:           "information"
        ,   modal:          true
        } );
    };

    var closeNotifications = function()
    {
        $.noty.closeAll();
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
            ,   minlength:              $.validator.format( bidx.i18n.i( "frmInvalidMinlength" ))

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
            //bidx.utils.log("errorPlacement", $element);
            var inserted            = false
            ,   $controls
            //,   $errorIcon          = $( "<div>" ).addClass( "validation-icon" )
            ;

            // When handling any field, the error needs to be inserted after the control tag
            //
            $controls = $element.closest( ".form-group" );


            if ( $controls.length && !$element.hasClass( "noValidationErrorMessage" ))
            {
                $controls.append( $error );
            }

            // Forms can be configured to have no validation icon behind the elements
            //
            if ( ( !this.settings || !this.settings.noValidationIcon ) && !$element.hasClass( "noValidationIcon" ) )
            {
                if ( $controls.length )
                {
                    inserted = true;
                }

                // Didn't find a way to have the icon inserted? We insert it behind the input in the DOM
                //
                if ( !inserted )
                {

                    $error.insertAfter( $element );

                    // NOTE $msp: I deliberately choose not to insert the errorIcon if there is no control-group or control present, because I cannot guarantee the positioning of the element
                    //
                    bidx.utils.warn("No \'.controls\' wrapper found on element: ", $element);
                }
            }
        }

    ,   errorElement: "div"

    ,   highlight: function( element, errorClass, validClass)
        {
            //bidx.utils.log("highlight", element);
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
            //$element.closest( ".controls" ).addClass( errorClass ).removeClass( validClass );
            $element.closest('.form-group').addClass('has-error');

            // update error count in accordion heading (if exists)
            //
            updateAccordionHeadingErrors( element, "highlight" );
        }

    ,   unhighlight: function( element, errorClass, validClass)
        {
            //bidx.utils.log("Unhighlight", element);
            var $element            = $( element )
            ,   $errorIcon          = $( "<div>" ).addClass( "validation-icon" )
            ,   $container
            ;

            // if element is currently on pending list, step out of this function
            //
            if ( this.pending[ element.name ] )
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
            if ( ( !this.settings || !this.settings.noValidationIcon ) && !$element.hasClass( "noValidationIcon" ) )
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
            //$element.closest( ".controls" ).removeClass( errorClass ).addClass( validClass );
            $element.closest('.form-group').removeClass('has-error');

            // update error count in accordion heading (if exists)
            //
            updateAccordionHeadingErrors( element, "unhighlight" );
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

    function updateAccordionHeadingErrors( element, action )
    {
        var accordionHeadingSelector    = ".panel-heading"
        ,   $element                    = $( element )
        ,   $accordionGroup             = $element.closest( ".panel" )
        ,   $accordionHeading
        ,   $errorCount
        ,   errorCount
        ;

        // if element is not part of an accordiongroup, we do not need to proceed any further
        //
        if (!$accordionGroup.length )
        {
            return;
        }

        $accordionHeading = $accordionGroup.find( accordionHeadingSelector );

        // get the error count from the data-error attribute
        //
        errorCount = $accordionHeading.data( "data-bidx-errorCount" );

        // increase error count
        //
        if ( action === "highlight" )
        {

            // this element was already counted, exit function
            //
            if ( $element.data( "data-bidx-counted" ) )
            {
                return;
            }


            // set Element to be counted
            //
            $element.data( "data-bidx-counted", 1 );

            // if no error count is set
            //
            if ( !errorCount )
            {

                $accordionHeading.addClass( "heading-error" );
                errorCount = 1;
                _showErrorCount();

            }
            // there are already errors in the accordion body. update error count
            //
            else
            {
                // update error count in heading
                //
                errorCount++;
                _showErrorCount();


            }
        }

        // Unhiglight called: decrease error count
        //
        else
        {
            // if element is valid but still had a count flag, it had an error just before the unhighlight function was fired
            //
            if ( $element.hasClass( "valid") && $element.data( "data-bidx-counted" ) )
            {
                errorCount--;
                $element.removeData( "data-bidx-counted" );
                _showErrorCount();
            }
        }

        // private function to handle the show of error messages in the heading
        //
        function _showErrorCount()
        {
            var $errorCount = $accordionHeading.find( ".js-error-count" );

            // if error count does not yet exist
            //
            if ( !$errorCount.length )
            {
                $errorCount = $( "<span/>",
                {
                    class:      "pull-right badge js-error-count"
                } );

                $accordionHeading.prepend( $errorCount );
            }

            if ( errorCount > 0 )
            {
                // change the errorCount value
                //
                $errorCount.text( errorCount );
                $accordionHeading.data( "data-bidx-errorCount", errorCount );
            }
            else
            {
                // remove error count and error class from heading
                //
                $errorCount.remove();
                $accordionHeading.removeClass( "heading-error" );
                $accordionHeading.removeData( "data-bidx-errorCount" );
            }
        }
    }

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

    // Set the bootstrap version to 3 by default so we don't have to change it in every app
    //
    $.fn.bootstrapPaginator.defaults.bootstrapMajorVersion = 3;


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
    ,   notifySave:                     notifySave

    ,   notifyCustom:                   notifyCustom
    ,   notifyCustomSuccess:            notifyCustomSuccess
    ,   notifyError:                    notifyError
    ,   notifySuccess:                  notifySuccess
    ,   notifySuccessModal:             notifySuccessModal
    ,   notifyInformationModal:         notifyInformationModal

    ,   closeNotifications:             closeNotifications

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
    ,   getMentorProfileId: function()
        {
            return getEntityId( "bidxMentorProfile" );
        }


    ,   getGroupIds:                    getGroupIds
    ,   getCurrentGroupId:              getCurrentGroupId
    ,   getCurrentUserId:               getCurrentUserId
    ,   getSessionValue:                getSessionValue
    ,   getNow:                         getNow

    ,   addAppWithPendingChanges:       addAppWithPendingChanges
    ,   removeAppWithPendingChanges:    removeAppWithPendingChanges
    ,   checkPendingChanges:            checkPendingChanges
    ,   getChangesQueue:                function()
        {
            return changesQueue.slice();
        }

    ,   trigger:                        trigger

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
        format:                 "d M yyyy"
    ,   changeYear:             true
    ,   changeMonth:            true
    ,   yearRange:              "-100:+3"
    ,   todayHighlight:         true
    ,   weekStart:              1
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
    $( ".panel-collapse" )
        .on( "show.bs.collapse", function()
        {
            var $accordionBody = $( this );

            $accordionBody.closest( ".panel" ).first().addClass( "panel-open" );
        } )
        .on( "hide.bs.collapse", function(e)
        {
            var $accordionBody = $( this );
            $accordionBody.closest( ".panel" ).first().removeClass( "panel-open" );
            $accordionBody.closest( ".panel" )
                .css( { overflow: 'hidden' } )
                .find( ".panel-body" ).first().css({ overflow: 'hidden' });
        } )
        .on( "shown.bs.collapse", function ()
        {
            var $accordionBody = $( this )
            ,   panelHeight = $accordionBody.height()
            ,   offSet = 165
            ,   targetOffset = $accordionBody.offset().top - offSet
            ;
            $accordionBody.closest( ".panel" )
                .css( { overflow: 'visible' } )
                .find( ".panel-body" ).first().css({ overflow: 'visible' });

            // Fix for "Your current address" in member profile
            // Trigger the _updateCurrentAddressMap function when the panel is shown
            if ($accordionBody.hasClass( 'addressItem' ))
            {
                bidx.member._updateCurrentAddressMap();
            }

            $('html,body').delay(300).animate({scrollTop:targetOffset}, 200);

        } );

    // Open the panel if there is a hash in the url
    //
    if ( window.location.hash )
    {
        var windowHash  = window.location.hash.split('/')
        ,   panelHash   = windowHash[windowHash.length-1]
        ;
        
        if ( panelHash.match( /^#/ ) )
        {
            $( 'a[href='+ panelHash +']' ).click();
        }
    }

    // On Window Scroll
    // $(window).scroll( function(e)
    // {
    //     var scrollPosition = $(window).scrollTop()
    //     ,   $innerWrap          = $( ".inner-wrap" )
    //     ,   $headerControls     = $( ".bidx-header-controls a" )
    //     ;
    //     if ( scrollPosition >= 120 )
    //     {
    //         $innerWrap.addClass( "smaller" );
    //         $headerControls.addClass( "btn-sm" );
    //     }
    //     if ( scrollPosition <= 30 )
    //     {
    //         $innerWrap.removeClass( "smaller" );
    //         $headerControls.removeClass( "btn-sm" );
    //     }
    // });

} ( jQuery ));
