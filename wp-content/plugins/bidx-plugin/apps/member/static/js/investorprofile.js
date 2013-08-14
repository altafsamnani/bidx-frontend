( function( $ )
{
    var $element                        = $( "#editInvestor" )
    ,   $views                          = $element.find( ".view" )
    ,   $editForm                       = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                       = $element.find( ".snippets" )

    ,   $hideOnCreate                   = $element.find( ".hideOnCreate" )

    ,   $investorType                   = $editForm.find( "[name='investorType']" )

    ,   $btnAddPreviousInvestment       = $editForm.find( "[href$='#addPreviousInvestment']" )
    ,   $previousInvestmentContainer    = $editForm.find( ".previousInvestmentContainer" )

    ,   $btnAddReference                = $editForm.find( "[href$='#addReference']" )
    ,   $referencesContainer            = $editForm.find( ".referencesContainer" )

    ,   $attachmentsContainer           = $editForm.find( ".attachmentsContainer" )

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
    ,   bidx                        = window.bidx
    ,   snippets                    = {}

    ,   appName                     = "member"
    ;

    // Form fields
    //
    var arrayFields = [ "focusCity", "previousInvestments", "references", "attachment" ];

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

    ,   attachment:
        [
            "purpose"
        ,   "documentType"
        ]
    };

    // Grab the snippets from the DOM
    //
    snippets.$previousInvestment    = $snippets.children( ".previousInvestmentsItem" ).remove();
    snippets.$reference             = $snippets.children( ".referencesItem"          ).remove();
    snippets.$attachment            = $snippets.children( ".attachmentItem"          ).remove();

    // Populate the dropdowns with the values
    //
    bidx.data.getItem( "investmentType", function( err, investmentTypes )
    {
        var $investmentType     = snippets.$previousInvestment.find( "[name='investmentType']" )
        ,   $noValue            = $( "<option value='' />" )
        ;

        $noValue.i18nText( "selectInvestmentType", appName );
        $investmentType.append( $noValue );

        bidx.utils.populateDropdown( $investmentType, investmentTypes );
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


    // Disable disabled links
    //
    $element.delegate( "a.disabled", "click", function( e )
    {
        e.preventDefault();
    } );

    // Instantiate reflowrower on the previousInvestment container
    //
    $previousInvestmentContainer.reflowrower( { itemsPerRow: 2 } );
    $referencesContainer.reflowrower( { itemsPerRow: 2 } );

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
                var $input  = $previousInvestment.find( "[name='" + inputNamePrefix + "." + f + "']" )
                ,   value   = bidx.utils.getValue( previousInvestment, f )
                ;

                $input.each( function()
                {
                    bidx.utils.setElementValue( $( this ), value  );
                } );
            } );
        }

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
                        url:                    true
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

    // Add an empty previous business block
    //
    $btnAddPreviousInvestment.click( function( e )
    {
        e.preventDefault();

        _addPreviousInvestment();
    } );

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
                        if ( isArray )
                        {
                            // TODO: itterate...
                            //
                            _setElementValue( data[ fieldPathParts[1] ][0], f, newPrefix );
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

    // Add an empty previous business block
    //
    $btnAddReference.click( function( e )
    {
        e.preventDefault();

        _addReference();
    } );


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



    // Instantiate reflowrower on the attachments container
    //
    $attachmentsContainer.reflowrower(
    {
        itemsPerRow:        3
    ,   removeItemOverride: function( $item, cb )
        {
            var attachment      = $item.data( "bidxData" )
            ,   documentId      = attachment.bidxMeta ? attachment.bidxMeta.bidxEntityId : attachment.bidxEntityId
            ;

            bidx.api.call(
                "entityDocument.destroy"
            ,   {
                    entityId:           investorProfileId
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

    // Populate the dropdowns with the values
    //
    bidx.data.getItem( "investorType", function( err, investorTypes )
    {
        var $noValue = $( "<option value='' />" );

        $noValue.i18nText( "selectInvestor", appName );
        $investorType.append( $noValue );

        bidx.utils.populateDropdown( $investorType, investorTypes );
    } );

    // Populate the dropdowns with the values
    //
    bidx.data.getItem( "country", function( err, countries )
    {
        var $noValue = $( "<option value='' />" );

        $noValue.i18nText( "selectCountry", appName );
        $institutionAddressCountry.append( $noValue );

        bidx.utils.populateDropdown( $institutionAddressCountry, countries );
    } );


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
    ,   institutionAddressMap       = new google.maps.Map( $institutionAddressMap[ 0 ], institutionAddressMapOptions )
    ;

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
    var _populateScreen = function()
    {
        // Setup the hidden fields used in the file upload
        //
        $editForm.find( "[name='domain']"               ).val( bidx.common.groupDomain );
        $editForm.find( "[name='investorProfileId']"    ).val( investorProfileId );

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
                bidx.utils.log( "attachment", attachment );
                _addAttachmentToScreen( idx, attachment );
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

        $toggleFocusLocationType.filter( "[value='" + focusLocationValue + "']" ).radio( "check" );
    };

    // Add the attachment to the screen, by cloning the snippet and populating it
    //
    var _addAttachmentToScreen = function( index, attachment )
    {
        if ( attachment === null )
        {
            bidx.util.warn( "investorprofile::_addAttachmentToScreen: attachment is null!" );
            return;
        }

        if ( !index )
        {
            index = $attachmentsContainer.find( ".attachmentItem" ).length;
        }

        var $attachment         = snippets.$attachment.clone()
        ,   uploadedDateTime    = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
        ,   inputNamePrefix     = "attachment[" + index + "]"
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

        $attachment.find( ".documentImage" ).attr( "src", imageSrc );
        $attachment.find( ".documentLink"  ).attr( "href", attachment.document );

        $attachmentsContainer.reflowrower( "addItem", $attachment );
    };

    // Convert the form values back into the member object
    //
    var _getFormValues = function()
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
        $.each( [ "institutionAddress", "references", "previousInvestments", "attachment", "focusReach" ], function()
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
    };

    // This is the startpoint
    //
    var _init = function()
    {
        // Reset any state
        //
        $attachmentsContainer.reflowrower( "empty" );
        $referencesContainer.reflowrower( "empty" );
        $previousInvestmentContainer.reflowrower( "empty" );

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
                "summary":
                {
                    required:               true
                }
            ,   "investsForInst":
                {
                    required:               true
                }
            ,   "institutionWebsite":
                {
                    url:                    true
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
                            bidx.utils.error( "problem parsing error response from investorProfile save" );
                        }

                        bidx.common.notifyError( "Something went wrong during save: " + response );

                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                    }
                } );
            }
        } );

        // Instantiate file upload and location plugin
        //
        $editForm.find( "[data-type=fileUpload]" ).fileUpload( { "parentForm": $editForm[0] });
        $editForm.find( "[data-type=location]"   ).location({});

        if ( state === "create" )
        {
            member =
            {
                bidxInvestorProfile: {}
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
    };

    // Try to save the member to the API
    //
    var _save = function( params )
    {
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

        bidx.utils.log( "about to save member", member );

        var bidxAPIService
        ,   bidxAPIParams   =
            {
                data:           member.bidxInvestorProfile
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( response )
                {
                    bidx.utils.log( bidxAPIService + "::success::response", response );

                    bidx.common.notifyRedirect();

                    var url = document.location.href.split( "#" ).shift();

                    // Maybe rs=true was already added, or not 'true' add it before reloading
                    //
                    var rs = bidx.utils.getQueryParameter( "rs", url );

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
                }
            };

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
                    return navigate( "edit" );
                }
                else
                {
                    memberId    = null;
                    state       = "create";

                    $element.show();

                    _showView( "load" );

                    _init();
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
        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.investorprofile = app;
} ( jQuery ));
