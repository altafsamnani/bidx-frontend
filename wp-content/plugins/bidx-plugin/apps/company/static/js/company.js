;( function( $ )
{
    "use strict";

    var $element        = $( "#editCompany" )
    ,   $controls       = $( ".editControls" )
    ,   $views          = $element.find( ".view" )

        // Select all the elements in this app scope that have class names containing js-mode-
        // this will be used for toggling UI elements between the standalone and slave state
        //
    ,   $appModeItems   = $element.find( "[class*=js-mode-]" )

    ,   $editForm       = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets       = $element.find( ".snippets" )

    ,   $toggles                            = $element.find( ".toggle" ).hide()
    ,   $toggleRegistered                   = $element.find( "[name='registered']"                          )
    ,   $toggleHaveEmployees                = $element.find( "[name='haveEmployees']"                       )

    ,   $btnSave
    ,   $btnCancel

        // Profile picture
        //
    ,   $logoControl                        = $editForm.find( ".logo-control"                               )
    ,   $logoContainer                      = $logoControl.find( ".logoContainer"                           )
    ,   $btnChangeLogo                      = $logoControl.find( "a[href$='changeLogo']"                    )
    ,   $changeLogoModal                    = $logoControl.find( ".changeLogoModal"                         )

    ,   $currentAddressMap                  = $editForm.find( ".currentAddressMap"                          )
    ,   $currentAddressCountry              = $editForm.find( "[name='statutoryAddress.country']"           )
    ,   $currentAddressCityTown             = $editForm.find( "[name='statutoryAddress.cityTown']"          )
    ,   $currentAddressPostalCode           = $editForm.find( "[name='statutoryAddress.postalCode']"        )
    ,   $currentAddressStreet               = $editForm.find( "[name='statutoryAddress.street']"            )
    ,   $currentAddressStreetNumber         = $editForm.find( "[name='statutoryAddress.streetNumber']"      )
    ,   $currentAddressCoordinates          = $editForm.find( "[name='statutoryAddress.coordinates']"       )
    ,   $legalFormBusiness                  = $editForm.find( "[name='legalFormBusiness']"                  )

    ,   $btnAddCountryOperationSpecifics    = $editForm.find( "[href$='#addCountryOperationSpecifics']"     )
    ,   $countryOperationSpecificsContainer = $editForm.find( ".countryOperationSpecificsContainer"         )

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
    ,   currentAddressMapOptions = {}
    ,   currentAddressMap
    ,   geocoder
    ,   geocodeTimer    = null
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

    // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup()
    {
        _snippets();
        _countryOperationSpecifics();


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

        $currentAddressCountry.bidx_chosen(
        {
            dataKey:            "country"
        ,   emptyValue:         bidx.i18n.i( "selectCountry", appName )
        });

        $legalFormBusiness.bidx_chosen(
        {
            dataKey:            "legalForm"
        ,   emptyValue:         bidx.i18n.i( "legalForm", appName )
        });

        bidx.data.getContext( "legalForm", function( err, legalForms )
        {
            var $noValue            = $( "<option value='' />" );

            $noValue.i18nText( "selectLegalFormBusiness", appName );
            $legalFormBusiness.append( $noValue );
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


        // populate the selectbox but do not convert to Chosen already because this breaks the rendering of the chosen plugin
        //
        bidx.data.getContext( "country", function( err, items )
        {
            if ( err )
            {
                bidx.utils.error( "Prepopulating the countryOperationSpecific selectbox in the snippet triggered an error" );
            }
            // populate country select box
            //
            bidx.utils.populateDropdown( snippets.$countryOperationSpecifics.find( "[name='country']" ), items );
        } );


        // Grab the snippets from the DOM
        //
        function _snippets()
        {
            snippets.$countryOperationSpecifics  = $snippets.children( ".countryOperationSpecificsItem"   ).remove();
        }

        // Initialize Country Operation Specifics
        //
        function _countryOperationSpecifics()
        {
            // Instantiate reflowrower on the countryOperationSpecifics container
            //
            $countryOperationSpecificsContainer.reflowrower();

            // Add an empty previous business block
            //
            $btnAddCountryOperationSpecifics.click( function( e )
            {
                e.preventDefault();

                _addCountryOperationSpecifics();
            } );

        }
    }

    // Add the snippet for another run Country Operation Specifics
    //
    var _addCountryOperationSpecifics = function( index, countryOperationSpecifics )
    {
        if ( !index )
        {
            index = $countryOperationSpecificsContainer.find( ".countryOperationSpecificsItem" ).length;
        }

        var $countryOperationSpecifics  = snippets.$countryOperationSpecifics.clone()
        ,   inputNamePrefix             = "countryOperationSpecifics[" + index + "]"
        ;


        if ( countryOperationSpecifics )
        {
            $.each( fields.countryOperationSpecifics, function( j, f )
            {
                var $input  = $countryOperationSpecifics.find( "[name='" + f + "']" )
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

                $countryOperationSpecifics.find( "[name='country']" ).trigger( "chosen:updated" );
                $countryOperationSpecifics.find( "[name='permitsLicencesObtained']" ).trigger( "chosen:updated" );
            } );
        }

        // Store the whole object in the DOM so we can later merge it with the changed values
        //
        $countryOperationSpecifics.data( "bidxData", countryOperationSpecifics );

        // Add it to the DOM
        //
        $countryOperationSpecificsContainer.reflowrower( "addItem", $countryOperationSpecifics );

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
            //
            switch ( baseName )
            {

                case "permitsLicencesObtained":
                    $input.rules( "add",
                    {
                        required:               true
                    } );
                    $input.bidx_chosen();
                break;
                case "country":
                    $input.rules( "add",
                    {
                        required:               true
                    } );

                    // enable the Chosen plugin
                    //
                    $input.bidx_chosen();
                break;

                default:
                    // NOOP
            }
        } );
    };

    // Handle toggle states of showing/hiding complete toggle blocks
    //
    var _handleToggleChange = function( show, group )
    {
        var fn = show ? "fadeIn" : "hide";

        $toggles.filter( ".toggle-" + group )[ fn ]();
    };

    $toggleRegistered.change( function( e )
    {
        var value   = $toggleRegistered.filter( ":checked" ).val();

        _handleToggleChange( value === "true", "registered" );
    } );

    $toggleHaveEmployees.change( function()
    {
        var value   = $toggleHaveEmployees.filter( ":checked" ).val();

        _handleToggleChange( value === "true", "haveEmployees" );
    } );



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

                    $logoContainer.data( "bidxData", file );
                    $logoContainer.html( $( "<img />", { "src": file.document, "class": "img-thumbnail"  } ) );

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
        var logo = bidx.utils.getValue( company, "logo", true )
        ,   _noLogo = function()
            {
                $logoContainer
                    .append( $( "<div />", { "class": "icons-rounded" } ) )
                    .find(".icons-rounded")
                    .append( $( "<i />", { "class": "fa fa-tasks text-primary-light" } ) )
                    ;
            }
        ,   _logoRemoved = function()
            {
                $logoContainer.append(  $( "<i />", { "class": "fa fa-question-circle document-icon" } ) );
                $logoContainer.append( $( "<p />", { "html": bidx.i18n.i( "docDeleted" ) } ) );
            }
        ,   _logoIsSet = function()
            {
                $logoContainer.data( "bidxData", logo[ 0 ] );
                $logoContainer.append( $( "<img />", { "src": logo[ 0 ].document, "class": "img-thumbnail" } ) );
            }
        ;

        // Creating a new Company always has the default logo icon
        //
        if ( state === "create" )
        {
            _noLogo();
        }

        // Editing an existing company has 3 different cases
        // No Logo is placed, Logo is placed, Logo has beed removed
        //
        if ( state === "edit" )
        {
            if ( logo && logo.length )
            {
                if ( logo[ 0 ].document )
                {
                    _logoIsSet();
                }
                else
                {
                    _logoRemoved();
                }
            }
            else
            {
                _noLogo();
            }
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

        // Now the nested objects
        //
        var countryOperationSpecifics = bidx.utils.getValue( company, "countryOperationSpecifics", true );

        if ( countryOperationSpecifics )
        {
            $.each( countryOperationSpecifics, function( i, item )
            {
                _addCountryOperationSpecifics( i, item );
            } );
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

        $currentAddressCountry.trigger( "chosen:updated" );
        $legalFormBusiness.trigger( "chosen:updated" );
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

            if ( f === "legalFormBusiness" ) {
                value  = bidx.utils.getElementValue( $input );
            }

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

            // Now collect the removed items, clear the properties and push them to the list so the API will delete them
            //
            if ( nest === "countryOperationSpecifics" )
            {
                var removedItems = $countryOperationSpecificsContainer.reflowrower( "getRemovedItems" );

                $.each( removedItems, function( idx, removedItem )
                {
                    var $removedItem    = $( removedItem )
                    ,   bidxData        = $removedItem.data( "bidxData" )
                    ;

                    if ( bidxData )
                    {
                        // Iterate over the properties and set all, but bidxMeta, to null
                        //
                        $.each( bidxData, function( prop )
                        {
                            if ( prop !== "bidxMeta" )
                            {
                                bidxData[ prop ] = null;
                            }
                        } );

                        item.push( bidxData );
                    }
                } );
            }

        } );

        // Fix the URL fields so they will be prefixed with http:// in case something valid was provided, but not having a protocol
        //
        if ( company.website )
        {
            company.website = bidx.utils.prefixUrlWithProtocol( company.website );
        }

        // Logo
        //
        var logo = $logoContainer.data( "bidxData" );
        bidx.utils.setValue( company, "logo", logo );
    };


    // This is the startpoint
    //
    var _init = function()
    {
        // Reset any state
        //
        $countryOperationSpecificsContainer.reflowrower( "empty" );
        $logoContainer.empty();

        // This is a bit of a hack so not to refactor the whole bunch
        // currently only when not running as a slave app these button are actually put inside the dom.
        //

        var cancelHref = companyId ? "/company/" + companyId : "/member";
        $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    });
        $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: cancelHref  });

        // Inject the save and button into the controls
        //
        if ( !slaveApp )
        {
            $controls.empty();

            $btnSave.i18nText( ( state === "create" ? "btnAddCompany" : "btnSaveCompany" ), appName );
            $btnCancel.i18nText( "btnCancel" );

            // Build up the gmaps for the current address
            bidx.common.loadGoogleMap( { callback:   _currentAddress } );




            // Wire the submit button which can be anywhere in the DOM
            //
            $btnSave.click( function( e )
            {
                e.preventDefault();

                $editForm.submit();
            } );

            $controls.append( $btnSave );
            $controls.append( $btnCancel );
        }

        // Setup form
        //
        var $validator = $editForm.validate(
        {
            ignore: ".chosen-search input, .search-field input"
        ,   rules:
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
                    // TODO: datepicker validation
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

                            bidx.common.removeValidationErrors();

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

        // Current address control
        //
        function _currentAddress ( )
        {
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
            };

            currentAddressMap       = new google.maps.Map( $currentAddressMap[ 0 ], currentAddressMapOptions );

            geocoder        = new google.maps.Geocoder();

            geocodeTimer    = null;


            $currentAddressCountry.change(      function() { _updateCurrentAddressMap();    } );
            $currentAddressCityTown.change(     function() { _updateCurrentAddressMap();    } );
            $currentAddressStreet.change(       function() { _updateCurrentAddressMap();    } );
            $currentAddressStreetNumber.change( function() { _updateCurrentAddressMap();    } );
            $currentAddressPostalCode.change(   function() { _updateCurrentAddressMap();    } );
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

            // Toggle the app mode item elements into the requested state
            //
            $appModeItems
                .hide()
                .filter( ".js-mode-" + ( slaveApp ? "slave" : "standalone" ) ).show()
            ;
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

        // Revert the app mode items back into their initial state of standalone
        //
        $appModeItems
            .hide()
            .filter( ".js-mode-standalone" ).show()
        ;

        bidx.common.removeAppWithPendingChanges( appName );
    };

    // Engage!
    //
    _oneTimeSetup();


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

    // Make sure we are in a clean state the first time we run
    //
    reset();

    window.bidx.company = exports;
} ( jQuery ));
