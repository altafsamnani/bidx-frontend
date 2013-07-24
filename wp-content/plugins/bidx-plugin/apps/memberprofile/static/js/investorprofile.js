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
    ,   bidx                        = window.bidx
    ,   snippets                    = {}

    ;

    // Form fields
    //
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
        var $investmentType = snippets.$previousInvestment.find( "[name='investmentType']" );
        $investmentType.append( $( "<option value='' />" ).text( "Select investment type" ));

        bidx.utils.populateDropdown( $investmentType, investmentTypes );
    } );

    bidx.data.getItem( "documentType", function( err, documentTypes )
    {
        var $documentType = snippets.$attachment.find( "[name='documentType']" );
        $documentType.append( $( "<option value='' />" ).text( "Select the type" ));

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

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $previousInvestment.find( "input, select, textarea" ).each( function( )
        {
            var $input = $( this );

            $input.prop( "name", inputNamePrefix + "." + $input.prop( "name" ) );
        } );

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

        $previousInvestmentContainer.reflowrower( "addItem", $previousInvestment );
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

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $reference.find( "input, select, textarea" ).each( function( )
        {
            var $input = $( this );

            $input.prop( "name", inputNamePrefix + "." + $input.prop( "name" ) );
        } );

        if ( reference )
        {
            $.each( fields.references, function( j, f )
            {
                _setElementValue( reference, f, inputNamePrefix );
            } );
        }

        $referencesContainer.reflowrower( "addItem", $reference );

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


    // Instantiate reflowrower on the attachments container
    //
    $attachmentsContainer.reflowrower(
    {
        itemsPerRow:        3
    ,   removeItemOverride: function( $item, cb )
        {
            var attachment      = $item.data( "attachment" )
            ,   documentId      = attachment.bidxEntityId
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
                        bidx.common.notifySuccess( "Attachment deleted" );

                        cb();

                        $attachmentsContainer.reflowrower( "removeItem", $item, true );
                    }
                ,   error:            function( jqXhr, textStatus )
                    {
                        bidx.utils.log( "bidx::entityDocument::destroy::error", jqXhr, textStatus );

                        alert( "Problems deleting attachment" );

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
        $investorType.append( $( "<option value='' />" ).text( "Select your investor" ));

        bidx.utils.populateDropdown( $investorType, investorTypes );
    } );

    // Populate the dropdowns with the values
    //
    bidx.data.getItem( "country", function( err, countries )
    {
        $institutionAddressCountry.append( $( "<option value='' />" ).text( "Select the country" ));

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
                $.each( fields[ nest ], function( j, f )
                {
                    var $input  = $editForm.find( "[name='" + nest + "." + f + "']" )
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

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $attachment.find( "input, select, textarea" ).each( function( )
        {
            var $input = $( this );

            $input.prop( "name", inputNamePrefix + "." + $input.prop( "name" ) );
        } );

        $attachment.data( "attachment", attachment );

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

        // Collect the nested objects that are not arrays
        //
        $.each( [ "institutionAddress" ], function()
        {
            var nest        = this
            ,   memberPath  = "bidxInvestorProfile." + nest
            ,   item        = bidx.utils.getValue( member, memberPath )
            ;

            // Property not existing? Add it as an empty array holding an empty object
            //
            if ( !item )
            {
                item = {};
                bidx.utils.setValue( member, memberPath, item );
            }

            $.each( fields[ nest ], function( j, f )
            {
                var inputPath   = nest + "." + f
                ,   $input      = $editForm.find( "[name='" + inputPath + "']" )
                ,   value       = bidx.utils.getElementValue( $input )
                ;

                bidx.utils.setValue( item, f, value );
            } );
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


        // Collect the nested objects || Arrays
        //
        $.each( [ "references", "previousInvestments" ], function()
        {
            var nest                = this
            ,   i                   = 0
            ,   count               = $editForm.find( "." + nest + "Item" ).length
            ,   memberPath          = "bidxInvestorProfile." + nest
            ,   item                = bidx.utils.getValue( member, memberPath, true )
            ,   inputPathPrefix
            ;

            // Property not existing? Add it as an empty array holding an empty object
            //
            if ( !item )
            {
                item = [ {} ];
                bidx.utils.setValue( member, memberPath, item );
            }

            for ( i = 0; i < count; i++ )
            {
                inputPathPrefix = nest + "[" + i + "]";

                if ( !item[ i ] )
                {
                    item[ i ] = {};
                }

                $.each( fields[ nest ], function( j, f )
                {
                    // TODO: make properly recursive, only one layer of nested-nested objects now
                    //
                    if ( $.type( f ) === "object" )
                    {
                        $.each( f, function( k, v )
                        {
                            var inputPath   = inputPathPrefix + "." + k
                            ,   isArray     = false
                            ,   myItem      = item[ i ]
                            ;

                            // Is it an array?
                            //
                            var fieldPathParts = k.match( /([.\w]+)\[(\d+)\]/ );

                            if ( fieldPathParts )
                            {
                                isArray     = true;
                                myItem      = bidx.utils.getValue( item[ i ], fieldPathParts[ 1 ], true );

                                if ( !myItem )
                                {
                                    myItem = [ {} ];
                                    bidx.utils.setValue( item[ i ], fieldPathParts[ 1 ], myItem );
                                }
                            }

                            $.each( v, function( j, f )
                            {
                                var $input      = $editForm.find( "[name='" + inputPath + "." + f + "']" )
                                ,   value       = bidx.utils.getElementValue( $input )
                                ;

                                if ( isArray )
                                {
                                    // TODO: itterate, but index 0 is ok'ish for now
                                    //
                                    bidx.utils.setValue( myItem[ 0 ], f, value );
                                }
                                else
                                {
                                    bidx.utils.setValue( myItem, k + "." + f, value );
                                }
                            } );
                        } );
                    }
                    else
                    {
                        var inputPath   = inputPathPrefix + "." + f
                        ,   $input      = $editForm.find( "[name='" + inputPath + "']" )
                        ,   value       = bidx.utils.getElementValue( $input )
                        ;

                        bidx.utils.setValue( item[ i ], f, value );
                    }
                } );
            }
        } );

        // Attachments
        //
        if ( state === "edit" )
        {
            // TODO: retrieve attachment values
        }
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
                        member = response;

                        // Set the global memberProfileId for convenience reasons
                        //
                        investorProfileId = bidx.utils.getValue( member, "bidxInvestorProfile.bidxEntityId" );

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
        member.bidxEntityType                       = "bidxInvestorProfile";
        member.bidxInvestorProfile.bidxEntityType   = "bidxInvestorProfile";

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
                    memberId            = id;
                    investorProfileId   = null;
                    state               = "edit";

                    $element.show();
                    _showView( "load" );

                    _init();
                }

                if ( updateHash )
                {
                    var hash = "editInvestor/" + id;

                    if ( section )
                    {
                         hash += "/" + section;
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

                    // Create the investor profile by doing a POST
                    // We *need* this for the fileupload to work
                    //
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
            bidx.common.notifySuccess( "Attachment upload done" );

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
