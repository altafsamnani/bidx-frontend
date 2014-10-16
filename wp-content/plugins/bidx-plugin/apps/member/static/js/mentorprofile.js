;( function( $ )
{
    "use strict";

    var $element                            = $( "#editMentor" )
    ,   $views                              = $element.find( ".view" )
    ,   $editForm                           = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                           = $element.find( ".snippets" )

    ,   $focusLanguage                      = $editForm.find( "[name='focusLanguage']" )
    ,   $focusSocialImpact                  = $editForm.find( "[name='focusSocialImpact']" )
    ,   $focusEnvImpact                     = $editForm.find( "[name='focusEnvImpact']" )
    ,   $focusIndustry                      = $editForm.find( "[name='focusIndustry']" )
    ,   $focusExpertise                     = $editForm.find( "[name='focusExpertise']" )
    ,   $focusCountry                       = $editForm.find( "[name='focusCountry']" )

        // Attachnents
        //
    ,   $attachmentsControl                 = $editForm.find( ".attachmentsControl" )
    ,   $attachmentsContainer               = $attachmentsControl.find( ".attachmentsContainer" )
    ,   $btnAddAttachments                  = $attachmentsControl.find( ".js-btn-add-attachments")
    ,   $addAttachmentsModal                = $attachmentsControl.find( ".addAttachmentsModal" )

    ,   $toggles                            = $element.find( ".toggle" ).hide()
    ,   $toggleMentorsForInst               = $element.find( "[name='mentorsForInst']" )
    ,   $toggleFocusLocationType            = $element.find( "[name='focusLocationType']" )

    ,   $toggleInput                        = $element.find( ".toggleInput" )
    ,   $preferredCommunication             = $element.find( ".js-PreferredCommunication" )
    ,   $preferredCommunicationCheckBoxes   = $preferredCommunication.find( "[type='checkbox']" )

        // Industy Sectors
        //
    // ,   $industrySectors         = $editForm.find( ".industrySectors" )

    ,   member
    ,   memberId
    ,   mentorProfileId
    ,   state
    ,   currentView

    ,   geocoder
    ,  _getMapData

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
            'summary'
        ,   'mentorsForInst'
        ,   'institutionName'
        ,   'institutionWebsite'
        ,   'focusCountry'
        ,   'focusLanguage'
        ,   'focusExpertise'
        ,   'focusIndustry'
        ,   'focusGender'
        ,   'focusStageBusiness'
        ,   'focusSocialImpact'
        ,   'focusEnvImpact'
        ,   'focusPreferences'
        ,   'linkedIn'
        ]

    ,   preferredCommunication:
        [
            'skype'
        ,   'hangout'
        ,   'aim'
        ,   'icq'
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

        // Populate the selects
        //
        $focusIndustry.bidx_chosen(
        {
            dataKey:            "industry"
        });

        $focusExpertise.bidx_chosen(
        {
            dataKey:            "mentorExpertise"
        });

        $focusCountry.bidx_chosen(
        {
            dataKey:            "country"
        });

        $focusLanguage.bidx_chosen(
        {
            dataKey:            "language"
        });

        $focusSocialImpact.bidx_chosen(
        {
            dataKey:            "socialImpact"
        });

        $focusEnvImpact.bidx_chosen(
        {
            dataKey:            "envImpact"
        });

        // Run the industry widget on the selector
        //
        // $industrySectors.industries();

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
        }    }

    var _handleToggleChange = function( show, group )
    {
        var fn = show ? "fadeIn" : "hide";

        $toggles.filter( ".toggle-" + group )[ fn ]();
    };

    // The names of the browser's checkbox and the text input must be the same
    //
    var _handleCheckboxChange = function( show, checkbox )
    {
        var fn = show ? "fadeIn" : "hide";

        $toggleInput.find( "input[type='text'][name='" + checkbox + "']" )[ fn ]();
    };

    // Update the UI to show the input / previous run business'
    //
    $toggleMentorsForInst.change( function()
    {
        var value   = $toggleMentorsForInst.filter( "[checked]" ).val();

        _handleToggleChange( value === "true", "mentorsForInst" );
    } );

    $preferredCommunicationCheckBoxes.change( function()
    {
        var $el     = $(this)
        ,   name    = $el[0].name
        ,   value   = name.split('.')[1]
        ,   ck      = $el.prop('checked')
        ;

        _handleCheckboxChange( ck, value );
    } );


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
            bidx.util.warn( "entrepreneurprofile::_addAttachment: attachment is null!" );
            return;
        }

        var $attachment         = snippets.$attachment.clone()
        ,   createdDateTime     = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
        ,   $attachmentLink     = $attachment.find( ".documentLink" )
        ,   $attachmentImage    = $attachment.find( ".documentImage" )
        ,   $attachmentDefault  = $attachment.find( ".attachmentDefault" )
        ,   $attachmentMissing  = $attachment.find( ".attachmentMissing" )
        ,   deletedDoc          = false
        ;

        if ( !attachment.bidxMeta.bidxUploadId )
        {
            bidx.utils.warn( "entrepreneurprofile::_addAttachment: attachment has been deleted!" );
            deletedDoc = true;
        }
        else
        {
            $attachmentLink.attr( "href", attachment.document );
        }

        // Store the data so we can later use it to merge the updated data in
        //
        $attachment.data( "bidxData", attachment );

        $attachment.find( ".documentName"       ).text( attachment.documentName );
        $attachment.find( ".createdDateTime"    ).text( createdDateTime );

        $attachment.find( ".purpose"            ).text( attachment.purpose );
        $attachment.find( ".documentType"       ).text( bidx.data.i( attachment.documentType, "documentType" ) );

        // Check if attachment is an image
        if ( attachment.mimeType && attachment.mimeType.match( /^image/ ) )
        {
            $attachmentDefault.remove();
            $attachmentMissing.remove();

            $attachmentImage
                .attr( "src", attachment.document )
                .fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} )
            ;
        }
        else
        {
            $attachmentImage.remove();
            
            // Check if the file has been removed
            //
            if ( deletedDoc )
            {
                $attachment.find( ".documentName" ).text( bidx.i18n.i( "docDeleted" ) ).addClass( "text-danger" );
                $attachmentLink.remove();
            }
            else
            {
                $attachmentMissing.remove();
            }
        }

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

        // Industry Sectors
        //
        // var data = bidx.utils.getValue( member, "bidxMentorProfile.focusIndustrySector", true );

        // if ( data )
        // {
        //     $industrySectors.industries( "populateInEditScreen",  data );
        // }

        $.each( fields.preferredCommunication, function( i, f )
        {
            var $input     = $editForm.find( "[type='text'][name='" + f + "']" )
            ,   $checkbox  = $editForm.find( "[type='checkbox'][name='check." + f + "']" )
            ,   value      = bidx.utils.getValue( member, "bidxMentorProfile.preferredCommunication." + f )
            ;

            $input.each( function()
            {
                bidx.utils.setElementValue( $( this ), value );
            } );

            if ( $input.val() !== "" )
            {
                $checkbox.attr( "checked" , true);
                $input.fadeIn();
            }
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

        // Now that everything is processed, let's decide which of the focusLocation radio buttons must
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
            var focusReachReach         = bidx.utils.getValue( member, "bidxMentorProfile.focusReach.reach" )
            ,   focusReachCoordinates   = bidx.utils.getValue( member, "bidxMentorProfile.focusReach.coordinates" )
            ,   locData                 = focusReachCoordinates.split(",")
            ;

            $focusReach.bidx_location(
                "setLocationData"
            ,   {
                    reach:          focusReachReach
                ,   coordinates:    focusReachCoordinates
                }
            );

            _getMapData( locData[0], locData[1], function( err, response )
            {
                var formattedAddress = bidx.utils.getValue( response, "results.formatted_address" );

                if ( err )
                {
                    bidx.utils.log('_getMapData has an error::', err);
                    $focusReach.val( "" );
                }
                else
                {
                    $focusReach.val( formattedAddress );
                }
            } );
        }

        // Update the chosen components with our set values
        //
        $focusIndustry.trigger( "chosen:updated" );
        $focusExpertise.trigger( "chosen:updated" );
        $focusLanguage.trigger( "chosen:updated" );
        $focusCountry.trigger( "chosen:updated" );
        $focusSocialImpact.trigger( "chosen:updated" );
        $focusEnvImpact.trigger( "chosen:updated" );



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

        // Industry Sectors
        // var endSectors = $industrySectors.find( "[name*='endSector']" );

        // if ( endSectors )
        // {
        //     var arr = [];
        //     $.each( endSectors, function(i, f)
        //     {
        //         var value   = bidx.utils.getElementValue( $(f) );

        //         if ( value )
        //         {
        //             arr.push( value );
        //         }
        //     });

        //     arr = $.map( arr, function( n )
        //     {
        //         return n;
        //     });

        //     bidx.utils.setValue( member, "bidxMentorProfile.focusIndustrySector", arr );
        // }

        $.each( fields.preferredCommunication, function( i, f )
        {
            var $input  = $editForm.find( "[type='text'][name='" + f + "']" )
            ,   value   = bidx.utils.getElementValue( $input )
            ;

            bidx.utils.setValue( member, "bidxMentorProfile.preferredCommunication." + f, value );
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

        if ( focusLocationType !== "reach" )
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
        $preferredCommunication.find( "input[type='text']" ).hide();
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
        ,   ignore: ".chosen-search input, .search-field input"
        ,   rules:
            {
                "summary":
                {
                    required:               true
                }
            // ,   "focusIndustry":
            //     {
            //         required:               true
            //     }
            // ,   "focusSocialImpact":
            //     {
            //         required:               true
            //     }
            // ,   "focusEnvImpact":
            //     {
            //         required:               true
            //     }
            ,   "focusLanguage":
                {
                    required:               true
                }
            // ,   "focusGender":
            //     {
            //         required:               true
            //     }
            // ,   "focusStageBusiness":
            //     {
            //         required:               true
            //     }
            ,   "focusExpertise":
                {
                    required:               true
                }
            ,   "mentorsForInst":
                {
                    required:               true
                }
            ,   "institutionName":
                {
                    required:               { depends: function () { return !$( ".toggle-mentorsForInst" ).is(':hidden'); } }
                }
            ,   "institutionWebsite":
                {
                    required:               { depends: function () { return !$( ".toggle-mentorsForInst" ).is(':hidden'); } }
            ,       urlOptionalProtocol:    true
                }
            ,   "focusPreferences":
                {
                    maxlength:              400
                }
            ,   "skype":
                {
                    required:               { depends: function() { return !$( "[type='text'][name='skype']" ).is(':hidden'); } }
                }
            ,   "hangout":
                {
                    required:               { depends: function() { return !$( "[type='text'][name='hangout']" ).is(':hidden'); } }
                }
            ,   "aim":
                {
                    required:               { depends: function() { return !$( "[type='text'][name='aim']" ).is(':hidden'); } }
                }
            ,   "icq":
                {
                    required:               { depends: function() { return !$( "[type='text'][name='icq']" ).is(':hidden'); } }
                }
            ,   "preferredCommunicationAll":
                {
                    required:               { depends: function()
                                                {
                                                    var hasCheckedCheckbox = true;
                                                    $.each( $preferredCommunicationCheckBoxes, function( i, c ) {
                                                         if ( c.checked )
                                                         {
                                                            hasCheckedCheckbox = false;
                                                            $( "#preferredCommunicationAll" )
                                                                .attr( "checked" , true)
                                                                .removeClass('error')
                                                                .parent()
                                                                .removeClass('has-error');
                                                            return;
                                                         }
                                                    });
                                                    return hasCheckedCheckbox;
                                                }
                                            }
                }
            ,   "referencesAll":
                {
                    required:               { depends: function()
                                                {
                                                    var hasReference = true;
                                                    if ( $( "#mentorProfileReferences [name='linkedIn']" ).val() )
                                                    {
                                                        hasReference = false;
                                                    }
                                                    if ( $( ".attachmentItem" ).length )
                                                    {
                                                        hasReference = false;
                                                    }
                                                    return hasReference;
                                                }
                                            }
                }
            // ,   "linkedIn":
            //     {
            //         linkedIn:               true
            //     }
            // ,   "focusLocationType":
            //     {
            //         required:               { depends: function ()
            //                                     {
            //                                         var checked = false;
            //                                         if (
            //                                             $( ".toggle-focusLocationType-country" ).is(':hidden') &&
            //                                             $( ".toggle-focusLocationType-city" ).is(':hidden') &&
            //                                             $( ".toggle-focusLocationType-reach" ).is(':hidden')
            //                                            )
            //                                         {
            //                                             checked = true;
            //                                         }

            //                                         return checked;
            //                                     }
            //                                 }
            //     }
            // ,   "focusCountry":
            //     {
            //         required:               { depends: function ()
            //                                     {
            //                                         var visibleAndHasVal = false;
            //                                         if (
            //                                             $( "#radio-mentorFocusLocationTypeCountry" ).is(':checked') &&
            //                                             !$( ".toggle-focusLocationType-country" ).val()
            //                                            )
            //                                         {
            //                                             visibleAndHasVal = true;
            //                                         }

            //                                         return visibleAndHasVal;
            //                                     }
            //                                 }
            //     }
            // ,   "focusCity":
            //     {
            //         required:               { depends: function ()
            //                                     {
            //                                         var visibleAndHasVal = false;
            //                                         if (
            //                                             $( "#radio-mentorFocusLocationTypeCity" ).is(':checked') &&
            //                                             !$( ".toggle-focusLocationType-city" ).find( ".bidx-tag" ).length
            //                                            )
            //                                         {
            //                                             visibleAndHasVal = true;
            //                                         }

            //                                         return visibleAndHasVal;
            //                                     }
            //                                 }
            //     }
            // ,   "focusReach":
            //     {
            //         required:               { depends: function ()
            //                                     {
            //                                         var visibleAndHasVal = false;
            //                                         if (
            //                                             $( "#radio-mentorFocusLocationTypeReach" ).is(':checked') &&
            //                                             !$( ".toggle-focusLocationType-reach" ).val()
            //                                            )
            //                                         {
            //                                             visibleAndHasVal = true;
            //                                         }

            //                                         return visibleAndHasVal;
            //                                     }
            //                                 }
            //     }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
                "preferredCommunicationAll": bidx.i18n.i( "preferredCommunicationAll", appName )
            ,   "referencesAll":             bidx.i18n.i( "referencesAll",             appName )
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

                        // Offer a login modal if not authecticated
                        if ( jqXhr.status === 401 )
                        {
                            $( ".loginModal" ).modal();
                        }

                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                    }
                } );
            }
        } );

        // Instantiate location plugin
        bidx.common.loadGoogleMap( { callback:   function()
                                                {
                                                    //
                                                    $editForm.find( "[data-type=location]"   ).bidx_location(
                                                    {
                                                        drawCircle:                 true
                                                    } );

                                                    geocoder = new google.maps.Geocoder();

                                                    _getMapData = function( Lat, Lng, cb )
                                                    {
                                                        var location = new google.maps.LatLng( Lat, Lng );

                                                        geocoder.geocode(
                                                            {
                                                                "latLng":      location
                                                            }
                                                        ,   function( results, status )
                                                            {
                                                                bidx.utils.log( "_getMapData::geocode", results );

                                                                if ( status === google.maps.GeocoderStatus.OK )
                                                                {
                                                                    cb( null, { results: results[ 0 ] } );
                                                                }
                                                                else
                                                                {
                                                                    cb( new Error( "Unable to geocode " + status ));
                                                                }
                                                            }
                                                        );
                                                    };
                                                }
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

                            bidx.utils.log( "bidx::mentor", member );

                            _populateScreen();

                            $btnSave.removeClass( "disabled" );
                            $btnCancel.removeClass( "disabled" );

                            bidx.common.removeValidationErrors();

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

        // Creating an mentor is not possible via the member API, therefore the
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

        $(".type-bidx").find( ".total-error-message" ).hide();
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
