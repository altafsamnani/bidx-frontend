/* global bidx */
( function( $ )
{
    var $element        = $( "#editCompany" )
    ,   $controls       = $( ".editControls" )
    ,   $views          = $element.find( ".view" )
    ,   $editForm       = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets       = $element.find( ".snippets" )

    ,   $toggles                            = $element.find( ".toggle" ).hide()
    ,   $toggleRegistered                   = $element.find( "[name='registered']"      )
    ,   $toggleHaveEmployees                = $element.find( "[name='haveEmployees']"   )

    ,   $btnSave
    ,   $btnCancel

        // Profile picture
        //
    ,   $logoControl                        = $editForm.find( ".logo-control" )
    ,   $logoContainer                      = $logoControl.find( ".logoContainer" )
    ,   $btnChangeLogo                      = $logoControl.find( "a[href$='changeLogo']" )
    ,   $changeLogoModal                    = $logoControl.find( ".changeLogoModal" )

    ,   $currentAddressMap                  = $editForm.find( ".currentAddressMap"                          )
    ,   $currentAddressCountry              = $editForm.find( "[name='statutoryAddress.country']"           )
    ,   $currentAddressCityTown             = $editForm.find( "[name='statutoryAddress.cityTown']"          )
    ,   $currentAddressPostalCode           = $editForm.find( "[name='statutoryAddress.postalCode']"        )
    ,   $currentAddressStreet               = $editForm.find( "[name='statutoryAddress.street']"            )
    ,   $currentAddressStreetNumber         = $editForm.find( "[name='statutoryAddress.streetNumber']"      )
    ,   $currentAddressCoordinates          = $editForm.find( "[name='statutoryAddress.coordinates']"       )

    ,   $btnAddCountryOperationSpecifics    = $editForm.find( "[href$='#addCountryOperationSpecifics']"     )
    ,   $countryOperationSpecificsAccordion = $editForm.find( ".countryOperationSpecifics > .accordion"    )

        // Main object for holding the company
        //
    ,   company
    ,   companyId
    ,   companyProfileId
    ,   state
    ,   currentView

    ,   snippets        = {}

    ,   appName         = "company"
    ,   slaveApp        = false

    ,   callbacks       = null
    ;

    if ( !$element.length )
    {
        bidx.utils.warn( "edit company was loaded, but the HTML wasn't in the DOM.. why did you do this?" );
        return;
    }

    // Form fields
    //
    var arrayFields = [ "countryOperationSpecifics" ];

    var fields =
    {
        _root:
        [
            'name'
        ,   'website'
        ,   'registered'
        ,   'dateCompanyEstab'
        ,   'legalFormBusiness'
        ,   'fiscalNumber'
        ,   'registrationNumber'
        ,   'numPermFemaleEmpl'
        ,   'numPermMaleEmpl'
        ,   'numTempFemaleEmpl'
        ,   'numTempMaleEmpl'
        ]

    ,   statutoryAddress:
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

    ,   countryOperationSpecifics:
        [
            'country'
        ,   'permitsLicencesObtained'
        ,   'companyTradeName'
        ]   // TODO: companyAddress
    };

    // Grab the snippets from the DOM
    //
    snippets.$countryOperationSpecifics  = $snippets.children( ".countryOperationSpecificsItem"   ).remove();

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

    // Populate the peronsalDetails.nationality select box using the data items
    //
    bidx.data.getContext( "country", function( err, countries )
    {
        var $noValue            = $( "<option value='' />" );

        $currentAddressCountry.empty();

        $noValue.i18nText( "selectCountry", appName );
        $currentAddressCountry.append( $noValue );

        bidx.utils.populateDropdown( $currentAddressCountry, countries );
    } );

    bidx.data.getContext( "country", function( err, countries )
    {
        var $countryOperationSpecificsCountry   = snippets.$countryOperationSpecifics.find( "[name='country']" )
        ,   $noValue                            = $( "<option value='' />" )
        ;

        $noValue.i18nText( "selectCountry", appName );
        $currentAddressCountry.append( $noValue );

        bidx.utils.populateDropdown( $countryOperationSpecificsCountry, countries );
    } );

    bidx.data.getContext( "permitsObtained", function( err, permitsOptained )
    {
        var $countryOperationSpecificsPermitsLicencesObtained   = snippets.$countryOperationSpecifics.find( "[name='permitsLicencesObtained']" )
        ,   $noValue                                            = $( "<option value='' />" )
        ;

        $noValue.i18nText( "selectPermitsObtained", appName );

        $countryOperationSpecificsPermitsLicencesObtained.append( $noValue );

        bidx.utils.populateDropdown( $countryOperationSpecificsPermitsLicencesObtained, permitsOptained );
    } );

    bidx.data.getContext( "legalForm", function( err, legalForms )
    {
        var $legalFormBusiness  = $editForm.find( "[name='legalFormBusiness']" )
        ,   $noValue            = $( "<option value='' />" )
        ;

        $noValue.i18nText( "selectLegalFormBusiness", appName );
        $legalFormBusiness.append( $noValue );

        bidx.utils.populateDropdown( $legalFormBusiness, legalForms );
    } );


    // Disable disabled links
    //
    $element.delegate( "a.disabled", "click", function( e )
    {
        e.preventDefault();
    } );

    // Fix for the symbol (+ or -) to the accordion header by adding the class .collapsed to the siblings of the element that was clicked
    //
    $element.delegate( "a.accordion-toggle", "click", function( e )
    {
        $( this ).parents( ".countryOperationSpecificsItem" ).siblings().find( ".accordion-toggle:not(.collapsed)" ).addClass( "collapsed" );
    } );

    // Handle toggle states of showing/hiding complete toggle blocks
    //
    var _handleToggleChange = function( show, group )
    {
        var fn = show ? "fadeIn" : "hide";

        $toggles.filter( ".toggle-" + group )[ fn ]();
    };

    $toggleRegistered.change( function( e )
    {
        var value   = $toggleRegistered.filter( "[checked]" ).val();

        _handleToggleChange( value === "true", "registered" );
    } );

    $toggleHaveEmployees.change( function()
    {
        var value   = $toggleHaveEmployees.filter( "[checked]" ).val();

        _handleToggleChange( value === "true", "haveEmployees" );
    } );

    // Add the snippet for another run business
    //
    var _addCountryOperationSpecifics = function( index, countryOperationSpecifics )
    {
        if ( !index )
        {
            index = $countryOperationSpecificsAccordion.find( ".countryOperationSpecificsItem" ).length;
        }

        var $countryOperationSpecifics  = snippets.$countryOperationSpecifics.clone()
        ,   inputNamePrefix             = "countryOperationSpecifics[" + index + "]"
        ,   myId                        = bidx.utils.generateId()
        ;

        // Set accordion / toggle controls
        //
        $countryOperationSpecifics.find( ".accordion-toggle" )
            .attr( "href", "#" + myId );

        $countryOperationSpecifics.find( ".accordion-body"   ).attr( "id", myId );

        if ( countryOperationSpecifics )
        {
            $.each( fields.countryOperationSpecifics, function( j, f )
            {
                var $input  = $countryOperationSpecifics.find( "[name='" + inputNamePrefix + "." + f + "']" )
                ,   value   = bidx.utils.getValue( countryOperationSpecifics, f )
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

        // Fix headers of the existing collapse controls by explicitly removing the collapsed clas
        // This is an issue with the bootstrap plugin!
        //
        $countryOperationSpecificsAccordion.find( ".accordion-group" ).each( function()
        {
            var $group      = $( this )
            ,   $toggle     = $group.find( "[data-toggle=collapse]" )
            ;

            $toggle.addClass( "collapsed" );
        } );

        // Add to the DOM
        //
        $countryOperationSpecificsAccordion.append( $countryOperationSpecifics );

        $countryOperationSpecifics.find( ".accordion-body" ).collapse(
        {
            parent:             "#countryOperationSpecificsAccordion"
        } );

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $countryOperationSpecifics.find( "input, select, textarea" ).each( function( )
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
                case "country":
                case "permitsLicencesObtained":
                    $input.rules( "add",
                    {
                        required:               true
                    } );
                break;

                default:
                    // NOOP
            }
        } );
    };

    // Add an empty previous business block
    //
    $btnAddCountryOperationSpecifics.click( function( e )
    {
        e.preventDefault();

        _addCountryOperationSpecifics();
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


    $btnChangeLogo.click( function( e )
    {
        e.preventDefault();

        // Make sure the media app is within our modal container
        //
        $( "#media" ).appendTo( $changeLogoModal.find( ".modal-body" ) );

        var $selectBtn = $changeLogoModal.find(".btnSelectFile")
        ,   $cancelBtn = $changeLogoModal.find(".btnCancelSelectFile");

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
                    bidx.utils.log( "[company] ready in state", state );
                }

            ,   cancel:                 function()
                {
                    // Stop selecting files, back to previous stage
                    //
                    $changeLogoModal.modal('hide');
                }

            ,   success:                function( file )
                {
                    bidx.utils.log( "[company] uploaded", file );

                    // NOOP.. the parent app is not interested in when the file is uploaded
                    // only when it is attached / selected
                }

            ,   select:               function( file )
                {
                    bidx.utils.log( "[company] selected profile picture", file );

                    bidx.utils.setValue( company, "logo", file );

                    $logoContainer.replaceWith( $( "<img />", { "src": file.document  } ));

                    $changeLogoModal.modal( "hide" );
                }
            }
        } );

        $changeLogoModal.modal();
    } );

    // Use the retrieved company object to populate the form and other screen elements
    //
    var _populateScreen = function()
    {
        // Start by setting the toggles false, will switch to true if needed
        //
        $toggleRegistered.filter( "[value='false']" ).prop( "checked", true );
        $toggleHaveEmployees.filter( "[value='false']" ).prop( "checked", true );

        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getValue( company, f )
            ;

            // HTML Unescape the values
            //
            value = $( "<div />" ).html( value ).text();

            $input.each( function()
            {
                bidx.utils.setElementValue( $( this ), value );
            } );
        } );

        // Logo is 'special'
        //
        var logo = bidx.utils.getValue( company, "logo", true );

        if ( logo && logo.length && logo[ 0 ].document )
        {
            $logoContainer.append( $( "<img />", { "src": logo[ 0 ].document  } ));
        }

        // Now the nested objects, NOT ARRAY's
        //
        $.each( [ "statutoryAddress" ], function()
        {
            var nest    = this
            ,   item    = bidx.utils.getValue( company, nest )
            ;

            $.each( fields[ nest ], function( j, f )
            {
                var $input  = $editForm.find( "[name='" + nest + "." + f + "']" )
                ,   value   = bidx.utils.getValue( item, f )
                ;

                if ( f === "country" && value )
                {
                    value = ( value + "" ).toUpperCase();
                }

                // HTML Unescape the values
                //
                value = $( "<div />" ).html( value ).text();

                $input.each( function()
                {
                    bidx.utils.setElementValue( $( this ), value  );
                } );
            } );
        } );

        _updateCurrentAddressMap();

        // For "Have Employees?" there is no explicit property, so set the UI control conditional on having employees
        //
        var haveEmployees = false;
        $.each( [ "numPermMaleEmpl", "numPermFemaleEmpl", "numTempMaleEmpl", "numTempFemaleEmpl" ], function( idx, field )
        {
            if ( bidx.utils.getValue( company, field ) )
            {
                haveEmployees = true;
            }
        } );

        if ( haveEmployees )
        {
            $toggleHaveEmployees.filter( "[value='true']" ).prop( "checked", true );
        }

        // Fire of the toggle controls so the UI get's updated to it's current values
        //
        $toggleRegistered.trigger( "change" );
        $toggleHaveEmployees.trigger( "change" );

        if ( $.isFunction( $toggleRegistered.radio ))
        {
            $toggleRegistered.filter( ":checked" ).radio( "setState" );
        }

        if ( $.isFunction( $toggleHaveEmployees.radio ) )
        {
            $toggleHaveEmployees.filter( ":checked" ).radio( "setState" );
        }
    };


    // Convert the form values back into the company object
    //
    var _getFormValues = function()
    {
        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = $input.is( ":visible" ) || $input.is( "[type='radio']" ) ? bidx.utils.getElementValue( $input ) : ""
            ;

            bidx.utils.setValue( company, f, value );
        } );

        // Collect the nested objects
        //
        $.each( [ "statutoryAddress", "countryOperationSpecifics" ], function()
        {
            var nest                = this + ""
            ,   i                   = 0
            ,   arrayField          = $.inArray( nest, arrayFields ) !== -1
            ,   companyPath         = nest
            ,   item                = bidx.utils.getValue( company, companyPath, true )
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

            bidx.utils.setValue( company, companyPath, item );

            bidx.utils.setNestedStructure( item, count, nest, $editForm, fields[ nest ]  );

            // TODO: implement deletion of items
        } );

        // Fix the URL fields so they will be prefixed with http:// in case something valid was provided, but not having a protocol
        //
        if ( company.website )
        {
            company.website = bidx.utils.prefixUrlWithProtocol( company.website );
        }
    };

    // This is the startpoint
    //
    var _init = function()
    {
        // Reset any state
        //
        $logoContainer.empty();

        // This is a bit of a hack so not to refactor the whole bunch
        // currently only when not running as a slave app these button are actually put inside the dom.
        //
        $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    });
        $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "/member"  });

        // Inject the save and button into the controls
        //
        if ( !slaveApp )
        {
            $controls.empty();

            $btnSave.i18nText( ( state === "create" ? "btnAddCompany" : "btnSaveCompany" ), appName );
            $btnCancel.i18nText( "btnCancel" );

            // Wire the submit button which can be anywhere in the DOM
            //
            $btnSave.click( function( e )
            {
                e.preventDefault();

                $editForm.submit();
            } );

            $controls.append( $btnSave );

            // NOTE: Currently we assume that the cancel always navigates back to the member page
            //if ( state === "edit" )
            //{
                $controls.append( $btnCancel );
            //}
        }

        // Setup form
        //
        var $validator = $editForm.validate(
        {
            rules:
            {
                "name":
                {
                    required:                   true
                }
            ,   "website":
                {
                    urlOptionalProtocol:        true
                }
            ,   "registered":
                {
                    required:                   true
                }
            ,   "statutoryAddress.country":
                {
                    required:                   true
                }
            ,   "statutoryAddress.cityTown":
                {
                    required:                   true
                }
            ,   "dateCompanyEstab":
                {
                    dpDate:                     true
                }
            ,   "numPermFemaleEmpl":
                {
                    digits:                     true
                }
            ,   "numTempFemaleEmpl":
                {
                    digits:                     true
                }
            ,   "numPermMaleEmpl":
                {
                    digits:                     true
                }
            ,   "numTempMaleEmpl":
                {
                    digits:                     true
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

                if ( callbacks )
                {
                    callbacks.saving();
                }

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
                            bidx.utils.error( "problem parsing error response from company save" );
                        }

                        bidx.common.notifyError( "Something went wrong during save: " + response );

                        $btnSave.removeClass( "disabled" );
                        $btnCancel.removeClass( "disabled" );
                    }
                } );
            }
        } );

        $editForm.validate().resetForm();

        if ( state === "edit" )
        {
            // Fetch the company
            //
            bidx.api.call(
                "company.fetch"
            ,   {
                    companyId:      companyId
                ,   groupDomain:    bidx.common.groupDomain
                ,   success:        function( response )
                    {
                        // Do we have edit perms?
                        //
                        var bidxMeta    = bidx.utils.getValue( response, "bidxMeta" ) || response
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
                            company = response;
                            bidx.utils.log( "bidx::company", company );

                            // Set the global memberProfileId for convenience reasons
                            //
                            companyProfileId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );

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

                        _showError( "Something went wrong while retrieving the company: " + status );
                    }
                }
            );
        }
        else
        {
            company     = {};

            _populateScreen();

            $btnSave.removeClass( "disabled" );
            $btnCancel.removeClass( "disabled" );

            _showView( "edit" );
        }
    };

    // Central save method, also exposed to the outside world
    //
    function save()
    {
        $editForm.submit();
    }

    // Try to save the company to the API
    //
    var _save = function( params )
    {
        if ( !company )
        {
            return;
        }

        var bidxMeta    = bidx.utils.getValue( company, "bidxMeta" ) || company;

        // Inform the API we are updating the company profile
        //
        bidxMeta.bidxEntityType = "bidxCompany";

        // Update the company object
        //
        _getFormValues();

        if ( !slaveApp )
        {
            bidx.common.notifySave();
        }

        var requestParams =
        {
            groupDomain:    bidx.common.groupDomain
        ,   data:           company
        ,   success:        function( response )
            {
                bidx.utils.log( "company.save::success::response", response );

                var bidxMeta = bidx.utils.getValue( response, "data.bidxMeta" ) || bidx.utils.getValue( response, "data" );

                if ( state === "create" )
                {
                    companyId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );
                }

                // Regardless if the app runs as slave app, now the data is saved it can be removed from the pending list
                //
                bidx.common.removeAppWithPendingChanges( appName );

                // If running as a slave app, notify the change via a callback
                //
                if ( callbacks )
                {
                    callbacks.success( response.data );
                }

                if ( !slaveApp )
                {
                    bidx.common.closeNotifications();
                    bidx.common.notifyRedirect();

                    var url = "/company/" + companyId + "?rs=true";

                    document.location.href = url;
                }
            }
        ,   error:          function( jqXhr )
            {
                params.error( jqXhr );

                bidx.common.closeNotifications();

                // If running as a slave app, notify the change via a callback
                //
                if ( callbacks )
                {
                    callbacks.error();
                }
            }
        };

        if ( companyId )
        {
            requestParams.companyId = companyId;
        }

        bidx.api.call(
            "company.save"
        ,   requestParams
        );
    };

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
    var navigate = function( options )
    {
        // Set the slave mode when the navigate is called with a slaveApp mode
        //
        if ( typeof options.slaveApp !== "undefined" )
        {
            slaveApp = options.slaveApp;
        }

        // Register callbacks
        //
        if ( options.callbacks )
        {
            callbacks =
            {
                success:    options.callbacks.success   || function() {}
            ,   ready:      options.callbacks.ready     || function() {}
            ,   error:      options.callbacks.error     || function() {}
            ,   saving:     options.callbacks.saving    || function() {}
            };
        }

        switch( options.requestedState )
        {
            case "edit":
                bidx.utils.log( "EditCompany::AppRouter::edit", options.id, options.section );

                var updateHash      = false
                ,   isId            = ( options.id && options.id.match( /^\d+$/ ) )
                ;

                if ( options.id && !isId )
                {
                    options.section = options.id;
                    options.id      = companyId;

                    updateHash = true;
                }

                if ( !( state === "edit" && options.id === companyId ))
                {
                    companyId        = options.id;
                    state           = "edit";

                    $element.show();
                    _showView( "load" );

                    // Make sure the i18n translations for this app are available before initing
                    //
                    bidx.i18n.load( [ "__global", appName ] )
                        .done( function()
                        {
                            _init( function()
                            {
                                // When callbacks is defined all callbacks exist
                                //
                                if ( callbacks )
                                {
                                    callbacks.ready();
                                }
                            });
                        } );
                }

                if ( updateHash )
                {
                    var hash = "editCompany/" + options.id;

                    if ( options.section )
                    {
                         hash += "/" + options.section;
                    }

                    return hash;
                }
            break;

            case "create":
                bidx.utils.log( "EditCompany::AppRouter::create" );

                companyId   = null;
                state       = "create";

                $element.show();

                // Make sure the i18n translations for this app are available before initing
                //
                bidx.i18n.load( [ "__global", appName ] )
                    .done( function()
                    {
                        _init( function()
                        {
                            // When callbacks is defined all callbacks exist
                            //
                            if ( callbacks )
                            {
                                callbacks.ready();
                            }
                        } );
                    } );
            break;
        }
    };

    var reset = function()
    {
        state       = null;
        slaveApp    = null;
        callbacks   = null;

        bidx.common.removeAppWithPendingChanges( appName );
    };

    // Expose
    //
    var exports =
    {
        navigate:                   navigate
    ,   $element:                   $element
    ,   reset:                      reset
    ,   save:                       save

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

    window.bidx.company = exports;
} ( jQuery ));
