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

    ,   $logoControl                        = $editForm.find( ".logo-control" )
    ,   $logoContainer                      = $logoControl.find( ".logoContainer" )

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

    ,   countryOperationSpecifics:
        [
            'country'
        ,   'permitsLicencesObtained'
        ,   'companyTradeName'
        ]   // TODO: companyAddress
    };

    var countryOperationSpecificsCountryOptions =
    [
        {
        value: "AF",
        label: "Afghanistan"
        },
        {
        value: "AX",
        label: "Åland Islands"
        },
        {
        value: "AL",
        label: "Albania"
        },
        {
        value: "DZ",
        label: "Algeria"
        },
        {
        value: "AS",
        label: "American Samoa"
        },
        {
        value: "AD",
        label: "Andorra"
        },
        {
        value: "AO",
        label: "Angola"
        },
        {
        value: "AI",
        label: "Anguilla"
        },
        {
        value: "AQ",
        label: "Antarctica"
        },
        {
        value: "AG",
        label: "Antigua and Barbuda"
        },
        {
        value: "AR",
        label: "Argentina"
        },
        {
        value: "AM",
        label: "Armenia"
        },
        {
        value: "AW",
        label: "Aruba"
        },
        {
        value: "AU",
        label: "Australia"
        },
        {
        value: "AT",
        label: "Austria"
        },
        {
        value: "AZ",
        label: "Azerbaijan"
        },
        {
        value: "BS",
        label: "Bahamas"
        },
        {
        value: "BH",
        label: "Bahrain"
        },
        {
        value: "BD",
        label: "Bangladesh"
        },
        {
        value: "BB",
        label: "Barbados"
        },
        {
        value: "BY",
        label: "Belarus"
        },
        {
        value: "BE",
        label: "Belgium"
        },
        {
        value: "BZ",
        label: "Belize"
        },
        {
        value: "BJ",
        label: "Benin"
        },
        {
        value: "BM",
        label: "Bermuda"
        },
        {
        value: "BT",
        label: "Bhutan"
        },
        {
        value: "BO",
        label: "Bolivia"
        },
        {
        value: "BQ",
        label: "Bonaire"
        },
        {
        value: "BA",
        label: "Bosnia and Herzegovina"
        },
        {
        value: "BW",
        label: "Botswana"
        },
        {
        value: "BV",
        label: "Bouvet Island"
        },
        {
        value: "BR",
        label: "Brazil"
        },
        {
        value: "IO",
        label: "British Indian Ocean Territory"
        },
        {
        value: "VG",
        label: "British Virgin Islands"
        },
        {
        value: "BN",
        label: "Brunei"
        },
        {
        value: "BG",
        label: "Bulgaria"
        },
        {
        value: "BF",
        label: "Burkina Faso"
        },
        {
        value: "BI",
        label: "Burundi"
        },
        {
        value: "KH",
        label: "Cambodia"
        },
        {
        value: "CM",
        label: "Cameroon"
        },
        {
        value: "CA",
        label: "Canada"
        },
        {
        value: "CV",
        label: "Cape Verde"
        },
        {
        value: "KY",
        label: "Cayman Islands"
        },
        {
        value: "CF",
        label: "Central African Republic"
        },
        {
        value: "TD",
        label: "Chad"
        },
        {
        value: "CL",
        label: "Chile"
        },
        {
        value: "CN",
        label: "China"
        },
        {
        value: "CX",
        label: "Christmas Island"
        },
        {
        value: "CC",
        label: "Cocos Islands"
        },
        {
        value: "CO",
        label: "Colombia"
        },
        {
        value: "KM",
        label: "Comoros"
        },
        {
        value: "CG",
        label: "Congo"
        },
        {
        value: "CK",
        label: "Cook Islands"
        },
        {
        value: "CR",
        label: "Costa Rica"
        },
        {
        value: "CI",
        label: "Côte d'Ivoire"
        },
        {
        value: "HR",
        label: "Croatia"
        },
        {
        value: "CU",
        label: "Cuba"
        },
        {
        value: "CW",
        label: "Curaçao"
        },
        {
        value: "CY",
        label: "Cyprus"
        },
        {
        value: "CZ",
        label: "Czech Republic"
        },
        {
        value: "DK",
        label: "Denmark"
        },
        {
        value: "DJ",
        label: "Djibouti"
        },
        {
        value: "DM",
        label: "Dominica"
        },
        {
        value: "DO",
        label: "Dominican Republic"
        },
        {
        value: "EC",
        label: "Ecuador"
        },
        {
        value: "EG",
        label: "Egypt"
        },
        {
        value: "SV",
        label: "El Salvador"
        },
        {
        value: "GQ",
        label: "Equatorial Guinea"
        },
        {
        value: "ER",
        label: "Eritrea"
        },
        {
        value: "EE",
        label: "Estonia"
        },
        {
        value: "ET",
        label: "Ethiopia"
        },
        {
        value: "FK",
        label: "Falkland Islands"
        },
        {
        value: "FO",
        label: "Faroe Islands"
        },
        {
        value: "FJ",
        label: "Fiji"
        },
        {
        value: "FI",
        label: "Finland"
        },
        {
        value: "FR",
        label: "France"
        },
        {
        value: "GF",
        label: "French Guiana"
        },
        {
        value: "PF",
        label: "French Polynesia"
        },
        {
        value: "TF",
        label: "French Southern Territories"
        },
        {
        value: "GA",
        label: "Gabon"
        },
        {
        value: "GM",
        label: "Gambia"
        },
        {
        value: "GE",
        label: "Georgia"
        },
        {
        value: "DE",
        label: "Germany"
        },
        {
        value: "GH",
        label: "Ghana"
        },
        {
        value: "GI",
        label: "Gibraltar"
        },
        {
        value: "GR",
        label: "Greece"
        },
        {
        value: "GL",
        label: "Greenland"
        },
        {
        value: "GD",
        label: "Grenada"
        },
        {
        value: "GP",
        label: "Guadeloupe"
        },
        {
        value: "GU",
        label: "Guam"
        },
        {
        value: "GT",
        label: "Guatemala"
        },
        {
        value: "GG",
        label: "Guernsey"
        },
        {
        value: "GN",
        label: "Guinea"
        },
        {
        value: "GW",
        label: "Guinea-Bissau"
        },
        {
        value: "GY",
        label: "Guyana"
        },
        {
        value: "HT",
        label: "Haiti"
        },
        {
        value: "HM",
        label: "Heard Island And McDonald Islands"
        },
        {
        value: "HN",
        label: "Honduras"
        },
        {
        value: "HK",
        label: "Hong Kong"
        },
        {
        value: "HU",
        label: "Hungary"
        },
        {
        value: "IS",
        label: "Iceland"
        },
        {
        value: "IN",
        label: "India"
        },
        {
        value: "ID",
        label: "Indonesia"
        },
        {
        value: "IR",
        label: "Iran"
        },
        {
        value: "IQ",
        label: "Iraq"
        },
        {
        value: "IE",
        label: "Ireland"
        },
        {
        value: "IM",
        label: "Isle Of Man"
        },
        {
        value: "IL",
        label: "Israel"
        },
        {
        value: "IT",
        label: "Italy"
        },
        {
        value: "JM",
        label: "Jamaica"
        },
        {
        value: "JP",
        label: "Japan"
        },
        {
        value: "JE",
        label: "Jersey"
        },
        {
        value: "JO",
        label: "Jordan"
        },
        {
        value: "KZ",
        label: "Kazakhstan"
        },
        {
        value: "KE",
        label: "Kenya"
        },
        {
        value: "KI",
        label: "Kiribati"
        },
        {
        value: "KW",
        label: "Kuwait"
        },
        {
        value: "KG",
        label: "Kyrgyzstan"
        },
        {
        value: "LA",
        label: "Laos"
        },
        {
        value: "LV",
        label: "Latvia"
        },
        {
        value: "LB",
        label: "Lebanon"
        },
        {
        value: "LS",
        label: "Lesotho"
        },
        {
        value: "LR",
        label: "Liberia"
        },
        {
        value: "LY",
        label: "Libya"
        },
        {
        value: "LI",
        label: "Liechtenstein"
        },
        {
        value: "LT",
        label: "Lithuania"
        },
        {
        value: "LU",
        label: "Luxembourg"
        },
        {
        value: "MO",
        label: "Macao"
        },
        {
        value: "MK",
        label: "Macedonia"
        },
        {
        value: "MG",
        label: "Madagascar"
        },
        {
        value: "MW",
        label: "Malawi"
        },
        {
        value: "MY",
        label: "Malaysia"
        },
        {
        value: "MV",
        label: "Maldives"
        },
        {
        value: "ML",
        label: "Mali"
        },
        {
        value: "MT",
        label: "Malta"
        },
        {
        value: "MH",
        label: "Marshall Islands"
        },
        {
        value: "MQ",
        label: "Martinique"
        },
        {
        value: "MR",
        label: "Mauritania"
        },
        {
        value: "MU",
        label: "Mauritius"
        },
        {
        value: "YT",
        label: "Mayotte"
        },
        {
        value: "MX",
        label: "Mexico"
        },
        {
        value: "FM",
        label: "Micronesia"
        },
        {
        value: "MD",
        label: "Moldova"
        },
        {
        value: "MC",
        label: "Monaco"
        },
        {
        value: "MN",
        label: "Mongolia"
        },
        {
        value: "ME",
        label: "Montenegro"
        },
        {
        value: "MS",
        label: "Montserrat"
        },
        {
        value: "MA",
        label: "Morocco"
        },
        {
        value: "MZ",
        label: "Mozambique"
        },
        {
        value: "MM",
        label: "Myanmar"
        },
        {
        value: "NA",
        label: "Namibia"
        },
        {
        value: "NR",
        label: "Nauru"
        },
        {
        value: "NP",
        label: "Nepal"
        },
        {
        value: "NL",
        label: "Netherlands"
        },
        {
        value: "AN",
        label: "Netherlands Antilles"
        },
        {
        value: "NC",
        label: "New Caledonia"
        },
        {
        value: "NZ",
        label: "New Zealand"
        },
        {
        value: "NI",
        label: "Nicaragua"
        },
        {
        value: "NE",
        label: "Niger"
        },
        {
        value: "NG",
        label: "Nigeria"
        },
        {
        value: "NU",
        label: "Niue"
        },
        {
        value: "NF",
        label: "Norfolk Island"
        },
        {
        value: "KP",
        label: "North Korea"
        },
        {
        value: "MP",
        label: "Northern Mariana Islands"
        },
        {
        value: "NO",
        label: "Norway"
        },
        {
        value: "OM",
        label: "Oman"
        },
        {
        value: "PK",
        label: "Pakistan"
        },
        {
        value: "PW",
        label: "Palau"
        },
        {
        value: "PS",
        label: "Palestine"
        },
        {
        value: "PA",
        label: "Panama"
        },
        {
        value: "PG",
        label: "Papua New Guinea"
        },
        {
        value: "PY",
        label: "Paraguay"
        },
        {
        value: "PE",
        label: "Peru"
        },
        {
        value: "PH",
        label: "Philippines"
        },
        {
        value: "PN",
        label: "Pitcairn"
        },
        {
        value: "PL",
        label: "Poland"
        },
        {
        value: "PT",
        label: "Portugal"
        },
        {
        value: "PR",
        label: "Puerto Rico"
        },
        {
        value: "QA",
        label: "Qatar"
        },
        {
        value: "RE",
        label: "Reunion"
        },
        {
        value: "RO",
        label: "Romania"
        },
        {
        value: "RU",
        label: "Russia"
        },
        {
        value: "RW",
        label: "Rwanda"
        },
        {
        value: "BL",
        label: "Saint Barthélemy"
        },
        {
        value: "SH",
        label: "Saint Helena"
        },
        {
        value: "KN",
        label: "Saint Kitts And Nevis"
        },
        {
        value: "LC",
        label: "Saint Lucia"
        },
        {
        value: "MF",
        label: "Saint Martin"
        },
        {
        value: "PM",
        label: "Saint Pierre And Miquelon"
        },
        {
        value: "VC",
        label: "Saint Vincent And The Grenadines"
        },
        {
        value: "WS",
        label: "Samoa"
        },
        {
        value: "SM",
        label: "San Marino"
        },
        {
        value: "ST",
        label: "Sao Tome And Principe"
        },
        {
        value: "SA",
        label: "Saudi Arabia"
        },
        {
        value: "SN",
        label: "Senegal"
        },
        {
        value: "RS",
        label: "Serbia"
        },
        {
        value: "SC",
        label: "Seychelles"
        },
        {
        value: "SL",
        label: "Sierra Leone"
        },
        {
        value: "SG",
        label: "Singapore"
        },
        {
        value: "SX",
        label: "Sint Maarten (Dutch part)"
        },
        {
        value: "SK",
        label: "Slovakia"
        },
        {
        value: "SI",
        label: "Slovenia"
        },
        {
        value: "SB",
        label: "Solomon Islands"
        },
        {
        value: "SO",
        label: "Somalia"
        },
        {
        value: "ZA",
        label: "South Africa"
        },
        {
        value: "GS",
        label: "South Georgia And The South Sandwich Islands"
        },
        {
        value: "KR",
        label: "South Korea"
        },
        {
        value: "ES",
        label: "Spain"
        },
        {
        value: "LK",
        label: "Sri Lanka"
        },
        {
        value: "SD",
        label: "Sudan"
        },
        {
        value: "SR",
        label: "Suriname"
        },
        {
        value: "SJ",
        label: "Svalbard And Jan Mayen"
        },
        {
        value: "SZ",
        label: "Swaziland"
        },
        {
        value: "SE",
        label: "Sweden"
        },
        {
        value: "CH",
        label: "Switzerland"
        },
        {
        value: "SY",
        label: "Syria"
        },
        {
        value: "TW",
        label: "Taiwan"
        },
        {
        value: "TJ",
        label: "Tajikistan"
        },
        {
        value: "TZ",
        label: "Tanzania"
        },
        {
        value: "TH",
        label: "Thailand"
        },
        {
        value: "CD",
        label: "The Democratic Republic Of Congo"
        },
        {
        value: "TL",
        label: "Timor-Leste"
        },
        {
        value: "TG",
        label: "Togo"
        },
        {
        value: "TK",
        label: "Tokelau"
        },
        {
        value: "TO",
        label: "Tonga"
        },
        {
        value: "TT",
        label: "Trinidad and Tobago"
        },
        {
        value: "TN",
        label: "Tunisia"
        },
        {
        value: "TR",
        label: "Turkey"
        },
        {
        value: "TM",
        label: "Turkmenistan"
        },
        {
        value: "TC",
        label: "Turks And Caicos Islands"
        },
        {
        value: "TV",
        label: "Tuvalu"
        },
        {
        value: "VI",
        label: "U.S. Virgin Islands"
        },
        {
        value: "UG",
        label: "Uganda"
        },
        {
        value: "UA",
        label: "Ukraine"
        },
        {
        value: "AE",
        label: "United Arab Emirates"
        },
        {
        value: "GB",
        label: "United Kingdom"
        },
        {
        value: "US",
        label: "United States"
        },
        {
        value: "UM",
        label: "United States Minor Outlying Islands"
        },
        {
        value: "UY",
        label: "Uruguay"
        },
        {
        value: "UZ",
        label: "Uzbekistan"
        },
        {
        value: "VU",
        label: "Vanuatu"
        },
        {
        value: "VA",
        label: "Vatican"
        },
        {
        value: "VE",
        label: "Venezuela"
        },
        {
        value: "VN",
        label: "Vietnam"
        },
        {
        value: "WF",
        label: "Wallis And Futuna"
        },
        {
        value: "EH",
        label: "Western Sahara"
        },
        {
        value: "YE",
        label: "Yemen"
        },
        {
        value: "ZM",
        label: "Zambia"
        },
        {
        value: "ZW",
        label: "Zimbabwe"
        }
    ];

    var permitsLicencesObtainedOptions =
    [
        {
        value: "applicationNeeded",
        label: "Application needed"
        },
        {
        value: "permitnotrequired",
        label: "Permit not required"
        },
        {
        value: "permitobtained",
        label: "Permit obtained"
        },
        {
        value: "permitrequested",
        label: "Permit requested"
        }
    ];

    // Grab the snippets from the DOM
    //
    snippets.$countryOperationSpecifics  = $snippets.children( ".countryOperationSpecificsItem"   ).remove();

    // Populate the dropdowns with the values
    //
    var $countryOperationSpecificsCountry = snippets.$countryOperationSpecifics.find( "[name='country']" );
    $countryOperationSpecificsCountry.append( $( "<option value='' />" ).text( "Select the country" ));

    bidx.utils.populateDropdown( $countryOperationSpecificsCountry, countryOperationSpecificsCountryOptions );

    var $countryOperationSpecificsPermitsLicencesObtained = snippets.$countryOperationSpecifics.find( "[name='permitsLicencesObtained']" );
    $countryOperationSpecificsPermitsLicencesObtained.append( $( "<option value='' />" ).text( "Select the obtained licenses" ));

    bidx.utils.populateDropdown( $countryOperationSpecificsPermitsLicencesObtained, permitsLicencesObtainedOptions );


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

        var $countryOperationSpecifics = snippets.$countryOperationSpecifics.clone()
        ,   inputNamePrefix = "countryOperationSpecifics[" + index + "]"
        ;

        // Update all the input elements and prefix the names with the right index
        // So <input name="bla" /> from the snippet becomes <input name="foo[2].bla" />
        //
        $countryOperationSpecifics.find( "input, select, textarea" ).each( function( )
        {
            var $input = $( this );

            $input.prop( "name", inputNamePrefix + "." + $input.prop( "name" ) );
        } );

        if ( countryOperationSpecifics )
        {
            $.each( fields.countryOperationSpecifics, function( j, f )
            {
                var $input  = $countryOperationSpecifics.find( "[name='" + inputNamePrefix + "." + f + "']" )
                ,   value   = bidx.utils.getValue( countryOperationSpecifics, f )
                ;

                $input.each( function()
                {
                    bidx.utils.setElementValue( $( this ), value  );
                } );
            } );
        }

        $countryOperationSpecificsAccordion.append( $countryOperationSpecifics );
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

                bidx.common.notifyRedirect();

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
