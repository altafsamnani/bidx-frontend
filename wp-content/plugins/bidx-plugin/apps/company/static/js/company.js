$( document ).ready( function()
{
    var $element        = $( "#editCompany" )
    ,   $controls       = $( ".editControls" )
    ,   $views          = $element.find( ".view" )
    ,   $editForm       = $views.filter( ".viewEdit" ).find( "form" )
    ,   $snippets       = $element.find( ".snippets" )

    ,   $logoContainer              = $editForm.find( ".logoContainer" )

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
    ,   groupDomain
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

    var _setElementValue = function( $el, value )
    {
        var elType      = $el.attr( 'type' )
        ,   dataType    = $el.attr( 'data-type' )
        ,   dateObj
        ;

        if ( value === true )
        {
            value = "true";
        }
        else if ( value === false )
        {
            value = "false";
        }

        if ( dataType === "date" )
        {
            if ( value )
            {
                dateObj = bidx.utils.parseISODate( value );

                value = dateObj.m + "/" + dateObj.d + "/" + dateObj.y;
                $el.val( value );
            }

        }
        if ( elType )
        {
            switch( elType )
            {
                case 'radio':
                    // bewustte type-coercing for now
                    //
                    if ( $el.val() === value )
                    {
                        $el.prop( 'checked', true );
                    }
                    else
                    {
                        $el.prop( 'checked', false );
                    }
                break;

                case 'checkbox':
                    $el.prop( 'checked', !!value );
                break;

                case 'file':
                break;

                default:
                    $el.val( value || ( value === 0 ? "0" : "" ) );
            }
        }
        else if ( $el.is( 'input' ) || $el.is( 'select' ) || $el.is( 'textarea' ) )
        {
            $el.val( value || ( value === 0 ? '0' : '' ) );
        }
        else
        {
            $el.text( value || ( value === 0 ? '0' : '' ) );
        }
    };

    // Use the retrieved company object to populate the form and other screen elements
    //
    var _populateScreen = function()
    {
        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = bidx.utils.getValue( company, f )
            ;

            $input.each( function()
            {
                _setElementValue( $( this ), value );
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
        $editForm.find( "[name='domain']"       ).val( groupDomain );
        $editForm.find( "[name='companyId']"    ).val( companyId );

        // Now the nested objects
        //
        $.each( [ "statutoryAddress" ], function()
        {
            var nest    = this
            ,   items   = bidx.utils.getValue( company, nest, true )
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

                        $input.each( function()
                        {
                            _setElementValue( $( this ), value  );
                        } );
                    } );
                } );
            }
        } );

        _updateCurrentAddressMap();
    };


    // Convert the form values back into the company object
    //
    var _getFormValues = function()
    {
        var _getElementValue = function( $input )
        {
            var value
            ,   date
            ;

            switch ( $input.attr( 'data-type' ) )
            {
                // We need to get to ISO8601 => yyyy-mm-dd
                //
                case 'date':
                    date    = $input.datepicker( "getDate" );

                    if ( date )
                    {
                        value   = bidx.utils.getISODate( date );
                    }
                break;

                default:
                    switch ( $input.attr( "type" ) )
                    {
                        case "radio":
                            value = $input.filter( ":checked" ).val();
                        break;

                        case "checkbox":
                            value = $input.is( ":checked" ) ? $input.val() : null;
                        break;

                        default:
                            value = $input.val();
                    }
            }


            if ( value === "true" )
            {
                value = true;
            }
            else if ( value === "false" )
            {
                value = false;
            }

            return value;
        };

        $.each( fields._root, function( i, f )
        {
            var $input  = $editForm.find( "[name='" + f + "']" )
            ,   value   = _getElementValue( $input )
            ;

            bidx.utils.setValue( company, f, value );
        } );

        // Collect the nested objects
        //
        $.each( [ "statutoryAddress" ], function()
        {
            var nest    = this
            ,   i       = 0
            ;

            // TODO: make i itterate

            $.each( fields[ nest ], function( j, f )
            {
                var path    = nest + "[" + i + "]." + f
                ,   $input  = $editForm.find( "[name='" + path + "']" )
                ,   value   = _getElementValue( $input )
                ;

                var item = bidx.utils.getValue( company, nest, true );

                // When undefined, leave it untouched for now...
                //
                if ( item )
                {
                    if ( !item[ i ] )
                    {
                        item[ i ] = {};
                    }

                    bidx.utils.setValue( item[ i ], f, value );
                }
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

        $btnSave.text( "Save company" );
        $btnCancel.text( "Cancel" );

        $controls.append( $btnSave );
        $controls.append( $btnCancel );

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

            if ( $btnSave.hasClass( "disabled" ))
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


        // Fetch the company
        //
        bidx.api.call(
            "company.fetch"
        ,   {
                companyId:      companyId
            ,   groupDomain:    groupDomain
            ,   success:        function( response )
                {
                    company = response;

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
            groupDomain:    groupDomain
        ,   data:           company
        ,   success:        function( response )
            {
                bidx.utils.log( "company.save::success::response", response );

                var url = document.location.href.split( "#" ).shift();

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

    function _showMainState( s )
    {
        if ( s === "editCompany" )
        {
            $( "body" ).addClass( "bidx-edit" );
        }
        else
        {
            $( "body" ).removeClass( "bidx-edit" );
        }

        $mainStates.hide().filter( ".mainState" + s.charAt( 0 ).toUpperCase() + s.substr( 1 ) ).show();
    }

    // ROUTER
    //
    var state;

    // Router for main state
    //
    var AppRouter = Backbone.Router.extend(
    {
        routes: {
            'editCompany(/:id)(/:section)':    'edit'
        ,   'cancel':                       'show'
        ,   '*path':                        'show'
        }
    ,   edit:           function( id, section )
        {
            bidx.utils.log( "EditCompany::AppRouter::edit", id, section );

            _showMainState( "editCompany" );

            groupDomain = bidx.utils.getQueryParameter( "bidxGroupDomain" ) || bidx.utils.getValue( bidxConfig, "context.bidxGroupDomain" ) || bidx.utils.getGroupDomain();

            var newCompanyId
            ,   splatItems
            ,   updateHash      = false
            ,   isId            = ( id && id.match( /^\d+$/ ) )
            ;

            if ( id && !isId )
            {
                section = id;
                id      = companyId;

                updateHash = true;
            }

            if ( updateHash )
            {
                var hash = "editCompany/" + id;

                if ( section )
                {
                     hash += "/" + section;
                }

                this.navigate( hash );
            }

            if ( state === "edit" && id === companyId )
            {
                return;
            }

            companyId        = id;
            state           = "edit";

            $element.show();
            _showView( "load" );

            _init();
        }
    ,   show:           function( section )
        {
            bidx.utils.log( "EditCompany::AppRouter::show", section );

            if ( state === "show" )
            {
                return;
            }

            state = "show";

            $element.hide();

            _showMainState( "show" );

            $controls.empty();
        }
    } );

    var router = new AppRouter();
    Backbone.history.start();

    // Expose
    //
    var exports =
    {
        // START DEV API
        //
         _updateCurrentAddressMap:   _updateCurrentAddressMap
    ,   currentAddressMap:          currentAddressMap
        // END DEV API
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.company = exports;
} );
