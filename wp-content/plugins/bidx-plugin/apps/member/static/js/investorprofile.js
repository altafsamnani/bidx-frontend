/* global bidx */
;( function( $ )
{
    var $element                        = $( "#editInvestor" )
    ,   $views                          = $element.find( ".view" )
    ,   $editForm                       = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                       = $element.find( ".snippets" )

    ,   $hideOnCreate                   = $element.find( ".hideOnCreate" )

    ,   $investorType                   = $editForm.find( "[name='investorType']" )

    ,   $focusIndustry                  = $element.find( "[name='focusIndustry']" )
    ,   $focusLanguage                  = $element.find( "[name='focusLanguage']" )
    ,   $focusSocialImpact              = $element.find( "[name='focusSocialImpact']" )
    ,   $focusEnvImpact                 = $element.find( "[name='focusEnvImpact']" )
    ,   $focusConsumerType              = $element.find( "[name='focusConsumerType']" )
    ,   $investmentType                 = $element.find( "[name='investmentType']" )
    ,   $focusCountry                   = $element.find( "[name='focusCountry']" )

    ,   $btnAddPreviousInvestment       = $editForm.find( "[href$='#addPreviousInvestment']" )
    ,   $previousInvestmentContainer    = $editForm.find( ".previousInvestmentContainer" )

    ,   $btnAddReference                = $editForm.find( "[href$='#addReference']" )
    ,   $referencesContainer            = $editForm.find( ".referencesContainer" )
    ,   $btnSave
    ,   $btnCancel

        // Attachnents
        //
    ,   $attachmentsControl                 = $editForm.find( ".attachmentsControl" )
    ,   $attachmentsContainer               = $attachmentsControl.find( ".attachmentsContainer" )
    ,   $btnAddAttachments                  = $attachmentsControl.find( "a[href$='#addAttachments']")
    ,   $addAttachmentsModal                = $attachmentsControl.find( ".addAttachmentsModal" )

    ,   $toggles                        = $element.find( ".toggle" ).hide()
    ,   $toggleInvestsForInst           = $element.find( "[name='investsForInst']"      )
    ,   $toggleFocusLocationType        = $element.find( "[name='focusLocationType']"      )

    ,   $institutionAddressMap          = $editForm.find( ".institutionAddressMap" )
    ,   $institutionAddressCountry      = $editForm.find( "[name='institutionAddress.country']"         )
    ,   $institutionAddressCityTown     = $editForm.find( "[name='institutionAddress.cityTown']"        )
    ,   $institutionAddressPostalCode   = $editForm.find( "[name='institutionAddress.postalCode']"      )
    ,   $institutionAddressStreet       = $editForm.find( "[name='institutionAddress.street']"          )
    ,   $institutionAddressStreetNumber = $editForm.find( "[name='institutionAddress.streetNumber']"    )
    ,   $institutionAddressCoordinates  = $editForm.find( "[name='institutionAddress.coordinates']"     )

    ,   member
    ,   memberId
    ,   investorProfileId
    ,   state
    ,   currentView
    ,   redirect                        = {}
    ,   snippets                        = {}

    ,   appName                     = "member"
    ;

    // Form fields
    //
    var arrayFields = [ "focusCity", "previousInvestments", "references" ];

    var fields =
    {
        _root:
        [
            'summary'
        ,   'investorType'
        ,   'investsForInst'
        ,   'institutionName'
        ,   'institutionWebsite'
        ,   'minInvestment'
        ,   'maxInvestment'
        ,   'focusIndustry'
        ,   'focusSocialImpact'
        ,   'focusEnvImpact'
        ,   'focusConsumerType'
        ,   'focusStageBusiness'
        ,   'focusGender'
        ,   'focusCountry'
        ,   'focusLanguage'
        ,   'investmentType'
        ,   'additionalPreferences'
        ,   'numberInvestments'
        ,   'totalInvestment'
        ,   'typicalInvolvement'
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

    ,   institutionAddress:
        [
            'country'
        ,   'cityTown'
        ,   'postalCode'
        ,   'neighborhood'
        ,   'street'
        ,   'streetNumber'
        ]

    ,   previousInvestments:
        [
            'companyName'
        ,   'companyWebsite'
        ,   'investment'
        ,   'investmentType'
        ]

    ,   references:
        [
            'firstName'
        ,   'lastName'
        ,   'professionalTitle'
        ,   'linkedIn'
        ,   'emailAddress'
        ,   {
                'contactDetail[0]':         // yes.. bad! but only one for now, just getting it to work
                [
                    'landLine'
                ,   'mobile'
                ]
            }
        ]
    };

        // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup()
    {
        _snippets();
        _previousInvestment();
        _references();
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


        bidx.data.getContext( "industry", function( err, industries )
        {
            bidx.utils.populateDropdown( $focusIndustry, industries );

            $focusIndustry.chosen(
            {
                "search_contains":              true
            ,   "width":                        "100%"
            } );
        } );

        bidx.data.getContext( "language", function( err, industries )
        {
            bidx.utils.populateDropdown( $focusLanguage, industries );

            $focusLanguage.chosen(
            {
                "search_contains":              true
            ,   "width":                        "100%"
            } );
        } );

        bidx.data.getContext( "socialImpact", function( err, industries )
        {
            bidx.utils.populateDropdown( $focusSocialImpact, industries );

            $focusSocialImpact.chosen(
            {
                "search_contains":              true
            ,   "width":                        "100%"
            } );
        } );

        bidx.data.getContext( "envImpact", function( err, industries )
        {
            bidx.utils.populateDropdown( $focusEnvImpact, industries );

            $focusEnvImpact.chosen(
            {
                "search_contains":              true
            ,   "width":                        "100%"
            } );
        } );

        bidx.data.getContext( "consumerType", function( err, industries )
        {
            bidx.utils.populateDropdown( $focusConsumerType, industries );

            $focusConsumerType.chosen(
            {
                "search_contains":              true
            ,   "width":                        "100%"
            } );
        } );

        bidx.data.getContext( "investmentType", function( err, industries )
        {
            bidx.utils.populateDropdown( $investmentType, industries );

            $investmentType.chosen(
            {
                "search_contains":              true
            ,   "width":                        "100%"
            } );
        } );

        bidx.data.getContext( "country", function( err, industries )
        {
            bidx.utils.populateDropdown( $focusCountry, industries );

            $focusCountry.chosen(
            {
                "search_contains":              true
            ,   "width":                        "100%"
            } );
        } );





        // Populate the dropdowns with the values
        //
        bidx.data.getContext( "investmentType", function( err, investmentTypes )
        {
            var $investmentType     = snippets.$previousInvestment.find( "[name='investmentType']" )
            ,   $noValue            = $( "<option value='' />" )
            ;

            $noValue.i18nText( "selectInvestmentType", appName );
            $investmentType.append( $noValue );

            bidx.utils.populateDropdown( $investmentType, investmentTypes );
        } );

        // Populate the dropdowns with the values
        //
        bidx.data.getContext( "investorType", function( err, investorTypes )
        {
            var $noValue = $( "<option value='' />" );

            $noValue.i18nText( "selectInvestor", appName );
            $investorType.append( $noValue );

            bidx.utils.populateDropdown( $investorType, investorTypes );
        } );

        // Populate the dropdowns with the values
        //
        bidx.data.getContext( "country", function( err, countries )
        {
            var $noValue = $( "<option value='' />" );

            $noValue.i18nText( "selectCountry", appName );
            $institutionAddressCountry.append( $noValue );

            bidx.utils.populateDropdown( $institutionAddressCountry, countries );
        } );

        // Grab the snippets from the DOM
        //
        function _snippets()
        {
            snippets.$previousInvestment    = $snippets.children( ".previousInvestmentsItem" ).remove();
            snippets.$reference             = $snippets.children( ".referencesItem"          ).remove();
            snippets.$attachment            = $snippets.children( ".attachmentItem"          ).remove();
        }

        // Initialiazation of previous investment component
        //
        function _previousInvestment()
        {
            // Add an empty previous business block
            //
            $btnAddPreviousInvestment.click( function( e )
            {
                e.preventDefault();

                _addPreviousInvestment();
            } );

            // Instantiate reflowrower on the previousInvestment container
            //
            $previousInvestmentContainer.reflowrower( { itemsPerRow: 2 } );
        }

        // Initialize references
        //
        function _references()
        {
            // Add an empty previous business block
            //
            $btnAddReference.click( function( e )
            {
                e.preventDefault();

                _addReference();
            } );

            $referencesContainer.reflowrower( { itemsPerRow: 2 } );
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


    // Add the snippet for a previous investment
    //
    var _addPreviousInvestment = function( index, previousInvestment )
    {
        if ( !index )
        {
            index = $previousInvestmentContainer.find( ".previousInvestmentsItem" ).length;
        }

        var $previousInvestment = snippets.$previousInvestment.clone()
        ,   inputNamePrefix = "previousInvestments[" + index + "]"
        ;

        $previousInvestment.data( "bidxData", previousInvestment );

        // Are we adding an investment with data or just an empty item?
        //
        if ( previousInvestment )
        {
            $.each( fields.previousInvestments, function( j, f )
            {
                var $input  = $previousInvestment.find( "[name='" + f + "']" )
                ,   value   = bidx.utils.getValue( previousInvestment, f )
                ;

                $input.each( function()
                {
                    bidx.utils.setElementValue( $( this ), value  );
                } );
            } );
        }

        // Store the data in the DOM for later referal / merging
        //
        $previousInvestment.data( "bidxData", previousInvestment );

        // Add it to the DOM!
        //
        $previousInvestmentContainer.reflowrower( "addItem", $previousInvestment );

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $previousInvestment.find( "input, select, textarea" ).each( function( )
        {
            var $input          = $( this )
            ,   baseName        = $input.prop( "name" )
            ,   newName         = inputNamePrefix + "." + baseName
            ;

            $input.prop( "name", newName );

            // Notify the form validator of the new elements
            // Use 'orgName' since that is consistent over each itteration
            //
            switch ( baseName )
            {
                case "companyName":
                    $input.rules( "add",
                    {
                        required:               true
                    } );
                break;

                case "companyWebsite":
                    $input.rules( "add",
                    {
                        urlOptionalProtocol:    true
                    } );
                break;

                case "investment":
                    $input.rules( "add",
                    {
                        monetaryAmount:         true
                    } );
                break;

                default:
                    // NOOP
            }
        } );
    };

    // Add the snippet for a reference (and fill it with data)
    //
    var _addReference = function( index, reference )
    {
        if ( !index )
        {
            index = $referencesContainer.find( ".referencesItem" ).length;
        }

        var $reference      = snippets.$reference.clone()
        ,   inputNamePrefix = "references[" + index + "]"
        ;

        $reference.data( "bidxData", reference );

        // Was data provided? (if not, it's just adding an empty reference block)
        //
        if ( reference )
        {
            $.each( fields.references, function( j, f )
            {
                _setElementValue( reference, f, inputNamePrefix );
            } );
        }

        // Add the reference to the DOM, via the reflowrower
        //
        $referencesContainer.reflowrower( "addItem", $reference );

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $reference.find( "input, select, textarea" ).each( function( )
        {
            var $input          = $( this )
            ,   baseName        = $input.prop( "name" )
            ,   newName         = inputNamePrefix + "." + baseName
            ;

            $input.prop( "name", newName );

            // Notify the form validator of the new elements
            // Use 'orgName' since that is consistent over each itteration
            //
            switch ( baseName )
            {
                case "firstName":
                case "lastName":
                    $input.rules( "add",
                    {
                        required:               true
                    } );
                break;

                case "emailAddress":
                    $input.rules( "add",
                    {
                        email:                  true
                    } );
                break;

                case "linkedIn":
                    $input.rules( "add",
                    {
                        linkedInUsername:       true
                    } );
                break;

                default:
                    // NOOP
            }
        } );

        function _setElementValue( data, field, prefix )
        {
            if ( $.type( field ) === "object" )
            {
                $.each( field, function( prop, fields )
                {
                    var newPrefix       = ( prefix ? prefix + "." : "" ) + prop
                    ,   fieldPathParts  = prop.match( /([.\w]+)\[(\d+)\]/ )
                    ,   isArray         = false
                    ;

                    if ( fieldPathParts )
                    {
                        isArray = true;
                    }

                    $.each( fields, function( idx, f )
                    {
                        var item;

                        if ( isArray )
                        {
                            // TODO: itterate...
                            //
                            item = data[ fieldPathParts[ 1 ] ];

                            if ( item )
                            {
                                _setElementValue( item[0], f, newPrefix );
                            }
                        }
                        else
                        {
                            _setElementValue( data[ prop ], f, newPrefix );
                        }

                    } );
                } );
            }
            else
            {
                var $input  = $reference.find( "[name='" + prefix + "." + field + "']" )
                ,   value   = bidx.utils.getValue( data, field )
                ;

                $input.each( function()
                {
                    bidx.utils.setElementValue( $( this ), value  );
                } );
            }
        }
    };



    var _handleToggleChange = function( show, group )
    {
        var fn = show ? "fadeIn" : "hide";

        $toggles.filter( ".toggle-" + group )[ fn ]();
    };

    // Update the UI to show the input / previous run business'
    //
    $toggleInvestsForInst.change( function()
    {
        var value   = $toggleInvestsForInst.filter( "[checked]" ).val();

        _handleToggleChange( value === "true", "investsForInst" );
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
            bidx.util.warn( "investorprofile::_addAttachment: attachment is null!" );
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




    // Build up the gmaps for the current address
    //
    var institutionAddressMapOptions =
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
    ,   institutionAddressMap
    ;

    if ( $institutionAddressMap.length )
    {
        institutionAddressMap = new google.maps.Map( $institutionAddressMap[ 0 ], institutionAddressMapOptions );
    }

    var geocoder        = new google.maps.Geocoder()
    ,   geocodeTimer    = null
    ;

    $institutionAddressCountry.change(      function() { _updateInstitutionAddressMap();    } );
    $institutionAddressCityTown.change(     function() { _updateInstitutionAddressMap();    } );
    $institutionAddressStreet.change(       function() { _updateInstitutionAddressMap();    } );
    $institutionAddressStreetNumber.change( function() { _updateInstitutionAddressMap();    } );
    $institutionAddressPostalCode.change(   function() { _updateInstitutionAddressMap();    } );

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
    var _updateInstitutionAddressMap = function()
    {
        var address         = []
        ,   country         = $institutionAddressCountry.val()
        ,   countryDescr    = $institutionAddressCountry.find( "option:selected" ).text()
        ,   cityTown        = $institutionAddressCityTown.val()
        ,   postalCode      = $institutionAddressPostalCode.val()
        ,   street          = $institutionAddressStreet.val()
        ,   streetNumber    = $institutionAddressStreetNumber.val()
        ,   region          = ""
        ;

        // Do not bother too lookup when no country is selected
        //
        if ( !country )
        {
            $institutionAddressCoordinates.val( "" );
            $institutionAddressMap.hide();
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
                    $institutionAddressCoordinates.val( "" );
                    $institutionAddressMap.hide();
                }
                else
                {
                    coordinates = location.lat() + ", " + location.lng();

                    $institutionAddressCoordinates.val( coordinates );

                    // Zoom in according to the amount of address elements used
                    //
                    zoom = 3 + addressItems * 3;

                    institutionAddressMap.setZoom( zoom );
                    institutionAddressMap.setCenter( response.results.geometry.location );

                    $institutionAddressMap.fadeIn( function()
                    {
                        google.maps.event.trigger( institutionAddressMap, "resize" );
                    });
                }
            } );
        }
    };

    // Use the retrieved member object to populate the form and other screen elements
    //
    function _populateScreen()
    {
        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getValue( member, "bidxInvestorProfile." + f )
            ;

            $input.each( function()
            {
                // Value can be an array! Most likely we are targeting a
                //
                bidx.utils.setElementValue( $( this ), value );
            } );
        } );

        // Now the nested objects
        //
        var previousInvestments = bidx.utils.getValue( member, "bidxInvestorProfile.previousInvestments", true );

        if ( previousInvestments )
        {
            $.each( previousInvestments, function( i, item )
            {
                _addPreviousInvestment( i, item );
            } );
        }

        var references = bidx.utils.getValue( member, "bidxInvestorProfile.references", true );

        if ( references )
        {
            $.each( references, function( i, item )
            {
                _addReference( i, item );
            } );
        }


        // Focuscity, special field because it's a single UI control but a complex structure in the API
        //
        var $focusCity  = $editForm.find( "[name='focusCity']" )
        ,   focusCity   = bidx.utils.getValue( member, "bidxInvestorProfile.focusCity", true )
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

        // Non-array nested structures
        //
        $.each( [ "institutionAddress" ], function()
        {
            var nest    = "" + this // unboxing
            ,   item    = bidx.utils.getValue( member, "bidxInvestorProfile." + nest )
            ;

            if ( item )
            {
                // Find the container for this item and store the data on it
                //
                var containerDataSet = false;

                $.each( fields[ nest ], function( j, f )
                {
                    var $input  = $editForm.find( "[name='" + nest + "." + f + "']" )
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
            }
        } );

        // Attachments
        //
        var attachments         = bidx.utils.getValue( member, "bidxInvestorProfile.attachment", true );

        if ( attachments)
        {
            $.each( attachments, function( idx, attachment )
            {
                bidx.utils.log( "attachment ", idx, attachment );
                _addAttachment( attachment );
            } );
        }

        _updateInstitutionAddressMap();

        // Now that everything is processed, let's decide whicch of the focusLocation radio buttons must
        // be selected
        //
        // Since there is no explicit 'focusLocation' property in the API we need to 'elect' the best option
        // in the radio control to be selected based upon the data that *is* available.
        // Values are booleans
        //
        var focusLocation =
            {
                country:        !!bidx.utils.getValue( member, "bidxInvestorProfile.focusCountry", true )
            ,   city:           !!focusCity
            ,   reach:          !!bidx.utils.getValue( member, "bidxInvestorProfile.focusReach.coordinates" )
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
                    reach:          bidx.utils.getValue( member, "bidxInvestorProfile.focusReach.reach" )
                ,   coordinates:    bidx.utils.getValue( member, "bidxInvestorProfile.focusReach.coordinates" )
                }
            );
        }

        // Update the chosen components with our set values
        //
        $focusIndustry.trigger( "chosen:updated" );
        $focusLanguage.trigger( "chosen:updated" );
        $focusSocialImpact.trigger( "chosen:updated" );
        $focusEnvImpact.trigger( "chosen:updated" );
        $focusConsumerType.trigger( "chosen:updated" );
        $investmentType.trigger( "chosen:updated" );
        $focusCountry.trigger( "chosen:updated" );


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

            bidx.utils.setValue( member, "bidxInvestorProfile." + f, value );
        } );

        // Collect the nested objects
        //
        $.each( [ "institutionAddress", "references", "previousInvestments" ], function()
        {
            var nest                = this + "" // unbox that value!
            ,   i                   = 0
            ,   arrayField          = $.inArray( nest, arrayFields ) !== -1
            ,   memberPath          = "bidxInvestorProfile." + nest
            ,   item
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
            bidx.utils.setNestedStructure( item, count, nest, $editForm, fields[ nest ]  );

            // Now collect the removed items, clear the properties and push them to the list so the API will delete them
            //
            var $reflowContainer
            ,   removedItems
            ;

            switch ( nest )
            {
                case "references":              $reflowContainer = $referencesContainer;            break;
                case "attachment":              $reflowContainer = $attachmentsContainer;           break;
                case "previousInvestments":     $reflowContainer = $previousInvestmentContainer;    break;

                default:
                    // NOOP
            }

            if ( $reflowContainer )
            {
                removedItems = $reflowContainer.reflowrower( "getRemovedItems" );

                $.each( removedItems, function( idx, removedItem )
                {
                    var $removedItem    = $( removedItem )
                    ,   bidxData        = $removedItem.data( "bidxData" )
                    ;

                    if ( bidxData )
                    {
                        // Iterate over the properties and set all, but bidxMeta, to null, except for array's, those must be set to an empty array...
                        //
                        $.each( bidxData, function( prop )
                        {
                            if ( prop !== "bidxMeta" )
                            {
                                bidxData[ prop ] = $.type( bidxData[ prop ] ) === "array"
                                    ? []
                                    : null
                                ;
                            }
                        } );
                    }

                    item.push( bidxData );
                } );
            }

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

        bidx.utils.setValue( member, "bidxInvestorProfile.focusCity", focusCity );

        // Focus Reach is a special component. It's a widget with it's own API.
        //
        var $focusReach     = $editForm.find( "[name='focusReach']" )
        ,   focusReach      = $focusReach.bidx_location( "getLocationData" ) || {}
        ;

        bidx.utils.setValue( member, "bidxInvestorProfile.focusReach.coordinates",  focusReach.coordinates || "" );
        bidx.utils.setValue( member, "bidxInvestorProfile.focusReach.reach",        focusReach.reach || "" );

        // Fix the URL fields so they will be prefixed with http:// in case something valid was provided, but not having a protocol
        //
        var institutionWebsite      = bidx.utils.getValue( member, "bidxInvestorProfile.institutionWebsite" );

        institutionWebsite = bidx.utils.prefixUrlWithProtocol( institutionWebsite );

        if ( institutionWebsite )
        {
            bidx.utils.setValue( member, "bidxInvestorProfile.institutionWebsite", institutionWebsite );
        }

        var previousInvestments     = bidx.utils.getValue( member, "bidxInvestorProfile.previousInvestments", true );

        if ( previousInvestments )
        {
            $.each( previousInvestments, function( idx, previousInvestment )
            {
                previousInvestment.companyWebsite = bidx.utils.prefixUrlWithProtocol( previousInvestment.companyWebsite );
            } );
        }

        // Delete the none-selected focus reach/city/country things, since a user can have selected a focusCity, but the radio control is now set to country. Sicne the API
        // doesn't facility administrating this explicit "do not set the city" we need to unset it ourselves...
        //
        var focusLocationType = $toggleFocusLocationType.filter( "[checked]" ).val();

        if ( focusLocationType !== "country" )
        {
            bidx.utils.setValue( member, "bidxInvestorProfile.focusCountry", [] );
        }

        if ( focusLocationType !== "city" )
        {
            bidx.utils.setValue( member, "bidxInvestorProfile.focusCity", [] );
        }

        if ( focusLocationType !== "reach" && !investorProfileId )
        {
            bidx.utils.setValue( member, "bidxInvestorProfile.focusReach.coordinates", null );
            bidx.utils.setValue( member, "bidxInvestorProfile.focusReach.reach", null );
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

        bidx.utils.setValue( member, "bidxInvestorProfile.attachment", attachments );
    }

    // This is the startpoint
    //
    function _init()
    {
        var cancelHref
        ;
        // Reset any state
        //
        $attachmentsContainer.reflowrower( "empty" );
        $referencesContainer.reflowrower( "empty" );
        $previousInvestmentContainer.reflowrower( "empty" );

        $element.find( ":input" )
            .not( ":button, :submit, :reset" )
                .prop( "checked", false )
                .prop( "selected", false )
                .not( "[type='radio'], [type='checkbox']" )
                    .val( "" )
        ;


        // Inject the save and button into the controls
        //
        $btnSave    = $( "<a />", { "class": "btn btn-primary disabled", href: "#save" } );

        cancelHref  = redirect.cancel ? "#cancel/redirect=" + encodeURIComponent( redirect.cancel ) : "#cancel";
        $btnCancel  = $( "<a />", { "class": "btn btn-primary disabled", href: cancelHref } );


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
            debug: false
        ,   ignore:                         ""
        ,   rules:
            {
                "summary":
                {
                    required:               true
                }
            ,   "investorType":
                {
                    required:               true
                }
            ,   "investsForInst":
                {
                    required:               true
                }
            ,   "institutionWebsite":
                {
                    urlOptionalProtocol:    true
                }
            ,   "institutionAddress.cityTown":
                {
                    required:               function() { return $editForm.find( "[name='investsForInst']" ).val() === "true"; }
                }
            ,   "institutionAddress.country":
                {
                    required:               function() { return $editForm.find( "[name='investsForInst']" ).val() === "true"; }
                }
            ,   "investmentType":
                {
                    required:               true
                }
            ,   "minInvestment":
                {
                    monetaryAmount:         true
                ,   max:                    function() { return $editForm.find( "[name='maxInvestment']" ).val(); }
                }
            ,   "maxInvestment":
                {
                    monetaryAmount:         true
                ,   min:                    function() { return $editForm.find( "[name='minInvestment']" ).val(); }
                }
            ,   "focusIndustry":
                {
                    required:               true
                }
            ,   "socialImpact":
                {
                    required:               true
                }
            ,   "focusEnvImpact":
                {
                    required:               true
                }
            ,   "totalInvestment":
                {
                    monetaryAmount:         true
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
                            bidx.utils.error( "problem parsing error response from investorProfile save" );
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
                bidxInvestorProfile:
                {
                    bidxMeta:
                    {
                    }
                }
            };

            $hideOnCreate.hide();

            // Make sure all the components are brought to live
            //
            _populateScreen();

            $btnSave.removeClass( "disabled" );
            $btnCancel.removeClass( "disabled" );

            _showView( "edit" );
        }
        else if ( state === "edit" )
        {
            $hideOnCreate.show();

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
                        var bidxMeta    = bidx.utils.getValue( response, "bidxInvestorProfile.bidxMeta" ) || bidx.utils.getValue( response, "bidxEntrepreneurProfile" )
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
                            investorProfileId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );

                            bidx.utils.log( "bidx::invvestor", member );

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
                                _updateInstitutionAddressMap();
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
        var bidxMeta = member.bidxInvestorProfile.bidxMeta ? member.bidxInvestorProfile.bidxMeta : member.bidxInvestorProfile;
        bidxMeta.bidxEntityType   = "bidxInvestorProfile";

        // Update the member object
        //
        _getFormValues();

        bidx.common.notifySave();

        bidx.utils.log( "about to save member", member );

        bidxAPIParams   =
        {
            data:           member.bidxInvestorProfile
        ,   groupDomain:    bidx.common.groupDomain
        ,   success:        function( response )
            {
                var url;

                bidx.utils.log( bidxAPIService + "::success::response", response );

                bidx.common.closeNotifications();

                bidx.common.notifyRedirect();
                bidx.common.removeAppWithPendingChanges( appName );

                // if a success redirect is defined
                //
                if( redirect.success )
                {
                    url =  redirect.success;
                }
                // otherwise go to default state of app
                //
                else
                {
                    // grab the url before the #
                    url = document.location.href.split( "#" ).shift();
                }

                bidx.controller.doSuccess( url, true );
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
        // set redirect for this app's Save & Cancel button if overrides are set
        //
        if ( options.params && ( options.params.success || options.params.cancel ) )
        {
            redirect =
            {
                cancel:     ( options.params && options.params.cancel ) ? options.params.cancel : "member/" + options.id
            ,   success:    ( options.params && options.params.success ) ? options.params.success : "member/" + options.id
            };

        }


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
                    investorProfileId   = null;
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
                    var hash = "editInvestor/" + options.id;

                    if ( options.section )
                    {
                         hash += "/" + options.section;
                    }

                    return hash;
                }
            break;

            case "create":
                bidx.utils.log( "EditInvestor::AppRouter::create" );

                // Protect against 'double creation' it is only allowed to have
                // one investor profile
                //
                if ( bidx.controller.getInvestorProfileId() )
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

        // lookup save & cancel buttons


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

    window.bidx.investorprofile = app;
} ( jQuery ));
