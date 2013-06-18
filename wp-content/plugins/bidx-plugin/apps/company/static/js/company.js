( function( $ )
{
    var $element        = $( "#editCompany" )
    ,   $controls       = $( ".editControls" )
    ,   $views          = $element.find( ".view" )
    ,   $editForm       = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets       = $element.find( ".snippets" )

    ,   $toggles                    = $element.find( ".toggle" ).hide()
    ,   $toggleRegistered           = $element.find( "[name='registered']"      )
    ,   $toggleHaveEmployees        = $element.find( "[name='haveEmployees']"   )

    ,   $logoControl                = $editForm.find( ".logo-control" )
    ,   $logoContainer              = $logoControl.find( ".logoContainer" )

    ,   $currentAddressMap          = $editForm.find( ".currentAddressMap" )
    ,   $currentAddressCountry      = $editForm.find( "[name='statutoryAddress.country']"         )
    ,   $currentAddressCityTown     = $editForm.find( "[name='statutoryAddress.cityTown']"        )
    ,   $currentAddressPostalCode   = $editForm.find( "[name='statutoryAddress.postalCode']"      )
    ,   $currentAddressStreet       = $editForm.find( "[name='statutoryAddress.street']"          )
    ,   $currentAddressStreetNumber = $editForm.find( "[name='statutoryAddress.streetNumber']"    )
    ,   $currentAddressCoordinates  = $editForm.find( "[name='statutoryAddress.coordinates']"     )

        // Main object for holding the company
        //
    ,   company
    ,   companyId
    ,   companyProfileId
    ,   bidx            = window.bidx
    ,   snippets        = {}
    ;

    var $mainStates     = $( ".mainState" )
    ;

    // Form fields
    //
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
    };

    // Grab the snippets from the DOM
    //

    // Disable disabled links
    //
    $element.delegate( "a.disabled", "click", function( e )
    {
        e.preventDefault();
    } );

    $toggleRegistered.change( function( e )
    {
        var value   = $toggleRegistered.filter( "[checked]" ).val()
        ,   fn      = value === "true" ? "show" : "hide"
        ;

        $toggles.filter( ".toggleRegistered" )[ fn ]();
    } );

    $toggleHaveEmployees.change( function()
    {
        var value   = $toggleHaveEmployees.filter( "[checked]" ).val()
        ,   fn      = value === "true" ? "show" : "hide"
        ;

        $toggles.filter( ".toggleHaveEmployees" )[ fn ]();
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

        // Profile picture is 'special'
        //
        var logo = bidx.utils.getValue( company, "logo", true );

        if ( logo && logo.length && logo[ 0 ].document )
        {
            $logoContainer.append( $( "<img />", { "src": logo[ 0 ].document  } ));
        }

        // Setup the hidden fields used in the file upload
        //
        $editForm.find( "[name='domain']"           ).val( bidx.common.groupDomain );
        $editForm.find( "[name='companyProfileId']" ).val( companyProfileId );

        // Now the nested objects, NOT ARRAY's
        //
        $.each( [ "statutoryAddress" ], function()
        {
            var nest    = this
            ,   item    = bidx.utils.getValue( company, nest )
            ;

            if ( item )
            {
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
            }
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
            ,   value   = $input.is( ":visible" ) ? bidx.utils.getElementValue( $input ) : ""
            ;

            bidx.utils.setValue( company, f, value );
        } );

        // Collect the nested objects
        //
        $.each( [ "statutoryAddress" ], function()
        {
            var nest    = this
            ,   item    = bidx.utils.getValue( company, nest )
            ;

            if ( !item )
            {
                item = {};
                bidx.utils.setValue( company, nest, item );
            }

            // TODO: make i itterate

            $.each( fields[ nest ], function( j, f )
            {
                var path    = nest + "." + f
                ,   $input  = $editForm.find( "[name='" + path + "']" )
                ,   value   = $input.is( ":visible" ) ? bidx.utils.getElementValue( $input ) : ""
                ;

                bidx.utils.setValue( item, f, value );
            } );
        } );
    };

    // This is the startpoint
    //
    var _init = function()
    {
        // Reset any state
        //
        $controls.empty();

        $logoContainer.empty();

        // Inject the save and button into the controls
        //
        var $btnSave    = $( "<a />", { class: "btn btn-primary disabled", href: "#save"    })
        ,   $btnCancel  = $( "<a />", { class: "btn btn-primary disabled", href: "#cancel"  })
        ;

        $btnSave.text( state === "create" ? "Add company" : "Save company" );
        $btnCancel.text( "Cancel" );

        $controls.append( $btnSave );

        if ( state === "edit" )
        {
            $controls.append( $btnCancel );
            $logoControl.show();
        }
        else
        {
            $logoControl.hide();
        }

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
                        company = response;

                        // Set the global memberProfileId for convenience reasons
                        //
                        companyProfileId = bidx.utils.getValue( company, "bidxEntityId" );


                        bidx.utils.log( "bidx::company", company );

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

                        _showError( "Something went wrong while retrieving the company: " + status );
                    }
                }
            );
        }
        else
        {
            company = {};

            _populateScreen();

            $btnSave.removeClass( "disabled" );
            $btnCancel.removeClass( "disabled" );

            _showView( "edit" );
        }
    };

    // Try to save the company to the API
    //
    var _save = function( params )
    {
        if ( !company )
        {
            return;
        }

        // Inform the API we are updating the company profile
        //
        company.bidxEntityType = "bidxCompany";

        // Update the company object
        //
        _getFormValues();

        var requestParams =
        {
            groupDomain:    bidx.common.groupDomain
        ,   data:           company
        ,   success:        function( response )
            {
                bidx.utils.log( "company.save::success::response", response );

                if ( state === "create" )
                {
                    companyId = bidx.utils.getValue( response, "data.ownerId" );
                }

                var url = "/company/" + companyId;

                document.location.href = url;
            }
        ,   error:          function( jqXhr )
            {
                params.error( jqXhr );
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
        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();
    }

    // ROUTER
    //
    var state;

    var navigate = function( requestedState, section, id, cb )
    {
        switch( requestedState )
        {
            case "edit":
                bidx.utils.log( "EditCompany::AppRouter::edit", id, section );

                var updateHash      = false
                ,   isId            = ( id && id.match( /^\d+$/ ) )
                ;

                if ( id && !isId )
                {
                    section = id;
                    id      = companyId;

                    updateHash = true;
                }

                if ( !( state === "edit" && id === companyId ))
                {
                    companyId        = id;
                    state           = "edit";

                    $element.show();
                    _showView( "load" );

                    _init();
                }

                if ( updateHash )
                {
                    var hash = "editCompany/" + id;

                    if ( section )
                    {
                         hash += "/" + section;
                    }

                    return hash;
                }
            break;

            case "create":
                bidx.utils.log( "EditCompany::AppRouter::create" );

                companyId   = null;
                state       = "create";

                $element.show();
                _init();
            break;
        }
    };

    var reset = function()
    {
        state = null;
    };

    // Expose
    //
    var exports =
    {
        navigate:                   navigate
    ,   $element:                   $element
    ,   reset:                      reset

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
