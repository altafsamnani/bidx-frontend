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

    ,   $attachments                = $editForm.find( ".attachments" )
    ,   $attachmentList             = $attachments.find( ".attachmentList" )

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
    ,   bidx            = window.bidx
    ,   snippets        = {}

    ,   languages
    ;

    // Form fields
    //
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
    };

    // Grab the snippets from the DOM
    //
    snippets.$language      = $snippets.children( ".languageItem"   ).remove();
    snippets.$attachment    = $snippets.children( ".attachmentItem" ).remove();


    // Populate the peronsalDetails.nationality select box using the data items
    //
    bidx.data.getItem( "country", function( err, countries )
    {
        $personalDetailsNationality.empty();
        $personalDetailsNationality.append( $( "<option value='' />" ).text( "Select your nationality" ));

        bidx.utils.populateDropdown( $personalDetailsNationality, countries );
    } );


    // Populate the personalDetails.address[0].country select box using the data items
    //
    bidx.data.getItem( "country", function( err, countries )
    {
        $currentAddressCountry.empty();
        $currentAddressCountry.append( $( "<option value='' />" ).text( "Select your country" ));

        bidx.utils.populateDropdown( $currentAddressCountry, countries );
    } );

    // Populate the personalDetails.address[0].country select box using the data items
    //
    bidx.data.getItem( "education", function( err, educations )
    {
        $personalDetailsHighestEducation.empty();
        $personalDetailsHighestEducation.append( $( "<option value='' />" ).text( "Select your highest education" ));

        bidx.utils.populateDropdown( $personalDetailsHighestEducation, educations );
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
                    return _.map( languages, function( language ) { return language.value; } );
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
        ,   key
        ;

        key = _getLanguageKeyByValue( language );

        if ( key )
        {
            $inputAddLanguage.val( "" );

            addedLanguages[ language ] = true;

            _addLanguageDetailToList( { language: key, motherLanguage: false } );
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
        ,   languageValue   = _getLanguageValueByKey( languageDetail.language )
        ;

        delete addedLanguages[ languageValue ];

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
    var _getLanguageValueByKey = function( key )
    {
        var value;

        $.each( languages, function( i, item )
        {
            if ( item.key === key )
            {
                value = item.value;
            }
        } );

        return value;
    };

    // Convenience function for translating a language description to it's key
    //
    var _getLanguageKeyByValue = function( value )
    {
        var key;

        $.each( languages, function( i, item )
        {
            if ( item.value === value )
            {
                key = item.key;
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
            var nest    = this
            ,   items   = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails." + nest, true )
            ;

            if ( items )
            {
                $.each( items, function( i, item )
                {
                    $.each( fields[ nest ], function( j, f )
                    {
                        var $input  = $editForm.find( "[name='personalDetails." + nest + "[" + i + "]." + f + "']" )
                        ,   value   = bidx.utils.getValue( item, f )
                        ;

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
                bidx.utils.log( "attachment", attachment );
                _addAttachmentToScreen( attachment );
            } );
        }

        _updateCurrentAddressMap();
    };

    // Add the attachment to the screen, by cloning the snippet and populating it
    //
    var _addAttachmentToScreen = function( attachment )
    {
        if ( attachment === null )
        {
            bidx.util.warn( "memberprofile::_addAttachmentToScreen: attachment is null!" );
            return;
        }

        var $attachment         = snippets.$attachment.clone()

        ,   uploadedDateTime    = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
        ,   imageSrc
        ;

        $attachment.data( "attachment", attachment );

        $attachment.find( ".documentName"       ).text( attachment.documentName );
        $attachment.find( ".uploadedDateTime"   ).text( uploadedDateTime );

        imageSrc =  attachment.mimeType.match( /^image/ )
            ? attachment.document
            : "/wp-content/plugins/bidx-plugin/static/img/iconViewDocument.png";

        $attachment.find( ".documentImage" ).attr( "src", imageSrc );

        $attachment.find( ".documentLink" ).attr( "href", attachment.document );

        $attachmentList.append( $attachment );
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
            languageDescr = _getLanguageValueByKey( languageDetail.language );
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

        // Collect the nested objects
        // !! only written to handle nested objects that are arrays !!
        //
        $.each( [ "address", "contactDetail" ], function()
        {
            var nest        = this
            ,   i           = 0
            ,   memberPath  = "bidxMemberProfile.personalDetails." + nest
            ,   item        = bidx.utils.getValue( member, memberPath, true )
            ;

            // Property not existing? Add it as an empty array holding an empty object
            //
            if ( !item )
            {
                item = [ {} ];
                bidx.utils.setValue( member, memberPath, item );
            }

            // TODO: make i itterate

            $.each( fields[ nest ], function( j, f )
            {
                var inputPath   = "personalDetails." + nest + "[" + i + "]." + f
                ,   $input      = $editForm.find( "[name='" + inputPath + "']" )
                ,   value       = bidx.utils.getElementValue( $input )
                ;

                bidx.utils.setValue( item[ i ], f, value );
            } );
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

        $attachmentList.empty();

        // Inject the save and button into the controls
        //
        var $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    })
        ,   $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "#cancel"  })
        ;

        $btnSave.text( "Save profile" );
        $btnCancel.text( "Cancel" );

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
        $editForm.form(
        {
            errorClass:     'error'
        ,   enablePlugins:  [ 'date', 'fileUpload' ]
        } );

        $editForm.submit( function( e )
        {
            e.preventDefault();

            var valid = $editForm.form( "validateForm" );

            if ( !valid || $btnSave.hasClass( "disabled" ) )
            {
                return;
            }

            $btnSave.addClass( "disabled" );
            $btnCancel.addClass( "disabled" );

            _save(
            {
                error: function()
                {
                    alert( "Something went wrong during save" );

                    $btnSave.removeClass( "disabled" );
                    $btnCancel.removeClass( "disabled" );
                }
            } );
        } );

        // Attachments
        //
        $attachments.delegate( "a[href$=#deleteAttachment]", "click", function( e )
        {
            e.preventDefault();

            var $btn            = $( this )
            ,   $attachment     = $btn.closest( ".attachmentItem" )
            ,   attachment      = $attachment.data( "attachment" )
            ,   documentId      = attachment.bidxEntityId
            ;

            if ( $btn.hasClass( "disabled" ))
            {
                return;
            }

            $btn.addClass( "disabled" );

            bidx.api.call(
                "entityDocument.destroy"
            ,   {
                    entityId:           memberProfileId
                ,   documentId:         documentId
                ,   groupDomain:        bidx.common.groupDomain
                ,   success:            function( response )
                    {
                        bidx.utils.log( "bidx::entityDocument::destroy::success", response );

                        $attachment.remove();
                    }
                ,   error:            function( jqXhr, textStatus )
                    {
                        bidx.utils.log( "bidx::entityDocument::destroy::error", jqXhr, textStatus );

                        alert( "Problems deleting attachment" );

                        $btn.removeClass( ".disabled" );
                    }
                }
            );
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
                    member = response;

                    // Set the global memberProfileId for convenience reasons
                    //
                    memberProfileId = bidx.utils.getValue( member, "bidxMemberProfile.bidxEntityId" );

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

        // Remove all attachments / binary entities

        // Remove profile picture
        //
        if ( bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.profilePicture" ) )
        {
            delete member.bidxMemberProfile.personalDetails.profilePicture;
        }

        // Remove attachment
        //
        if ( bidx.utils.getValue( member, "bidxMemberProfile.attachment" ) )
        {
            delete member.bidxMemberProfile.attachment;
        }

        // Remove attachment
        //
        if ( bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.attachment" ) )
        {
            delete member.bidxMemberProfile.personalDetails.attachment;
        }



        // Force current (0) set to be the current one
        //
        var contactDetail = bidx.utils.getValue( member, "bidxMemberProfile.personalDetails.contactDetail", true );

        if ( contactDetail && contactDetail.length )
        {
            member.bidxMemberProfile.personalDetails.contactDetail = [
            {
                "currentContactDetails": true
            }];
        }

        // Inform the API we are updating the member profile
        //
        member.bidxEntityType = "bidxMemberProfile";

        // Update the member object
        //
        _getFormValues();

        bidx.api.call(
            "member.save"
        ,   {
                memberId:       memberId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           member
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
    var state;


    var navigate = function( requestedState, section, id, cb )
    {
        switch ( requestedState )
        {
            case "edit":
                bidx.utils.log( "EditMember::AppRouter::edit", id, section );

                var newMemberId
                ,   splatItems
                ,   updateHash      = false
                ,   isId            = ( id && id.match( /^\d+$/ ) )
                ;

                if ( id && !isId )
                {
                    section = id;
                    id      = memberId;

                    updateHash = true;
                }

                // No memberId set yet and not one explicitly provided? Use the one from the session
                //
                if ( !memberId && !isId )
                {
                    id = bidx.utils.getValue( bidxConfig, "session.id" );

                    updateHash = true;
                }

                if ( !( state === "edit" && id === memberId ) )
                {
                    memberId        = id;
                    memberProfileId = null;
                    state           = "edit";

                    $element.show();
                    _showView( "load" );

                    _init();
                }

                if ( updateHash )
                {
                    var hash = "editMember/" + id;

                    if ( section )
                    {
                         hash += "/" + section;
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
            _addAttachmentToScreen( result.data );
        }
    };

    var reset = function()
    {
        state = null;
    };

    // Expose
    //
    var memberprofile =
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

    window.bidx.memberprofile = memberprofile;
} ( jQuery ));
