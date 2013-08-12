( function( $ )
{
    var $element                    = $( "#editMember" )
    ,   $views                      = $element.find( ".view" )
    ,   $editForm                   = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $languageList               = $editForm.find( ".languageList" )
    ,   $btnAddLanguage             = $editForm.find( ".btnAddLanguage" )
    ,   $inputAddLanguage           = $editForm.find( "input[name='addLanguage']" )

    ,   $personalDetailsNationality         = $editForm.find( "[name='personalDetails.nationality']" )
    ,   $personalDetailsHighestEducation    = $editForm.find( "[name='personalDetails.highestEducation']" )

    ,   $profilePictureContainer    = $editForm.find( ".profilePictureContainer" )

    ,   $attachmentsContainer       = $editForm.find( ".attachmentsContainer" )

    ,   $currentAddressMap          = $editForm.find( ".currentAddressMap" )
    ,   $currentAddressCountry      = $editForm.find( "[name='personalDetails.address[0].country']"         )
    ,   $currentAddressCityTown     = $editForm.find( "[name='personalDetails.address[0].cityTown']"        )
    ,   $currentAddressPostalCode   = $editForm.find( "[name='personalDetails.address[0].postalCode']"      )
    ,   $currentAddressStreet       = $editForm.find( "[name='personalDetails.address[0].street']"          )
    ,   $currentAddressStreetNumber = $editForm.find( "[name='personalDetails.address[0].streetNumber']"    )
    ,   $currentAddressCoordinates  = $editForm.find( "[name='personalDetails.address[0].coordinates']"     )

    ,   member
    ,   memberId
    ,   memberProfileId
    ,   state
    ,   bidx                        = window.bidx
    ,   snippets                    = {}

    ,   appName                     = "member"

    ,   languages
    ;

    // Form fields
    //
    var arrayFields = [ "address", "contactDetail", "attachment" ];

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
        ,   'language'
        ,   'motherLanguage'
        ,   'workingLanguage'
        ,   'ratingSpoken'
        ,   'ratingWritten'

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

    ,   attachment:
        [
            "purpose"
        ,   "documentType"
        ]
    };

    // Grab the snippets from the DOM
    //
    snippets.$language      = $snippets.children( ".languageItem"   ).remove();
    snippets.$attachment    = $snippets.children( ".attachmentItem" ).remove();


    // Populate the peronsalDetails.nationality select box using the data items
    //
    bidx.data.getItem( "country", function( err, countries )
    {
        var $noValue            = $( "<option value='' />" );

        $personalDetailsNationality.empty();

        $noValue.i18nText( "selectNationality", appName );
        $personalDetailsNationality.append( $noValue );

        bidx.utils.populateDropdown( $personalDetailsNationality, countries );
    } );


    // Populate the personalDetails.address[0].country select box using the data items
    //
    bidx.data.getItem( "country", function( err, countries )
    {
        var $noValue            = $( "<option value='' />" );

        $currentAddressCountry.empty();

        $noValue.i18nText( "selectCountry", appName );
        $currentAddressCountry.append( $noValue );

        bidx.utils.populateDropdown( $currentAddressCountry, countries );
    } );

    // Populate the personalDetails.address[0].country select box using the data items
    //
    bidx.data.getItem( "education", function( err, educations )
    {
        var $noValue            = $( "<option value='' />" );

        $personalDetailsHighestEducation.empty();

        $noValue.i18nText( "selectEducation", appName );
        $personalDetailsHighestEducation.append( $noValue );

        bidx.utils.populateDropdown( $personalDetailsHighestEducation, educations );
    } );

    bidx.data.getItem( "documentType", function( err, documentTypes )
    {
        var $documentType = snippets.$attachment.find( "[name='documentType']" )
        ,   $noValue        = $( "<option value='' />" )
        ;

        $noValue.i18nText( "selectDocumentType" );

        $documentType.append( $noValue );

        bidx.utils.populateDropdown( $documentType, documentTypes );
    } );


    // Object for maintaining a list of currently selected languages, for optimizations only
    //
    var addedLanguages = {};

    // Retrieve the list of languages from the data api
    //
    bidx.data.getItem( "language", function( err, data )
    {
        languages = data;

        // Initialize the autocompletes
        //
        $inputAddLanguage.typeahead(
            {
                source:         function( query )
                {
                    return _.map( languages, function( language ) { return language.label; } );
                }
            ,   matcher:        function( item )
                {
                    if ( addedLanguages[ item ] )
                    {
                        return false;
                    }

                    return true;
                }
            }
        ).removeClass( "disabled" ).removeAttr( "disabled" );
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

        if ( value )
        {
            $inputAddLanguage.val( "" );

            addedLanguages[ language ] = true;

            _addLanguageDetailToList( { language: value, motherLanguage: false } );
        }

    } );

    $btnAddLanguage.removeClass( "disabled" ).removeAttr( "disabled" );

    // Remove the language from the list
    //
    $languageList.delegate( ".btnRemoveLanguage", "click", function( e )
    {
        e.preventDefault();

        var $languageItem   = $( this ).closest( ".languageItem" )
        ,   languageDetail  = $languageItem.data( "languageDetail" )
        ,   languageLabel   = _getLanguageLabelByValue( languageDetail.language )
        ;

        delete addedLanguages[ languageLabel ];

        $languageItem.remove();
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
            ,   languageDetail  = $item.data( "languageDetail" )
            ;

            languageDetail.motherLanguage = false;

            $item.data( "languageDetail", languageDetail );

            $item.find( ".btnSetMotherLanguage"     ).show();
            $item.find( ".isCurrentMotherLanguage"  ).hide();
        } );

        // And set the motherLanguage on this item to true
        //
        var languageDetail = $languageItem.data( "languageDetail" );

        languageDetail.motherLanguage = true;
        $languageItem.data( "languageDetail", languageDetail );

        $languageItem.find( ".isCurrentMotherLanguage"  ).show();
        $languageItem.find( ".btnSetMotherLanguage"     ).hide();
    } );

    // Instantiate reflowrower on the attachments container
    //
    $attachmentsContainer.reflowrower(
    {
        itemsPerRow:        3
    ,   removeItemOverride: function( $item, cb )
        {
            var attachment      = $item.data( "bidxData" )
            ,   documentId      = attachment.bidxEntityId
            ;

            bidx.api.call(
                "entityDocument.destroy"
            ,   {
                    entityId:           memberProfileId
                ,   documentId:         documentId
                ,   groupDomain:        bidx.common.groupDomain
                ,   success:            function( response )
                    {
                        bidx.utils.log( "bidx::entityDocument::destroy::success", response );

                        bidx.i18n.getItem( "attachmentDeleted", function( err, label )
                        {
                            bidx.common.notifySuccess( label );
                        });


                        cb();

                        $attachmentsContainer.reflowrower( "removeItem", $item, true );
                    }
                ,   error:            function( jqXhr, textStatus )
                    {
                        bidx.utils.log( "bidx::entityDocument::destroy::error", jqXhr, textStatus );

                        bidx.i18n.getItem( "errAttachmentDelete", function( err, label )
                        {
                            alert( label );
                        } );

                        cb();
                    }
                }
            );
        }
    } );


    // Disable disabled links
    //
    $element.delegate( "a.disabled", "click", function( e )
    {
        e.preventDefault();
    } );

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
    ,   currentAddressMap       = new google.maps.Map( $currentAddressMap[ 0 ], currentAddressMapOptions )
    ;

    var geocoder        = new google.maps.Geocoder()
    ,   geocodeTimer    = null
    ;

    $currentAddressCountry.change(      function() { _updateCurrentAddressMap();    } );
    $currentAddressCityTown.change(     function() { _updateCurrentAddressMap();    } );
    $currentAddressStreet.change(       function() { _updateCurrentAddressMap();    } );
    $currentAddressStreetNumber.change( function() { _updateCurrentAddressMap();    } );
    $currentAddressPostalCode.change(   function() { _updateCurrentAddressMap();    } );

    // Try to gecode the address (array)
    // On failure, pop one item from the address array and retry untill there is no
    // address left or we found a location
    //
    var _geocode = function( region, address, cb )
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
    };

    // Update the address onto the map via geocodeing
    //
    var _updateCurrentAddressMap = function()
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
    };

    // Convenience function for translating a language key to it's description
    //
    var _getLanguageLabelByValue = function( value )
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
    };

    // Convenience function for translating a language description to it's key
    //
    var _getLanguageValueByLabel = function( label )
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
    };

    // Use the retrieved member object to populate the form and other screen elements
    //
    var _populateScreen = function()
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
        var profilePictureUrl       = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.profilePicture.document" )
        ;

        if ( profilePictureUrl )
        {
            $profilePictureContainer.append( $( "<img />", { "src": profilePictureUrl } ));
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
                _addAttachmentToScreen( idx, attachment );
            } );
        }

        _updateCurrentAddressMap();
    };

    // Add the attachment to the screen, by cloning the snippet and populating it
    //
    var _addAttachmentToScreen = function( index, attachment )
    {
        if ( attachment === null )
        {
            bidx.util.warn( "memberprofile::_addAttachmentToScreen: attachment is null!" );
            return;
        }

        if ( !index )
        {
            index = $attachmentsContainer.find( ".attachmentItem" ).length;
        }

        var $attachment         = snippets.$attachment.clone()
        ,   uploadedDateTime    = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
        ,   inputNamePrefix     = "personalDetails.attachment[" + index + "]"
        ,   imageSrc
        ;

        // Store the data so we can later use it to merge the updated data in
        //
        $attachment.data( "bidxData", attachment );

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $attachment.find( "input, select, textarea" ).each( function( )
        {
            var $input = $( this );

            $input.prop( "name", inputNamePrefix + "." + $input.prop( "name" ) );
        } );

        $attachment.find( ".documentName"       ).text( attachment.documentName );
        $attachment.find( ".uploadedDateTime"   ).text( uploadedDateTime );

        var $purpose       = $attachment.find( "[name$='.purpose']" )
        ,   $documentType  = $attachment.find( "[name$='.documentType']" )
        ;

        bidx.utils.setElementValue( $purpose,       attachment.purpose );
        bidx.utils.setElementValue( $documentType,  attachment.documentType );

        imageSrc =  attachment.mimeType.match( /^image/ )
            ? attachment.document
            : "/wp-content/plugins/bidx-plugin/static/img/iconViewDocument.png";

        $attachment.find( ".documentImage"  ).attr( "src", imageSrc );
        $attachment.find( ".documentLink"   ).attr( "href", attachment.document );

        $attachmentsContainer.reflowrower( "addItem", $attachment );
    };

    // Add an item to the language list and render the HTML for it
    //
    var _addLanguageDetailToList = function( languageDetail )
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

        $language.data( "languageDetail", languageDetail );

        $languageList.append( $language );
    };

    // Convert the form values back into the member object
    //
    var _getFormValues = function()
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
        $.each( [ "address", "contactDetail", "attachment" ], function()
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
            ,   data            = $languageItem.data( "languageDetail" )
            ;

            languageDetail.push( data );
        } );

        bidx.utils.setValue( member, "bidxMemberProfile.personalDetails.languageDetail", languageDetail );
    };

    // This is the startpoint
    //
    var _init = function()
    {
        // Reset any state
        //
        addedLanguages = [];
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

        // Setup form
        //
        var $validator = $editForm.validate(
        {
            rules:
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
                    dpDate:                     true
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
                    linkedInUsername:           true
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
                "personalDetails.firstName":
                {
                    required:                   bidx.i18n.i( "frmFieldRequired" )
                }
            ,   "personalDetails.lastName":
                {
                    required:                   bidx.i18n.i( "frmFieldRequired" )
                }
            ,   "personalDetails.dateOfBirth":
                {
                    dpDate:                     bidx.i18n.i( "frmInvalidDate" )
                }
            ,   "personalDetails.emailAddress":
                {
                    email:                      bidx.i18n.i( "frmInvalidEmail" )
                }
            ,   "personalDetails.skype":
                {
                    skypeUsername:              bidx.i18n.i( "frmInvalidSkypeUsername")
                }
            ,   "personalDetails.linkedIn":
                {
                    linkedInUsername:           bidx.i18n.i( "frmInvalidLinkedInUsername" )
                }
            ,   "personalDetails.facebook":
                {
                    facebookUsername:           bidx.i18n.i( "frmInvalidFacebookUsername" )
                }
            ,   "personalDetails.twitter":
                {
                    twitterUsername:            bidx.i18n.i( "frmInvalidTwitterUsername" )
                }
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


        $editForm.find( "[data-type=fileUpload]" ).fileUpload( { "parentForm": $editForm[0] });

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
                        memberProfileId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );

                        bidx.utils.log( "bidx::member", member );

                        _populateScreen();

                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );

                        _showView( "edit" );

                        // This is a hack, for whatever unclear reason the first time the map is shown it doesn't
                        // center correctly. Probably because of some reflow / layout issue.
                        // TODO: proper fix
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
    };

    // Try to save the member to the API
    //
    var _save = function( params )
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

        bidx.api.call(
            "member.save"
        ,   {
                memberId:       memberId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           member.bidxMemberProfile
            ,   success:        function( response )
                {
                    bidx.utils.log( "member.save::success::response", response );

                    bidx.common.notifyRedirect();

                    var url = document.location.href.split( "#" ).shift();

                    document.location.href = url;
                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );
                }
            }
        );
    };

    // Private functions
    //
    var _showError = function( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    };

    var _showView = function( v )
    {
        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    };

    // ROUTER
    //
    var navigate = function( options )
    {
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
    };


    var attachmentUploadDone = function( err, result )
    {
        bidx.utils.log( "attachmentUploadDone", err, result );

        if ( err )
        {
            alert( "Problem uploading attachment" );
        }
        else
        {
            bidx.i18n.getItem( "attachmentUploadDone", function( err, label )
            {
                bidx.common.notifySuccess( label );
            } );

            _addAttachmentToScreen( null, result.data );
        }
    };

    var reset = function()
    {
        state = null;
    };

    // Expose
    //
    var app =
    {
        attachmentUploadDone:       attachmentUploadDone
    ,   navigate:                   navigate
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
