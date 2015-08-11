/* global bidx */
;( function( $ )
{
    "use strict";

    var iclVars                             = window.icl_vars || {}
    ,   $element                            = $( "#editMember" )
    ,   $views                              = $element.find( ".view" )
    ,   $editForm                           = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                           = $element.find( ".snippets" )

    ,   $languageList                       = $editForm.find( ".languageList" )
    ,   $inputAddLanguage                   = $editForm.find( "input[name='addLanguage']" )

    ,   $personalDetailsNationality         = $editForm.find( "[name='personalDetails.nationality']" )
    ,   $personalDetailsHighestEducation    = $editForm.find( "[name='personalDetails.highestEducation']" )
    ,   $tagCheckBox                        = $("[name='tag-checkbox']")
    ,   $investorTagging                    = $( ".investorTagging")
    ,   $mentorTagging                      = $( ".mentorTagging")
    ,   $investorTaggingLabel               = $( ".investorTaggingLabel")
    ,   $mentorTaggingLabel                 = $( ".mentorTaggingLabel")

    ,   $connect                            = $('.connect')

        // Profile picture
        //
    ,   $profilePictureControl              = $editForm.find( ".profilePictureControl" )
    ,   $profilePictureContainer            = $profilePictureControl.find( ".profilePictureContainer" )
    ,   $btnChangeProfilePicture            = $profilePictureControl.find( "a[href$='#changeProfilePicture']" )
    ,   $btnRemoveProfilePicture            = $profilePictureControl.find( "a[href$='#removeProfilePicture']" )
    ,   $changeProfilePictureModal          = $profilePictureControl.find( ".changeProfilePictureModal" )
    ,   $scaleBtns                          = $profilePictureControl.find( ".js-scale" )

        // Attachnents
        //
    ,   $attachmentsControl                 = $editForm.find( ".attachmentsControl" )
    ,   $attachmentsContainer               = $attachmentsControl.find( ".attachmentsContainer" )
    ,   $btnAddAttachments                  = $attachmentsControl.find( "a[href$='#addAttachments']")
    ,   $addAttachmentsModal                = $attachmentsControl.find( ".addAttachmentsModal" )
    ,   $connectBtn                         = $( '.btn-contact' )

        // Current Address
        //
    ,   $currentAddressMap                  = $editForm.find( ".currentAddressMap" )
    ,   $currentAddressCountry              = $editForm.find( "[name='personalDetails.address[0].country']"         )
    ,   $currentAddressCityTown             = $editForm.find( "[name='personalDetails.address[0].cityTown']"        )
    ,   $currentAddressPostalCode           = $editForm.find( "[name='personalDetails.address[0].postalCode']"      )
    ,   $currentAddressStreet               = $editForm.find( "[name='personalDetails.address[0].street']"          )
    ,   $currentAddressStreetNumber         = $editForm.find( "[name='personalDetails.address[0].streetNumber']"    )
    ,   $currentAddressCoordinates          = $editForm.find( "[name='personalDetails.address[0].coordinates']"     )

    ,   geocoder
    ,   currentAddressMap
    ,   currentAddressMapOptions

    ,   member
    ,   memberId
    ,   memberProfileId
    ,   visitingMemberPageId                = bidx.utils.getValue( bidxConfig, "context.memberId" )
    ,   memberData                          = window.__bidxMember
    ,   state
    ,   currentView

    ,   redirect                            = {}
    ,   snippets                            = {}

    ,   appName                             = "member"
    ,   loggedInMemberId                    = bidx.common.getCurrentUserId()

        // Languages
        //
    ,   $languageSelect                     = $editForm.find( "[name='languages']"     )
    ,   languages

        // Object for maintaining a list of currently selected languages, for optimizations only
        //
    ,   addedLanguages                      = {}
    ,   removedLanguages
    ;

    // Form fields
    //
    var arrayFields = [ "address", "contactDetail" ];

    var fields =
    {
        personalDetails:
        [
            'firstName'
        ,   'lastName'
        ,   'professionalTitle'
        ,   'gender'
        ,   'nationality'

        ,   'dateOfBirth'
        ,   'highestEducation'
        ,   'linkedIn'
        ,   'facebook'
        ,   'emailAddress'
        ,   'skype'
        ,   'twitter'

        ,   'landline'
        ,   'mobile'
        ,   'fax'
        ]

    ,   address:
        [
            'eTR'
        ,   'street'
        ,   'streetNumber'
        ,   'neighborhood'
        ,   'cityTown'
        ,   'country'
        ,   'postalCode'
        ,   'postBox'
        ,   'coordinates'
        ]

    ,   languageDetail:
        [
            'language'
        ,   'motherLanguage'
        ,   'workingLanguage'
        ,   'ratingSpoken'
        ,   'ratingWritten'
        ]

    ,   contactDetail:
        [
            'landLine'
        ,   'mobile'
        ,   'fax'
        ]
    };

    function _inContacts( )
    {
        var connectOptions
        ,   btnOptions      =   { }
        ;

        connectOptions =    {
                                currentUserId:          loggedInMemberId
                            ,   visitingMemberPageId:   visitingMemberPageId
                            };

        bidx.utils.log( 'connectOptions: ', connectOptions);

        $connect.connect( connectOptions );

        btnOptions =    {
                            label:      bidx.i18n.i('lblConnect')
                        ,   iconClass:  'fa-user-plus fa-above fa-big'
                        ,   class:      'connectUserButton'
                        };

        $connect.connect( "constructButton", btnOptions );
    }

    function _tagging( options )
    {
        var btnOptions          =   {}
        ,   labelOptions        =   {}
        ,   taggingOptions      =   {}
        ,   $tagging            =   options.$tagging
        ,   entityId            =   options.entityId
        ,   tagsData            =   options.tagsData
        ,   labelClass          =   options.labelClass
        ,   labelSectionClass   =   options.labelSectionClass
        ,   buttonClass         =   options.buttonClass
        ;

        if( entityId )
        {
            taggingOptions =    {
                                    entityId:   entityId
                                ,   tagsData:   tagsData
                                };

            bidx.utils.log( labelClass + ' taggingOptions: ', taggingOptions);

            $tagging.tagging( taggingOptions );
            $tagging.tagging("setGroupTagsData");

           // $tagging.tagging( "constructCustomTags", labelOptions );

            labelOptions =  {
                                tags:           [{
                                                    label:      bidx.i18n.i('lblPendingAccreditation')
                                                ,   status:     'pending'
                                                ,   iconClass:  'fa-bookmark-o'
                                                ,   class:      'accr-Pending'
                                                ,   default:    true
                                                },
                                                {
                                                    label:      bidx.i18n.i('lblMarked') + ' ' + bidx.i18n.i('lblAccreditation')
                                                ,   status:     'accredited'
                                                ,   iconClass:  'fa-bookmark'
                                                ,   class:      'accr-Accepted'
                                                },
                                                {
                                                    label:      bidx.i18n.i('lblMarked') + ' ' + bidx.i18n.i('lblNoAccreditation')
                                                ,   status:     'accreditation_refused'
                                                ,   iconClass:   'fa-ban'
                                                ,   class:      'accr-Refused'
                                                }]
                            ,   class:          labelClass
                            ,   sectionClass:   labelSectionClass
                            };

            $tagging.tagging( "constructLabel", labelOptions );
            $tagging.tagging( "constructSectionLabel", labelOptions );

            btnOptions =    {
                                tags:   [{
                                            label:      bidx.i18n.i('lblAccreditation')
                                        ,   attached:   'accredited'
                                        ,   detached:   'accreditation_refused'
                                        ,   iconClass:  'fa-bookmark'
                                        ,   class:      'btn-success'
                                        ,   type:       'accredited'
                                        ,   visibility: 'CONTACTS'
                                        },
                                        {
                                            label:      bidx.i18n.i('lblNoAccreditation')
                                        ,   attached:   'accreditation_refused'
                                        ,   iconClass:  'fa-ban'
                                        ,   detached:   'accredited'
                                        ,   class:      'btn-danger'
                                        ,   type:       'nonaccredited'
                                        ,   visibility: 'CONTACTS'
                                        }]
                            ,   class:  buttonClass
                            };

            bidx.utils.log('Investor Profile constructButton: ', btnOptions);

            $tagging.tagging( "constructButton", btnOptions );

            return true;
        }
    }

    function _investorAccreditation ( options )
    {
        // Render Accreditation Button for Investor
        _tagging({
                    entityId:           options.entityId
                ,   $tagging:           $investorTagging
                ,   tagsData:           options.tagsData
                ,   labelClass:         'investorTaggingLabel'
                ,   labelSectionClass:  'investorSectionTaggingLabel'
                ,   buttonClass:        'investorTaggingButton'
                } );
    }

    function _mentorAccreditation ( options )
    {
        //Render Accreditation Button for Mentor
        _tagging({
                    entityId:           options.entityId
                ,   $tagging:           $mentorTagging
                ,   tagsData:           options.tagsData
                ,   labelClass:         'mentorTaggingLabel'
                ,   labelSectionClass:  'mentorSectionTaggingLabel'
                ,   buttonClass:        'mentorTaggingButton'
                } );
    }

    function _accreditation()
    {
        var switchCount             =   0
        ,   isGroupAdmin            =   bidx.common.isGroupAdmin( )
        ,   investorProfile         =   bidx.utils.getValue(memberData, 'member.bidxInvestorProfile' )
        ,   investorProfileEntityId =   bidx.utils.getValue(investorProfile, 'bidxMeta.bidxEntityId' )
        ,   investorTagsData        =   bidx.utils.getValue(investorProfile, 'bidxMeta.tagAssignmentSummary' )
        ,   mentorProfile           =   bidx.utils.getValue(memberData, 'member.bidxMentorProfile' )
        ,   mentorProfileEntityId   =   bidx.utils.getValue(mentorProfile, 'bidxMeta.bidxEntityId' )
        ,   mentorTagsData          =   bidx.utils.getValue(mentorProfile, 'bidxMeta.tagAssignmentSummary' )
        ,   visitingMemberPageId    =   bidx.utils.getValue( bidxConfig, "context.memberId" )
        ,   status                  =   false
        ;

        if( (loggedInMemberId !== visitingMemberPageId) && (investorProfileEntityId || mentorProfileEntityId ) )
        {
            if( investorProfileEntityId )
            {
                status  =   true;

                _investorAccreditation(
                {
                    entityId:   investorProfileEntityId
                ,   tagsData:   investorTagsData
                });

                $investorTagging.removeClass( 'hide' );

                $investorTaggingLabel.removeClass( 'hide' );

                switchCount++;
            }

            if( mentorProfileEntityId )
            {
                _mentorAccreditation(
                {
                    entityId:   mentorProfileEntityId
                ,   tagsData:   mentorTagsData
                });

                if( !investorProfileEntityId )
                {
                    $mentorTagging.removeClass( 'hide' );
                    $mentorTaggingLabel.removeClass( 'hide' );

                    status  =   false;
                }

                switchCount++;
            }

            if( isGroupAdmin )
            {
                _addTaggingSwitch(
                {
                    switchCount:    switchCount
                ,   status:         status
                });
            }


        }
    }

    function _addTaggingSwitch( options )
    {
        var $markLabel  =   $('.markLabel')
        ,   switchCount =   options.switchCount
        ,   status      =   options.status
        ;

        $tagCheckBox.on('switchChange.bootstrapSwitch',
                        function(event, state)
                        {
                            var label
                            ,   onLabel     =   $(this).data('onText')
                            ,   offLabel    =   $(this).data('offText');

                            if( state )
                            {
                                $mentorTagging.addClass( 'hide' );
                                $investorTagging.removeClass( 'hide' );

                                $mentorTaggingLabel.addClass( 'hide' );
                                $investorTaggingLabel.removeClass( 'hide' );
                            }
                            else
                            {
                                $investorTagging.addClass( 'hide' );
                                $mentorTagging.removeClass( 'hide' );

                                $investorTaggingLabel.addClass( 'hide' );
                                $mentorTaggingLabel.removeClass( 'hide' );
                            }
                        });

        $tagCheckBox.bootstrapSwitch( 'state', status );
        $markLabel.removeClass('hide');
        if( switchCount === 1)
        {

            $tagCheckBox.bootstrapSwitch( 'toggleDisabled' );
        }
    }


    // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup()
    {

        _snippets();
        _languages();
        _attachments();

        if(loggedInMemberId)
        {
            _getActiveContacts();
        }

        _inContacts();

        _accreditation();

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

        // Populate the select's
        //
        $personalDetailsNationality.bidx_chosen(
        {
            dataKey:            "nationality"
        ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
        });

        $currentAddressCountry.bidx_chosen(
        {
            dataKey:            "country"
        ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
        });

        $personalDetailsHighestEducation.bidx_chosen(
        {
            dataKey:            "education"
        ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
        });

        $btnRemoveProfilePicture.click( function( e )
        {
            e.preventDefault();

            $profilePictureContainer.find( "img" ).remove();
            $profilePictureContainer.find( ".js-cropper" ).remove();
        } );


        // Profile picture
        //
        $btnChangeProfilePicture.click( function( e )
        {
            e.preventDefault();

            // Make sure the media app is within our modal container
            //
            $( "#media" ).appendTo( $changeProfilePictureModal.find( ".modal-body" ) );

            var $selectBtn = $changeProfilePictureModal.find( ".btnSelectFile" )
            ,   $cancelBtn = $changeProfilePictureModal.find( ".btnCancelSelectFile" )
            ;

            // Navigate the media app into list mode for selecting files
            //
            bidx.media.navigate(
            {
                requestedState:         "list"
            ,   slaveApp:               true
            ,   selectFile:             true
            ,   multiSelect:            false
            ,   showEditBtn:            false
            ,   onlyImages:             true
            ,   btnSelect:              $selectBtn
            ,   btnCancel:              $cancelBtn
            ,   callbacks:
                {
                    ready:                  function( state )
                    {
                        bidx.utils.log( "[profile picture] ready in state", state );
                    }

                ,   cancel:                 function()
                    {
                        // Stop selecting files, back to previous stage
                        //
                        $changeProfilePictureModal.modal('hide');
                    }

                ,   success:                function( file )
                    {
                        bidx.utils.log( "[profile picture] uploaded", file );

                        // NOOP.. the parent app is not interested in when the file is uploaded
                        // only when it is attached / selected
                    }

                ,   select:               function( file )
                    {
                        bidx.utils.log( "[profile picture] selected profile picture", file );

                        $profilePictureContainer.data( "bidxData", file );
                        $profilePictureContainer.html( $( "<img />", { "src": file.document, "data-fileUploadId": file.fileUpload } ));

                        $changeProfilePictureModal.modal( "hide" );
                        _enableCropping( file );
                    }
                }
            } );

            $changeProfilePictureModal.modal();
        } );

        // PUll snippets from the DOM
        //
        function _snippets()
        {
            snippets.$language      = $snippets.children( ".languageItem"   ).remove();
            snippets.$attachment    = $snippets.children( ".attachmentItem" ).remove();
        }

        // Lnaguages control
        //
        function _languages()
        {
            $languageSelect.bidx_chosen(
            {
                dataKey:            "language"
            ,   emptyValue:         bidx.i18n.i( "frmSelectFieldRequired" )
            });

            $languageSelect.on('change', function(event) {

                var language        = $(this).find( "option:selected" ).text()
                ,   value
                ;

                value = _getLanguageValueByLabel( language );

                if ( value && !addedLanguages[ language ] )
                {
                    addedLanguages[ language ] = true;

                    _addLanguageDetailToList( { language: value, motherLanguage: false } );
                }

                $(this).find( "option:selected" ).prop("selected", false);
                $languageSelect.trigger( "chosen:updated" );

            });

            // Retrieve the list of languages from the data api
            //
            bidx.data.getContext( "language", function( err, data )
            {
                languages = data;
            } );

            // Remove the language from the list
            //
            $languageList.delegate( ".btnRemoveLanguage", "click", function( e )
            {
                e.preventDefault();

                var $languageItem   = $( this ).closest( ".languageItem" )
                ,   languageDetail  = $languageItem.data( "bidxData" )
                ,   languageLabel   = _getLanguageLabelByValue( languageDetail.language )
                ;

                delete addedLanguages[ languageLabel ];

                $languageItem.remove();

                removedLanguages.push( languageDetail );
            } );

            // Update the languages, and only set the clicked one to be the mother language
            //
            $languageList.delegate( ".btnSetMotherLanguage", "click", function( e )
            {
                e.preventDefault();

                var $btn            = $( this )
                ,   $languageItem   = $btn.closest( ".languageItem" )
                ;

                // Unset motherLanguage on all the languages first
                //
                $languageList.find( ".languageItem" ).each( function()
                {
                    var $item           = $( this )
                    ,   languageDetail  = $item.data( "bidxData" )
                    ;

                    languageDetail.motherLanguage = false;

                    $item.data( "languageDetail", languageDetail );

                    $item.find( ".btnSetMotherLanguage"     ).show();
                    $item.find( ".isCurrentMotherLanguage"  ).hide();
                } );

                // And set the motherLanguage on this item to true
                //
                var languageDetail = $languageItem.data( "bidxData" );

                languageDetail.motherLanguage = true;
                $languageItem.data( "languageDetail", languageDetail );

                $languageItem.find( ".isCurrentMotherLanguage"  ).show();
                $languageItem.find( ".btnSetMotherLanguage"     ).hide();
            } );
        }

        // Generic attachments
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
                itemsPerRow:        2
            ,   itemClass:          "attachmentItem"
            } );
        }

        function _getActiveContacts( options )
        {
            bidx.utils.log( "[members] get active contacts" );
            var status
            ,   limit
            ,   offset
            ;

            bidx.api.call(
                "memberRelationships.fetch"
            ,   {
                    extraUrlParameters:
                    [
                        {
                            label:      "type",
                            value:      "contact"
                        }
                    ,   {
                            label:      "status",
                            value:      "active"
                        }
                    /*,   {
                            label:      "limit",
                            value:      limit
                        }
                    ,   {
                            label:      "offset",
                            value:      offset
                        }*/
                    ]
                ,   requesterId:              loggedInMemberId
                ,   groupDomain:              bidx.common.groupDomain

                ,   success: function( response )
                    {
                        var sortIndex           = []
                        ,   contacts            = {}
                        ,   result              = {}
                        ,   showConnectBtn      = true
                        ,   currentUserId       = bidx.utils.getValue( bidxConfig, "session.id" )
                        ;

                        bidx.utils.log("[members] retrieved following active contacts ", response );
                        if ( response && response.relationshipType && response.relationshipType.contact && response.relationshipType.contact.types )
                        {
                            if ( response.relationshipType.contact.types.active )
                            {

                                // then add the active contactsm but we first check if we are not adding a duplicate member id (member who already acts as an admin or groupowner )
                                //
                                $.each( response.relationshipType.contact.types.active , function ( idx, item)
                                {
                                    // if active contact id is matched with visiting member id then hide the button

                                    if ( showConnectBtn && ( item.id === parseInt( visitingMemberPageId, 10 ) ) )
                                    {
                                        showConnectBtn =  false;

                                        return false; //break; no more need to iterate the loop break
                                    }
                                });

                                if( showConnectBtn )
                                {
                                    $connectBtn.removeClass('hide');
                                }

                            }
                            else
                            {
                                bidx.utils.warn( "No active contacts available ");
                            }

                        }

                    }

                ,   error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText);

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + response.text );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + response.text );
                        }

                    }
                }
            );
        }
    }


    // Try to gecode the address (array)
    // On failure, pop one item from the address array and retry untill there is no
    // address left or we found a location
    //
    function _geocode( region, address, cb )
    {
        geocoder.geocode(
            {
                "address":      address.join( ", " )
            ,   "region":       region
            }
        ,   function( results, status )
            {
                bidx.utils.log( "geocode", region, address, status, results );

                if ( status === google.maps.GeocoderStatus.OK )
                {
                    cb( null, { results: results[ 0 ], address: address } );
                }
                else if ( address.length > 1 )
                {
                    address.splice( -1, 1 );
                    _geocode( region, address, cb );
                }
                else
                {
                    cb( new Error( "Unable to geocode " + status ));
                }
            }
        );
    }

    // Update the address onto the map via geocodeing
    //
    function _updateCurrentAddressMap()
    {
        var address         = []
        ,   country         = $currentAddressCountry.val()
        ,   countryDescr    = $currentAddressCountry.find( "option:selected" ).text()
        ,   cityTown        = $currentAddressCityTown.val()
        ,   postalCode      = $currentAddressPostalCode.val()
        ,   street          = $currentAddressStreet.val()
        ,   streetNumber    = $currentAddressStreetNumber.val()
        ,   region          = ""
        ;

        // Do not bother too lookup when no country is selected
        //
        if ( !country )
        {
            $currentAddressCoordinates.val( "" );
            $currentAddressMap.hide();
        }
        else
        {
            address.push( countryDescr );
            region  = country;

            if ( cityTown )
            {
                address.push( cityTown );
            }

            if ( postalCode )
            {
                address.push( postalCode );
            }

            if ( street )
            {
                if ( streetNumber )
                {
                    address.push( street + " " + streetNumber );
                }
                else
                {
                    address.push( street );
                }
            }

            // Try to geocode it with the provided address
            //
            _geocode( region, address , function( err, response )
            {
                var location        = bidx.utils.getValue( response, "results.geometry.location" )
                ,   addressItems    = response.address.length
                ,   zoom
                ,   coordinates
                ;

                if ( err || !location )
                {
                    $currentAddressCoordinates.val( "" );
                    $currentAddressMap.hide();
                }
                else
                {
                    coordinates = location.lat() + ", " + location.lng();

                    $currentAddressCoordinates.val( coordinates );

                    // Zoom in according to the amount of address elements used
                    //
                    zoom = 3 + addressItems * 3;

                    currentAddressMap.setZoom( zoom );
                    currentAddressMap.setCenter( response.results.geometry.location );

                    $currentAddressMap.fadeIn( function()
                    {
                        google.maps.event.trigger( currentAddressMap, "resize" );
                    });
                }
            } );
        }
    }

    // Convenience function for translating a language key to it's description
    //
    function _getLanguageLabelByValue( value )
    {
        var label;

        $.each( languages, function( i, item )
        {
            if ( item.value === value )
            {
                label = item.label;
            }
        } );

        return label;
    }

    // Convenience function for translating a language description to it's key
    //
    function _getLanguageValueByLabel( label )
    {
        var key;

        $.each( languages, function( i, item )
        {
            if ( item.label === label )
            {
                key = item.value;
            }
        } );

        return key;
    }

    // Add cropping functionality
    //
    function _enableCropping( obj )
    {
        var $profileImg     = $profilePictureContainer.find( "img" )
        ,   pictureWidth    = (obj.width === undefined ) ? false : obj.width
        ,   pictureLeft     = (obj.left  === undefined ) ? 0     : obj.left
        ,   pictureTop      = (obj.top   === undefined ) ? 0     : obj.top
        ;

        $( $profileImg ).load( function()
        {
            if ( $profileImg[0].width < 90 || $profileImg[0].height < 90 )
            {
                // NOOP : hide the scaling buttons
                bidx.utils.log('Picture is less than 90px and therefore no need to be cropped');
                $scaleBtns.addClass( "hide" );
            }
            else
            {
                var $cropper = $profilePictureContainer.append( $( "<div />", { "class": "js-cropper" } )).find( ".js-cropper" );

                $cropper.udraggable(
                {
                    containment: 'parent'
                });

                if ( pictureWidth )
                {
                    $profileImg.css({ "width": pictureWidth });
                }

                // Update the cropper position
                //
                $cropper.css({ "left": pictureLeft, "top": pictureTop });

                _addImageScaling( $profileImg );
            }
        });
    }

    // Add scaling functionality
    // TODO: Prevent the image to scale below 90px width or height and disable the according btns
    //
    function _addImageScaling( element )
    {
        var $el             = element
        ,   $cropper        = $el.next()
        ,   originalWidth   = $el.width()
        // ,   newWidth
        // ,   newHeight
        ;

        $scaleBtns.delegate( ".btn", "click", function( e )
        {
            e.preventDefault();
            $cropper.css({ "left": 0, "top": 0 });
            // newWidth = $(this).parents( ".profilePictureControl" ).find( "img" )[0].width;
            // newHeight = $(this).parents( ".profilePictureControl" ).find( "img" )[0].height;
            // bidx.utils.log('newWidth:::', newWidth);
            // bidx.utils.log('newHeight:::', newHeight);
        });

        $scaleBtns.delegate( ".js-smaller", "click", function()
        {
            $el.width( Math.floor( $el.width() * 0.8 ) );
        });

        $scaleBtns.delegate( ".js-bigger", "click", function()
        {
            $el.width( Math.floor( $el.width() * 1.2 ) );
        });

        $scaleBtns.delegate( ".js-reset", "click", function()
        {
            $el.width( originalWidth );
        });

        // Show the scaling buttons
        //
        $scaleBtns.removeClass( "hide" );
    }

    // Use the retrieved member object to populate the form and other screen elements
    //
    function _populateScreen()
    {
        $.each( fields.personalDetails, function( i, f )
        {
            var $input  = $editForm.find( "[name='personalDetails." + f + "']" )
            ,   value   = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails." + f )
            ;
            if( f === 'gender')
            {
                bidx.utils.log('$input', $input);
                bidx.utils.log('valueee',value);

            }
            $input.each( function()
            {
                if(f === 'gender')
                {
                    bidx.utils.log(' $( this )', $( this ));
                }
                bidx.utils.setElementValue( $( this ), value );
            } );
        } );

        // Profile picture is 'special'
        //
        var profilePicture   = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.profilePicture.document" )
        ,   profilePictureId = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.profilePicture.fileUpload" )
        ,   profileUploadId  = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.profilePicture.bidxMeta.bidxUploadId" )
        ;

        if ( profilePicture )
        {
            $profilePictureContainer.data( "bidxData", profilePictureId );
            $profilePictureContainer.append( $( "<img />", { "src": profilePicture, "data-fileUploadId": profilePictureId } ));

            _enableCropping( bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.profilePicture" ) );
        }

        if ( !profileUploadId && !profilePictureId )
        {
            $profilePictureContainer
                    .append
                    (
                        $( "<div />", { "class": "icons-rounded" } )
                        .append
                        (
                            $( "<i />", { "class": "fa fa-user document-icon" } )
                        )
                    );
        }

        if ( !profileUploadId && profilePictureId )
        {
            $profilePictureContainer
                    .append
                    (
                        $( "<div />", { "class": "icons-rounded" } )
                        .append
                        (
                            $( "<i />", { "class": "fa fa-question-circle document-icon" } )
                        )
                    );
            $profilePictureContainer.append( $( "<p />", { "html": bidx.i18n.i( "docDeleted" ) } ) );
        }

        // Setup the hidden fields used in the file upload
        //
        $editForm.find( "[name='domain']"           ).val( bidx.common.groupDomain );
        $editForm.find( "[name='memberProfileId']"  ).val( memberProfileId );

        // Now the nested objects
        //
        $.each( [ "address", "contactDetail" ], function()
        {
            var nest    = this + ""
            ,   items   = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails." + nest, true )
            ;

            if ( items )
            {
                $.each( items, function( i, item )
                {
                    // Find the container for this item and store the data on it
                    //
                    var containerDataSet = false;

                    $.each( fields[ nest ], function( j, f )
                    {
                        var $input  = $editForm.find( "[name='personalDetails." + nest + "[" + i + "]." + f + "']" )
                        ,   value   = bidx.utils.getValue( item, f )
                        ;

                        // Store the item on the warpper / item so we can later use this to
                        // merge the data back
                        //
                        if ( !containerDataSet && $input.length )
                        {
                            $input.closest( "." + nest + "Item" ).data( "bidxData", item );
                            containerDataSet = true;
                        }

                        // Sometimes the data coming back from the API is in lowercase, and since it's a lookup concept we need to have it uppercase
                        //
                        if ( value && f === "country" )
                        {
                            value = value.toUpperCase();
                        }

                        $input.each( function()
                        {
                            bidx.utils.setElementValue( $( this ), value  );
                        } );
                    } );
                } );
            }
        } );

        // Language is handled specially
        //
        var languageDetail      = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.languageDetail", true );

        if ( languageDetail )
        {
            $.each( languageDetail, function( i, language )
            {
                _addLanguageDetailToList( language );
            } );
        }

        // Attachments
        //
        var attachments         = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.attachment", true );

        if ( attachments)
        {
            $.each( attachments, function( idx, attachment )
            {
                bidx.utils.log( "attachment ", idx, attachment );
                _addAttachment( attachment );
            } );
        }

        _updateCurrentAddressMap();

        $personalDetailsNationality.trigger( "chosen:updated" );
        $personalDetailsHighestEducation.trigger( "chosen:updated" );
        $currentAddressCountry.trigger( "chosen:updated" );
    }

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

    // Add an item to the language list and render the HTML for it
    //
    function _addLanguageDetailToList( languageDetail )
    {
        var $language       = snippets.$language.clone()
        ,   languageDescr   = ""
        ;

        if ( languageDetail.language )
        {
            // Make sure the language key is *always* in lowercase
            //
            languageDetail.language = languageDetail.language.toLowerCase();
            languageDescr = _getLanguageLabelByValue( languageDetail.language );
        }

        if ( languageDescr )
        {
            addedLanguages[ languageDescr ] = true;
        }

        $language.find( ".languageDescr" ).text( languageDescr );

        if ( languageDetail.motherLanguage )
        {
            $language.find( ".btnSetMotherLanguage" ).hide();
        }
        else
        {
            $language.find( ".isCurrentMotherLanguage" ).hide();
        }

        $language.data( "bidxData", languageDetail );

        $languageList.append( $language );
    }

    // Convert the form values back into the member object
    //
    function _getFormValues()
    {

        $.each( fields.personalDetails, function( i, f )
        {
            var $input  = $editForm.find( "[name='personalDetails." + f + "']" )
            ,   value   = bidx.utils.getElementValue( $input )
            ;

            bidx.utils.setValue( member, "bidxMemberProfile.personalDetails." + f, value );
        } );

        // Collect the nested objects from inside personalDetails
        //
        $.each( [ "address", "contactDetail" ], function()
        {
            var nest                = this + ""
            ,   i                   = 0
            ,   arrayField          = $.inArray( nest, arrayFields ) !== -1
            ,   memberPath          = "bidxMemberProfile.personalDetails." + nest
            ,   item                = bidx.utils.getValue( member, memberPath, true )
            ,   count
            ;

            if ( arrayField )
            {
                count   = $editForm.find( "." + nest + "Item" ).length;
                item    = [];
            }
            else
            {
                item    = {};
            }

            bidx.utils.setValue( member, memberPath, item );

            bidx.utils.setNestedStructure( item, count, "personalDetails." + nest, $editForm, fields[ nest ]  );
        } );

        // Language Detail is handled specially
        //
        var languageDetail = [];

        $languageList.find( ".languageItem" ).each( function()
        {
            var $languageItem   = $( this )
            ,   data            = $languageItem.data( "bidxData" )
            ;

            languageDetail.push( data );
        } );

        // Add the removed languages
        $.each( removedLanguages, function( idx, removedLanguage )
        {
            // Iterate over the properties and set all, but bidxMeta, to null
            //
            $.each( removedLanguage, function( prop )
            {
                if ( prop !== "bidxMeta" )
                {
                    removedLanguage[ prop ] = null;
                }
            } );

            languageDetail.push( removedLanguage );
        } );

        bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.languageDetail", languageDetail );

        // Normalize the linked in username / url
        //
        var linkedIn      = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.linkedIn" );

        linkedIn = bidx.utils.normalizeLinkedInUrl( linkedIn );

        if ( linkedIn )
        {
            bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.linkedIn", linkedIn );
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

        bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.attachment", attachments );

        // ProfilePicture
        //
        var profilePicture      = $profilePictureContainer.data( "bidxData" )
        ,   fileUpload          = bidx.utils.getValue( profilePicture, "fileUpload" );

        if( fileUpload )
        {
            bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.profilePicture.fileUpload", fileUpload );
        }
        // Crop
        //
        var $profilePicture     = $profilePictureContainer.find( "img" )
        ,   $cropper            = $profilePictureContainer.find( ".js-cropper" )
        ,   profilePictureWidth = $profilePicture.width()
        ,   cropPosition        = $cropper.position()
        ;

        bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.profilePicture.width", profilePictureWidth );

        if ( profilePictureWidth > 90)
        {
            bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.profilePicture.left", cropPosition.left );
            bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.profilePicture.top", cropPosition.top );
        }
        else
        {
            bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.profilePicture.left", 0 );
            bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.profilePicture.top", 0 );
        }

        if ( $profilePicture.length === 0 )
        {
            bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.profilePicture", null );
        }

    }

    // This is the startpoint
    //
    function _init()
    {
        // Reset any state
        //
        addedLanguages      = [];
        removedLanguages    = [];
        $languageList.empty();

        $profilePictureContainer.empty();

        $attachmentsContainer.reflowrower( "empty" );

        // Build up the gmaps for the current address
        bidx.common.loadGoogleMap( { callback:   _currentAddress } );

        // Inject the save and button into the controls
        //
        var $btnSave    = $( "<a />", { "class": "btn btn-primary btn-sm disabled", href: "#save"    })
        ,   $btnCancel  = $( "<a />", { "class": "btn btn-primary btn-sm disabled", href: "#cancel"  })
        ;

        $btnSave.i18nText( "btnSaveProfile" ).prepend( $( "<div />", { "class": "fa fa-check fa-above fa-big" } ) );
        $btnCancel.i18nText( "btnCancel" ).prepend( $( "<div />", { "class": "fa fa-times fa-above fa-big" } ) );

        bidx.controller.addControlButtons( [ $btnSave, $btnCancel ] );

        // Wire the submit button which can be anywhere in the DOM
        //
        $btnSave.click( function( e )
        {
            e.preventDefault();

            $editForm.submit();
        } );

        var $validator = $editForm.validate(
        {
            ignore: ".chosen-search input, .search-field input"
        ,   rules:
            {
                "personalDetails.firstName":
                {
                    required:                   true
                }
            ,   "personalDetails.lastName":
                {
                    required:                   true
                }
            ,   "personalDetails.dateOfBirth":
                {
                    // TODO: datepicker validation
                }
            ,   "personalDetails.emailAddress":
                {
                    email:                      true
                }
            ,   "personalDetails.skype":
                {
                    skypeUsername:              true
                }
            // ,   "personalDetails.linkedIn":
            //     {
            //         linkedIn:                   true
            //     }
            ,   "personalDetails.facebook":
                {
                    facebookUsername:           true
                }
            ,   "personalDetails.twitter":
                {
                    twitterUsername:            true
                }
            }
        ,   messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
        ,   submitHandler:  function()
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
                            bidx.utils.error( "problem parsing error response from memberProfile save" );
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
                    var bidxMeta    = bidx.utils.getValue( response, "bidxMemberProfile.bidxMeta" ) || bidx.utils.getValue( response, "bidxMemberProfile" )
                    ,   canEdit     = bidx.utils.getValue( bidxMeta, "bidxCanEdit" )
                    ;

                    if ( !canEdit )
                    {
                        _showError( bidx.i18n.i( "noProfileEditPermission" ));

                        $btnCancel.removeClass( "disabled" );
                    }
                    else
                    {
                        member = response;

                        // Set the global memberProfileId for convenience reasons
                        //
                        memberProfileId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );

                        bidx.utils.log( "bidx::member", member );

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

         // Current address control
        //
        function _currentAddress()
        {
            // Build up the gmaps for the current address
            //
            currentAddressMapOptions =
                {
                    center:             new google.maps.LatLng( 0, 0 )
                ,   zoom:               1
                ,   panControl:         false
                ,   scrollwheel:        false
                ,   zoomControl:        true
                ,   streetViewControl:  false
                ,   rotateControl:      false
                ,   overviewMapControl: false
                ,   mapTypeControl:     false
                ,   draggable:          false
                ,   mapTypeId:          google.maps.MapTypeId.ROADMAP
                }
            ;

            if ( $currentAddressMap.length )
            {
                currentAddressMap       = new google.maps.Map( $currentAddressMap[ 0 ], currentAddressMapOptions );
            }

            geocoder        = new google.maps.Geocoder();

            $currentAddressCountry.change(      function() { _updateCurrentAddressMap();    } );
            $currentAddressCityTown.change(     function() { _updateCurrentAddressMap();    } );
            $currentAddressStreet.change(       function() { _updateCurrentAddressMap();    } );
            $currentAddressStreetNumber.change( function() { _updateCurrentAddressMap();    } );
            $currentAddressPostalCode.change(   function() { _updateCurrentAddressMap();    } );
        }
    }

    // Try to save the member to the API
    //
    function _save( params )
    {
        if ( !member )
        {
            return;
        }

        // Force current (0) set to be the current one
        //
        var currentLanguage
        ,   contactDetail = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.contactDetail", true )
        ;

        if ( contactDetail && contactDetail.length )
        {
            member.bidxMemberProfile.personalDetails.contactDetail[0].currentContactDetails = true;
        }

        // Inform the API we are updating the member profile
        //
        var bidxMeta            =   member.bidxMemberProfile.bidxMeta ? member.bidxMemberProfile.bidxMeta : member.bidxMemberProfile;
        bidxMeta.bidxEntityType =   "bidxMemberProfile";

        // Update the member object
        _getFormValues();

        bidx.common.notifySave();

        bidx.api.call(
            "member.save"
        ,   {
                memberId:       memberId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           member.bidxMemberProfile
            ,   success:        function( response )
                {
                    bidx.utils.log( "member.save::success::response", response );

                    bidx.common.closeNotifications();
                    bidx.common.notifyRedirect();

                    bidx.common.removeAppWithPendingChanges( appName );

                    // var url = document.location.href.split( "#" ).shift();
                    currentLanguage     = ( iclVars.current_language ) ? '/' + iclVars.current_language : '';

                    document.location.href = currentLanguage + "/member/?rs=true";
                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );
                    bidx.common.closeNotifications();
                }
            }
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

        // set redirect for this app's Save & Cancel button and the default redirect behaviour
        //
        redirect =
        {
            cancel:     ( options.params && options.params.cancel ) ? options.params.cancel : "member/" + options.id
        ,   success:    ( options.params && options.params.success ) ? options.params.success : "member/" + options.id
        };

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
                    memberId        = options.id;
                    memberProfileId = null;
                    state           = "edit";

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
                    var hash = "editMember/" + options.id;

                    if ( options.section )
                    {
                         hash += "/" + options.section;
                    }

                    return hash;
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
    ,   _updateCurrentAddressMap:   _updateCurrentAddressMap
    ,   currentAddressMap:          currentAddressMap
        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.member = app;
} ( jQuery ));
