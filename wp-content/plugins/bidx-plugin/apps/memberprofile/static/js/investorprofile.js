( function( $ )
{
    var $element                    = $( "#editInvestor" )
    ,   $views                      = $element.find( ".view" )
    ,   $editForm                   = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $investorType               = $editForm.find( "[name='investorType']" )

    ,   $attachments                = $editForm.find( ".attachments" )
    ,   $attachmentList             = $attachments.find( ".attachmentList" )

    ,   $toggles                    = $element.find( ".toggle" ).hide()
    ,   $toggleInvestsForInst       = $element.find( "[name='investsForInst']"      )

    ,   $institutionAddressMap          = $editForm.find( ".currentAddressMap" )
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
        ,   'focusIndustry'             // array
        ,   'focusSocialImpact'         // array
        ,   'focusEnvImpact'            // array
        ,   'focusConsumerType'         // array
        ,   'focusCity'                 // array
        ,   'focusCountry'              // array
        ,   'focusStageBusiness'        // array
        ,   'focusGender'               // array
        ,   'additionalPreferences'
        ,   'numberInvestments'
        ,   'totalInvestment'
        ,   'typicalInvolvement'        // array
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

    ,   previousInvestments:            // array
        [
            'companyName'
        ,   'companyWebsite'
        ,   'investmentType'
        ]

    ,   attachment:                     // array
        [
            "purpose"
        ,   "documentType"
        ]
    };

    // Grab the snippets from the DOM
    //
    //snippets.$language      = $snippets.children( ".languageItem"   ).remove();


    // Disable disabled links
    //
    $element.delegate( "a.disabled", "click", function( e )
    {
        e.preventDefault();
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
    $attachmentList.reflowrower();


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
        $.each( [ "institutionAddress" ], function()
        {
            var nest    = this
            ,   items   = bidx.utils.getValue( member, "bidxInvestorProfile." + nest, true )
            ;

            if ( items )
            {
                $.each( items, function( i, item )
                {
                    $.each( fields[ nest ], function( j, f )
                    {
                        var $input  = $editForm.find( "[name='" + nest + "[" + i + "]." + f + "']" )
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

        // Attachments
        //
        var attachments         = bidx.utils.getValue( member, "bidxInvestorProfile.attachment", true );

        if ( attachments)
        {
            $.each( attachments, function( idx, attachment )
            {
                bidx.utils.log( "attachment", attachment );
                _addAttachmentToScreen( attachment );
            } );
        }

        _updateInstitutionAddressMap();
    };

    // Add the attachment to the screen, by cloning the snippet and populating it
    //
    var _addAttachmentToScreen = function( attachment )
    {
        if ( attachment === null )
        {
            bidx.util.warn( "investorprofile::_addAttachmentToScreen: attachment is null!" );
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

        $attachmentList.reflowrower( "addItem", $attachment );
    };

    // Convert the form values back into the member object
    //
    var _getFormValues = function()
    {
    };

    // This is the startpoint
    //
    var _init = function()
    {
        // Reset any state
        //
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
                    entityId:           investorProfileId
                ,   documentId:         documentId
                ,   groupDomain:        bidx.common.groupDomain
                ,   success:            function( response )
                    {
                        bidx.utils.log( "bidx::entityDocument::destroy::success", response );

                        $attachmentList.reflowrower( "removeItem", $attachment );
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
        member.bidxEntityType = "bidxInvestorProfile";

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

            // Clear the input by cloneing it
            //
            var $input = result.el;

            $input.replaceWith( $input.clone() );

            $input.fileUpload( { "parentForm": $input.prop( "form" ) });
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
