/* global bidx */
;( function( $ )
{
    var $element                        = $( "#editMentor" )
    ,   $views                          = $element.find( ".view" )
    ,   $editForm                       = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                       = $element.find( ".snippets" )

        // Attachnents
        //
    ,   $attachmentsControl                 = $editForm.find( ".attachmentsControl" )
    ,   $attachmentsContainer               = $attachmentsControl.find( ".attachmentsContainer" )
    ,   $btnAddAttachments                  = $attachmentsControl.find( "a[href$='#addAttachments']")
    ,   $addAttachmentsModal                = $attachmentsControl.find( ".addAttachmentsModal" )

    ,   $toggles                        = $element.find( ".toggle" ).hide()
    ,   $toggleInvestsForInst           = $element.find( "[name='investsForInst']"      )
    ,   $toggleFocusLocationType        = $element.find( "[name='focusLocationType']"      )

    ,   member
    ,   memberId
    ,   mentorProfileId
    ,   state
    ,   currentView

    ,   snippets                    = {}

    ,   appName                     = "member"
    ;

    // Form fields
    //
    var arrayFields = [ "focusCity" ];

    var fields =
    {
        _root:
        [
            'mentorProfileSummary'
        ,   'focusIndustry'
        ,   'focusCountry'
        ]

    ,   focusCity:
        [
            'cityTown'
        ]

    ,   focusReach:
        [
            'reach'
        ,   'coordinates'
        ]

    };

        // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup()
    {
        _snippets();
        _attachments();

        // On any changes, how little doesn't matter, notify that we have a pending change
        // But no need to track the changes when doing a member data load
        //
        $editForm.bind( "change", function()
        {
            if ( currentView === "edit" )
            {
                bidx.common.addAppWithPendingChanges( appName );
            }
        } );

        // Disable disabled links
        //
        $element.delegate( "a.disabled", "click", function( e )
        {
            e.preventDefault();
        } );

        // Grab the snippets from the DOM
        //
        function _snippets()
        {
            snippets.$attachment            = $snippets.children( ".attachmentItem"          ).remove();
        }

        // Initialize attachments
        //
        function _attachments()
        {
            // Clicking the add files button will load the media library
            //
            $btnAddAttachments.click( function( e )
            {
                e.preventDefault();

                // Make sure the media app is within our modal
                //
                $( "#media" ).appendTo( $addAttachmentsModal.find( ".modal-body" ) );

                var $selectBtn = $addAttachmentsModal.find( ".btnSelectFile" );
                var $cancelBtn = $addAttachmentsModal.find( ".btnCancelSelectFile" );

                // Navigate the media app into list mode for selecting files
                //
                bidx.media.navigate(
                {
                    requestedState:         "list"
                ,   slaveApp:               true
                ,   selectFile:             true
                ,   multiSelect:            true
                ,   showEditBtn:            false
                ,   btnSelect:              $selectBtn
                ,   btnCancel:              $cancelBtn
                ,   callbacks:
                    {
                        ready:                  function( state )
                        {
                            bidx.utils.log( "[documents] ready in state", state );
                        }

                    ,   cancel:                 function()
                        {
                            // Stop selecting files, back to previous stage
                            //
                            $addAttachmentsModal.modal('hide');
                        }

                    ,   success:                function( file )
                        {
                            bidx.utils.log( "[attachments] uploaded", file );

                            // NOOP.. the parent app is not interested in when the file is uploaded
                            // only when it is attached / selected
                        }

                    ,   select:               function( files )
                        {
                            bidx.utils.log( "[attachments] select", files );

                            // Attach the file to the entity
                            // By adding it to the reflowrower we can pick it up as soon
                            // as the entity is created or saved. The reflowrower keeps a list of
                            // added items
                            //

                            if ( files )
                            {
                                $.each( files, function( idx, file )
                                {
                                    _addAttachment( file );
                                } );
                            }

                            $addAttachmentsModal.modal('hide');
                        }
                    }
                } );

                $addAttachmentsModal.modal();
            } );

            // Instantiate reflowrower on the attachments container
            //
            $attachmentsContainer.reflowrower(
            {
                itemsPerRow:        3
            ,   itemClass:          "attachmentItem"
            } );
        }
    }

    var _handleToggleChange = function( show, group )
    {
        var fn = show ? "fadeIn" : "hide";

        $toggles.filter( ".toggle-" + group )[ fn ]();
    };

    $toggleFocusLocationType.change( function()
    {
        var value       = $toggleFocusLocationType.filter( "[checked]" ).val()
        ,   groupClass  = "toggle-focusLocationType"
        ;

        bidx.utils.log( "$toggleFocusLocationType::change", value );

        // FlatUI's radio plugin fires the change event for all radio's, but since
        // we check on [checked] only the change event for the newly selected
        // radio does have a value at this point. We could have written the code
        // so it will use the event for all radio's, but that will break when we
        // remove FlatUI
        //
        if ( value === undefined )
        {
            return;
        }

        $toggles.filter( "." + groupClass ).each( function()
        {
            var $block  = $( this )
            ,   fn      = $block.hasClass( groupClass + "-" + value )
                            ? "fadeIn"
                            : "hide"
            ;

            $block[ fn ]();
        } );
    } );



    // Add the attachment to the screen, by cloning the snippet and populating it
    //
    function _addAttachment( attachment )
    {
        if ( attachment === null )
        {
            bidx.util.warn( "mentorprofile::_addAttachment: attachment is null!" );
            return;
        }

        var $attachment         = snippets.$attachment.clone()
        ,   createdDateTime     = bidx.utils.parseTimestampToDateStr( attachment.created )
        ,   imageSrc
        ;

        // Store the data so we can later use it to merge the updated data in
        //
        $attachment.data( "bidxData", attachment );

        $attachment.find( ".documentName"       ).text( attachment.documentName );
        $attachment.find( ".createdDateTime"    ).text( createdDateTime );

        $attachment.find( ".purpose"            ).text( attachment.purpose );
        $attachment.find( ".documentType"       ).text( bidx.data.i( attachment.documentType, "documentType" ) );

        imageSrc = ( attachment.mimeType && attachment.mimeType.match( /^image/ ) )
            ? attachment.document
            : "/wp-content/plugins/bidx-plugin/static/img/iconViewDocument.png";

        $attachment.find( ".documentImage"  ).attr( "src", imageSrc );
        $attachment.find( ".documentLink"   ).attr( "href", attachment.document );

        $attachmentsContainer.reflowrower( "addItem", $attachment );
    }



    // Use the retrieved member object to populate the form and other screen elements
    //
    function _populateScreen()
    {
        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getValue( member, "bidxMentorProfile." + f )
            ;

            $input.each( function()
            {
                // Value can be an array! Most likely we are targeting a
                //
                bidx.utils.setElementValue( $( this ), value );
            } );
        } );


        // Focuscity, special field because it's a single UI control but a complex structure in the API
        //
        var $focusCity  = $editForm.find( "[name='focusCity']" )
        ,   focusCity   = bidx.utils.getValue( member, "bidxMentorProfile.focusCity", true )
        ,   focusCities = []
        ;


        if ( focusCity )
        {
            $.each( focusCity, function( idx, fc )
            {
                var cityTown = fc.cityTown;

                if ( cityTown )
                {
                    focusCities.push( cityTown );
                }
            } );
        }

        bidx.utils.setElementValue( $focusCity, focusCities );

        // Attachments
        //
        var attachments         = bidx.utils.getValue( member, "bidxMentorProfile.attachment", true );

        if ( attachments)
        {
            $.each( attachments, function( idx, attachment )
            {
                bidx.utils.log( "attachment ", idx, attachment );
                _addAttachment( attachment );
            } );
        }

        // Now that everything is processed, let's decide whicch of the focusLocation radio buttons must
        // be selected
        //
        // Since there is no explicit 'focusLocation' property in the API we need to 'elect' the best option
        // in the radio control to be selected based upon the data that *is* available.
        // Values are booleans
        //
        var focusLocation =
            {
                country:        !!bidx.utils.getValue( member, "bidxMentorProfile.focusCountry", true )
            ,   city:           !!focusCity
            ,   reach:          !!bidx.utils.getValue( member, "bidxMentorProfile.focusReach.coordinates" )
            }
        ,   focusLocationValue
        ;

        // Country over city over reach, if in that order a value is found it is decided (front-end business logic!) that the first
        // is the intended value
        //
        if ( focusLocation.country )
        {
            focusLocationValue = "country";
        }
        else if ( focusLocation.city )
        {
            focusLocationValue = "city";
        }
        else if ( focusLocation.reach )
        {
            focusLocationValue = "reach";
        }

        bidx.utils.log( "Showing focusLocation state", focusLocationValue );

        var $focusLocationType = $toggleFocusLocationType.filter( "[value='" + focusLocationValue + "']" );

        if ( $focusLocationType.data( "radio" ) )
        {
            bidx.utils.log( "using radio checkbox plugin to set reach data" );

            $focusLocationType.radio( "check" );
        }
        else
        {
            bidx.utils.log( "using native checkbox prop() to set reach data" );

            $focusLocationType.prop( "checked", true );
            $focusLocationType.trigger( "change" );
        }

        // If we have a focusReach, feed the widget with the data so it can render the map, marker and circle
        //
        var $focusReach = $editForm.find( "[name='focusReach']" );

        if ( focusLocation.reach )
        {
            $focusReach.bidx_location(
                "setLocationData"
            ,   {
                    reach:          bidx.utils.getValue( member, "bidxMentorProfile.focusReach.reach" )
                ,   coordinates:    bidx.utils.getValue( member, "bidxMentorProfile.focusReach.coordinates" )
                }
            );
        }
    }

    // Convert the form values back into the member object
    //
    function _getFormValues()
    {
        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getElementValue( $input )
            ;

            bidx.utils.setValue( member, "bidxMentorProfile." + f, value );
        } );

        // Focus City is a pretty special field. Its a tagsinput in the UI but a array of objects
        // in the API
        //
        var $focusCity  = $editForm.find( "[name='focusCity']" )
        ,   focusCities = bidx.utils.getElementValue( $focusCity )
        ,   focusCity   = []
        ;

        if ( focusCities )
        {
            focusCity = $.map( focusCities, function( cityTown )
            {
                return { cityTown: cityTown };
            } );
        }

        bidx.utils.setValue( member, "bidxMentorProfile.focusCity", focusCity );

        // Focus Reach is a special component. It's a widget with it's own API.
        //
        var $focusReach     = $editForm.find( "[name='focusReach']" )
        ,   focusReach      = $focusReach.bidx_location( "getLocationData" ) || {}
        ;

        bidx.utils.setValue( member, "bidxMentorProfile.focusReach.coordinates",  focusReach.coordinates || "" );
        bidx.utils.setValue( member, "bidxMentorProfile.focusReach.reach",        focusReach.reach || "" );


        // Delete the none-selected focus reach/city/country things, since a user can have selected a focusCity, but the radio control is now set to country. Sicne the API
        // doesn't facility administrating this explicit "do not set the city" we need to unset it ourselves...
        //
        var focusLocationType = $toggleFocusLocationType.filter( "[checked]" ).val();

        if ( focusLocationType !== "country" )
        {
            bidx.utils.setValue( member, "bidxMentorProfile.focusCountry", [] );
        }

        if ( focusLocationType !== "city" )
        {
            bidx.utils.setValue( member, "bidxMentorProfile.focusCity", [] );
        }

        if ( focusLocationType !== "reach" && !mentorProfileId )
        {
            bidx.utils.setValue( member, "bidxMentorProfile.focusReach.coordinates", null );
            bidx.utils.setValue( member, "bidxMentorProfile.focusReach.reach", null );
        }

        // Documents
        // Collect the whole situation from the DOM and set that array of bidxData items to be the new situation
        //
        var attachments = [];

        $attachmentsContainer.find( ".attachmentItem" ).each( function()
        {
            var $item       = $( this )
            ,   bidxData    = $item.data( "bidxData" )
            ;

            attachments.push( bidxData );
        } );

        bidx.utils.setValue( member, "bidxMentorProfile.attachment", attachments );
    }

    // This is the startpoint
    //
    function _init()
    {
        // Reset any state
        //
        $attachmentsContainer.reflowrower( "empty" );

        // Inject the save and button into the controls
        //
        var $btnSave    = $( "<a />", { "class": "btn btn-primary disabled", href: "#save"    })
        ,   $btnCancel  = $( "<a />", { "class": "btn btn-primary disabled", href: "#cancel"  })
        ;

        $btnSave.i18nText( "btnSaveProfile" );
        $btnCancel.i18nText( "btnCancel" );

        bidx.controller.addControlButtons( [ $btnSave, $btnCancel ] );

        // Wire the submit button which can be anywhere in the DOM
        //
        $btnSave.click( function( e )
        {
            e.preventDefault();

            $editForm.submit();
        } );

        // Setup form
        //
        var $validator = $editForm.validate(
        {
            debug: true
        ,   rules:
            {
                "mentorProfileSummary":
                {
                    required:               true
                }
            ,   "focusIndustry":
                {
                    tagsinputRequired:      true
                }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler: function( e )
            {
                if ( $btnSave.hasClass( "disabled" ) )
                {
                    return;
                }

                $btnSave.addClass( "disabled" );
                $btnCancel.addClass( "disabled" );

                _save(
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
                            bidx.utils.error( "problem parsing error response from mentorProfile save" );
                        }

                        bidx.common.notifyError( "Something went wrong during save: " + response );

                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                    }
                } );
            }
        } );

        // Instantiate location plugin
        //
        $editForm.find( "[data-type=location]"   ).bidx_location(
        {
            drawCircle:                 true
        } );

        if ( state === "create" )
        {
            member =
            {
                bidxMentorProfile:
                {
                    bidxMeta:
                    {
                    }
                }
            };

            // Make sure all the components are brought to live
            //
            _populateScreen();

            $btnSave.removeClass( "disabled" );
            $btnCancel.removeClass( "disabled" );

            _showView( "edit" );
        }
        else if ( state === "edit" )
        {
            // Fetch the member
            //
            bidx.api.call(
                "member.fetch"
            ,   {
                    memberId:       memberId
                ,   groupDomain:    bidx.common.groupDomain
                ,   success:        function( response )
                    {
                        // Do we have edit perms?
                        //
                        var bidxMeta    = bidx.utils.getValue( response, "bidxMentorProfile.bidxMeta" )
                        ,   canEdit     = bidx.utils.getValue( bidxMeta, "bidxCanEdit" )
                        ;


                        if ( !canEdit )
                        {
                            bidx.i18n.getItem( "noProfileEditPermission", function( err, label )
                            {
                                _showError( label );
                            } );

                            $btnCancel.removeClass( "disabled" );
                        }
                        else
                        {
                            member = response;

                            // Set the global memberProfileId for convenience reasons
                            //
                            mentorProfileId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );

                            bidx.utils.log( "bidx::invvestor", member );

                            _populateScreen();

                            $btnSave.removeClass( "disabled" );
                            $btnCancel.removeClass( "disabled" );

                            _showView( "edit" );
                        }
                    }
                ,   error:          function( jqXhr, textStatus )
                    {
                        var status = bidx.utils.getValue( jqXhr, "status" ) || textStatus;

                        _showError( "Something went wrong while retrieving the member: " + status );
                    }
                }
            );
        }
    }

    // Try to save the member to the API
    //
    function _save( params )
    {
        var bidxAPIService
        ,   bidxAPIParams
        ;

        if ( !member )
        {
            return;
        }

        // Inform the API we are updating the member profile
        //
        var bidxMeta = member.bidxMentorProfile.bidxMeta;
        bidxMeta.bidxEntityType   = "bidxMentorProfile";

        // Update the member object
        //
        _getFormValues();

        bidx.common.notifySave();

        bidx.utils.log( "about to save member", member );

        bidxAPIParams   =
        {
            data:           member.bidxMentorProfile
        ,   groupDomain:    bidx.common.groupDomain
        ,   success:        function( response )
            {
                bidx.utils.log( bidxAPIService + "::success::response", response );

                bidx.common.closeNotifications();

                bidx.common.notifyRedirect();
                bidx.common.removeAppWithPendingChanges( appName );

                var url = document.location.href.split( "#" ).shift();

                // Maybe rs=true was already added, or not 'true' add it before reloading
                //
                var rs          = bidx.utils.getQueryParameter( "rs", url );
                var redirect_to = bidx.utils.getQueryParameter( "redirect_to", url );


                if( redirect_to ) {
                    url = '/' + redirect_to;
                }

                if ( !rs || rs !== "true" )
                {
                    url += ( url.indexOf( "?" ) === -1 ) ? "?" : "&";
                    url += "rs=true";
                }

                document.location.href = url;
            }
        ,   error:          function( jqXhr, textStatus )
            {
                params.error( jqXhr );
                bidx.common.closeNotifications();
            }
        };

        // Creating an entrepreneur is not possible via the member API, therefore the
        // raw Entity API is used for the creation of the entrepreneur
        //
        if ( state === "create" )
        {
            bidxAPIService          = "entity.save";
        }
        else
        {
            bidxAPIService          = "member.save";
            bidxAPIParams.memberId  = memberId;
        }

        // Call that service!
        //
        bidx.api.call(
            bidxAPIService
        ,   bidxAPIParams
        );
    }

    // Private functions
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    }

    function _showView( v )
    {
        currentView = v;

        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    }

    // ROUTER
    //
    function navigate( options )
    {
        //requestedState, section, id, cb
        switch ( options.requestedState )
        {
            case "edit":
                bidx.utils.log( "EditMember::AppRouter::edit", options.id, options.section );

                var newMemberId
                ,   splatItems
                ,   updateHash      = false
                ,   isId            = ( options.id && options.id.match( /^\d+$/ ) )
                ;

                if ( options.id && !isId )
                {
                    options.section = options.id;
                    options.id      = memberId;

                    updateHash = true;
                }

                // No memberId set yet and not one explicitly provided? Use the one from the session
                //
                if ( !memberId && !isId )
                {
                    options.id = bidx.utils.getValue( bidxConfig, "session.id" );

                    updateHash = true;
                }

                if ( !( state === "edit" && options.id === memberId ) )
                {
                    memberId            = options.id;
                    mentorProfileId     = null;
                    state               = "edit";

                    $element.show();
                    _showView( "load" );

                    // Make sure the i18n translations for this app are available before initing
                    //
                    bidx.i18n.load( [ "__global", appName ] )
                        .done( function()
                        {
                            _init();
                        } );
                }

                if ( updateHash )
                {
                    var hash = "editMentor/" + options.id;

                    if ( options.section )
                    {
                         hash += "/" + options.section;
                    }

                    return hash;
                }
            break;

            case "create":
                bidx.utils.log( "EditMentor::AppRouter::create" );

                // Protect against 'double creation' it is only allowed to have
                // one mentor profile
                //
                if ( bidx.common.getMentorProfileId() )
                {
                    return navigate( { requestedState: "edit" } );
                }
                else
                {
                    memberId    = null;
                    state       = "create";

                    $element.show();

                    _showView( "load" );

                    // Make sure the i18n translations for this app are available before initing
                    //
                    bidx.i18n.load( [ "__global", appName ] )
                        .done( function()
                        {
                            _init();
                        } );
                }

            break;

        }
    }

    // Reset the app back to it's initial state
    //
    function reset()
    {
        state = null;

        bidx.common.removeAppWithPendingChanges( appName );
    }

    // Engage!
    //
    _oneTimeSetup();

    // Expose
    //
    var app =
    {
        navigate:                   navigate
    ,   reset:                      reset

    ,   $element:                   $element

        // START DEV API
        //
        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.mentorprofile = app;
} ( jQuery ));
