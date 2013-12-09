/* global bidx */
;( function( $ )
{
    "use strict";

    var $element                    = $( "#editMember" )
    ,   $views                      = $element.find( ".view" )
    ,   $editForm                   = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $languageList               = $editForm.find( ".languageList" )
    ,   $btnAddLanguage             = $editForm.find( ".js-btn-add-language" )
    ,   $inputAddLanguage           = $editForm.find( "input[name='addLanguage']" )

    ,   $personalDetailsNationality         = $editForm.find( "[name='personalDetails.nationality']" )
    ,   $personalDetailsHighestEducation    = $editForm.find( "[name='personalDetails.highestEducation']" )

        // Profile picture
        //
    ,   $profilePictureControl              = $editForm.find( ".profilePictureControl" )
    ,   $profilePictureContainer            = $profilePictureControl.find( ".profilePictureContainer" )
    ,   $btnChangeProfilePicture            = $profilePictureControl.find( "a[href$='#changeProfilePicture']" )
    ,   $changeProfilePictureModal          = $profilePictureControl.find( ".changeProfilePictureModal" )

        // Attachnents
        //
    ,   $attachmentsControl                 = $editForm.find( ".attachmentsControl" )
    ,   $attachmentsContainer               = $attachmentsControl.find( ".attachmentsContainer" )
    ,   $btnAddAttachments                  = $attachmentsControl.find( "a[href$='#addAttachments']")
    ,   $addAttachmentsModal                = $attachmentsControl.find( ".addAttachmentsModal" )

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

    ,   member
    ,   memberId
    ,   memberProfileId
    ,   state
    ,   currentView

    ,   redirect                    = {}
    ,   snippets                    = {}

    ,   appName                     = "member"

        // Languages
        //
    ,   languages

        // Object for maintaining a list of currently selected languages, for optimizations only
        //
    ,   addedLanguages              = {}
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

    // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup()
    {
        _snippets();
        _languages();
        _attachments();
        _currentAddress();

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
                        $profilePictureContainer.html( $( "<img />", { "src": file.document  } ));

                        $changeProfilePictureModal.modal( "hide" );
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
            // Retrieve the list of languages from the data api
            //
            bidx.data.getContext( "language", function( err, data )
            {
                languages = data;

                // Initialize the autocompletes
                //
                $inputAddLanguage.typeahead(
                {
                    name:       "languages"
                ,   local:      _.map( languages, function( language ) { return language.label; } )
                } ).removeClass( "disabled" ).removeAttr( "disabled" );
            } );

            // Figure out the key of the to be added language
            //
            $btnAddLanguage.click( function( e )
            {
                // Determine if the value is in the list of languages, and if, add it to the list of added languages
                //
                var language        = $inputAddLanguage.val()
                ,   value
                ;

                value = _getLanguageValueByLabel( language );

                if ( value && !addedLanguages[ language ] )
                {
                    $inputAddLanguage.val( "" );

                    addedLanguages[ language ] = true;

                    _addLanguageDetailToList( { language: value, motherLanguage: false } );
                }
            } );

            $btnAddLanguage
                .removeClass( "disabled" )
                .removeAttr( "disabled" );

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
                itemsPerRow:        3
            ,   itemClass:          "attachmentItem"
            } );
        }

        // Current address control
        //
        function _currentAddress()
        {
            // Build up the gmaps for the current address
            //
            var currentAddressMapOptions =
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

    // Use the retrieved member object to populate the form and other screen elements
    //
    function _populateScreen()
    {
        $.each( fields.personalDetails, function( i, f )
        {
            var $input  = $editForm.find( "[name='personalDetails." + f + "']" )
            ,   value   = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails." + f )
            ;

            // Sometimes the data coming back from the API is in lowercase, and since it's a lookup concept we need to have it uppercase
            //
            if ( value && f === "nationality" )
            {
                value = value.toUpperCase();
            }

            $input.each( function()
            {
                bidx.utils.setElementValue( $( this ), value );
            } );
        } );

        // Profile picture is 'special'
        //
        var profilePicture = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.profilePicture" )
        ;

        if ( profilePicture )
        {
            $profilePictureContainer.data( "bidxData", profilePicture );
            $profilePictureContainer.append( $( "<img />", { "src": profilePicture } ));
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
            bidx.util.warn( "memberprofile::_addAttachment: attachment is null!" );
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
        var profilePicture = $profilePictureContainer.data( "bidxData" );
        bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.profilePicture", profilePicture );
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

        // Inject the save and button into the controls
        //
        var $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    })
        ,   $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "#cancel"  })
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

        var $validator = $editForm.validate(
        {
            ignore: ""
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
            ,   "personalDetails.linkedIn":
                {
                    linkedIn:                   true
                }
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

                        _showView( "edit" );

                        // This is a hack, for whatever unclear reason the first time the map is shown it doesn't
                        // center correctly. Probably because of some reflow / layout issue.
                        // @TODO: proper fix
                        //
                        setTimeout( function()
                        {
                            _updateCurrentAddressMap();
                        }, 500 );
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
        var contactDetail = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.contactDetail", true );

        if ( contactDetail && contactDetail.length )
        {
            member.bidxMemberProfile.personalDetails.contactDetail[0].currentContactDetails = true;
        }

        // Inform the API we are updating the member profile
        //
        var bidxMeta = member.bidxMemberProfile.bidxMeta ? member.bidxMemberProfile.bidxMeta : member.bidxMemberProfile;
        bidxMeta.bidxEntityType = "bidxMemberProfile";

        // Update the member object
        //
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

                    var url = document.location.href.split( "#" ).shift();

                    document.location.href = url;
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

                            bidx.i18n.i( "someLBale")
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
    ,    _updateCurrentAddressMap:   _updateCurrentAddressMap
    ,   currentAddressMap:          currentAddressMap
        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.member = app;
} ( jQuery ));
